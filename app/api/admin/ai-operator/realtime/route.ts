import { env } from "@/lib/runtimeEnv";
import {
  isAuthorizedAdmin,
  unauthorizedAdminResponse,
} from "../../adminAuth";
import { readBoundedText, requestBodyErrorResponse } from "@/lib/requestBody";
import { checkPublicSubmissionRateLimit, isSameOriginSubmission } from "@/lib/publicSubmissionSecurity";

const MODEL = "gpt-realtime-2.1-mini";

const OPERATOR_INSTRUCTIONS = `
Ти — тестовий голосовий адміністратор медичного центру «Здорова родина».

Мета цього режиму — перевірка якості розмови та роботи інструментів. Це TEST MODE: ти не створюєш реальні записи пацієнтів, не змінюєш медичні дані та не підтверджуєш реальний розклад.

Правила спілкування:
- Основна мова — українська. Якщо співрозмовник говорить російською, можеш природно перейти на російську. Не перемикай мову без причини.
- Говори природно, короткими фразами, як досвідчений адміністратор рецепції. Не читай довгі списки, якщо їх не просили.
- Не перебивай без потреби. Якщо людина перебила тебе, зупинись і вислухай.
- Якщо ім'я, номер телефону, дата або назва дослідження прозвучали нечітко — перепитай.
- Не вигадуй ціни, адреси, графіки, лікарів або вільний час.
- Якщо запитують ціну, філію або доступність тестової послуги, використовуй lookup_test_service.
- Якщо запитують вільний час, використовуй find_test_slots. Не називай слот, якого не повернув інструмент.
- Якщо людина хоче записатися, спочатку з'ясуй ім'я, телефон, послугу, дату та час. Потім використовуй create_test_appointment.
- Після успішного create_test_appointment прямо скажи, що це тестовий запис і він не потрапив у реальну систему.
- Дані lookup_test_service і find_test_slots також тестові. Не видавай їх за актуальний прайс або реальний розклад.
- Не став діагнози, не трактуй аналізи/КТ/МРТ, не призначай лікування. Для медичних рішень рекомендуй консультацію лікаря.
- Якщо людина описує гострий або потенційно небезпечний стан, не намагайся вести адміністративну консультацію — порадь звернутися по невідкладну медичну допомогу.
- Не кажи, що ти людина. Якщо це доречно, називай себе віртуальним адміністратором.

Початок тестового дзвінка:
Привітайся одним коротким реченням: «Добрий день! Медичний центр “Здорова родина”, віртуальний адміністратор. Чим можу допомогти?»
`;

const TOOLS = [
  {
    type: "function",
    name: "lookup_test_service",
    description:
      "Знайти послугу в тестовій базі, її тестову ціну та доступні тестові відділення. Використовуй замість припущень про ціну або філію.",
    parameters: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Назва послуги словами пацієнта.",
        },
      },
      required: ["query"],
      additionalProperties: false,
    },
  },
  {
    type: "function",
    name: "find_test_slots",
    description:
      "Знайти тестові вільні слоти для послуги. Результат не є реальним розкладом.",
    parameters: {
      type: "object",
      properties: {
        service: {
          type: "string",
          description: "Послуга, для якої потрібен час.",
        },
        date: {
          type: "string",
          description: "Бажана дата у форматі YYYY-MM-DD, якщо відома.",
        },
        branch: {
          type: "string",
          description: "Бажане відділення, якщо пацієнт його назвав.",
        },
      },
      required: ["service"],
      additionalProperties: false,
    },
  },
  {
    type: "function",
    name: "create_test_appointment",
    description:
      "Створити лише тестове підтвердження запису після того, як пацієнт погодив послугу, дату і час та повідомив ім'я і телефон.",
    parameters: {
      type: "object",
      properties: {
        patient_name: { type: "string", description: "Ім'я тестового пацієнта." },
        phone: { type: "string", description: "Тестовий номер телефону пацієнта." },
        service: { type: "string", description: "Обрана послуга." },
        date: { type: "string", description: "Дата YYYY-MM-DD." },
        time: { type: "string", description: "Час HH:MM." },
        branch: { type: "string", description: "Обране відділення, якщо відоме." },
      },
      required: ["patient_name", "phone", "service", "date", "time"],
      additionalProperties: false,
    },
  },
] as const;

export async function POST(request: Request) {
  if (!(await isAuthorizedAdmin(request))) return unauthorizedAdminResponse();
  if (!isSameOriginSubmission(request)) {
    return Response.json({ error: "Запит відхилено." }, { status: 403 });
  }

  const rateLimit = await checkPublicSubmissionRateLimit(request, {
    scope: "admin-ai-realtime",
    maxAttempts: 12,
    windowMs: 10 * 60 * 1000,
    blockMs: 30 * 60 * 1000,
  });
  if (!rateLimit.allowed) {
    return Response.json(
      { error: rateLimit.configured ? "Забагато спроб. Спробуйте пізніше." : "Сервіс тимчасово недоступний." },
      {
        status: rateLimit.configured ? 429 : 503,
        headers: {
          "cache-control": "no-store",
          "retry-after": String(rateLimit.retryAfter),
        },
      },
    );
  }

  const runtimeEnv = env as unknown as { OPENAI_API_KEY?: string };
  const apiKey = runtimeEnv.OPENAI_API_KEY?.trim();

  if (!apiKey) {
    return Response.json(
      {
        error:
          "OPENAI_API_KEY не налаштований. Додайте його як секрет середовища перед тестом голосового оператора.",
      },
      { status: 503 },
    );
  }

  let sdp: string;
  try {
    sdp = await readBoundedText(request, 64 * 1024, "application/sdp");
  } catch (error) {
    return requestBodyErrorResponse(error, "Некоректний WebRTC SDP-запит.")
      ?? Response.json({ error: "Некоректний WebRTC SDP-запит." }, { status: 400 });
  }
  if (!sdp.trim()) {
    return Response.json({ error: "Порожній WebRTC SDP offer." }, { status: 400 });
  }

  const form = new FormData();
  form.set("sdp", new Blob([sdp], { type: "application/sdp" }), "offer.sdp");
  form.set(
    "session",
    new Blob(
      [
        JSON.stringify({
          type: "realtime",
          model: MODEL,
          output_modalities: ["audio"],
          instructions: OPERATOR_INSTRUCTIONS,
          max_output_tokens: 900,
          tool_choice: "auto",
          tools: TOOLS,
          audio: {
            input: {
              noise_reduction: { type: "near_field" },
              transcription: {
                model: "gpt-4o-mini-transcribe",
              },
              turn_detection: {
                type: "server_vad",
                create_response: true,
                interrupt_response: true,
              },
            },
            output: {
              voice: "marin",
              speed: 1.02,
            },
          },
        }),
      ],
      { type: "application/json" },
    ),
    "session.json",
  );

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15_000);
  let openaiResponse: Response;
  try {
    openaiResponse = await fetch("https://api.openai.com/v1/realtime/calls", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      body: form,
      signal: controller.signal,
    });
  } catch (error) {
    const incidentId = crypto.randomUUID();
    console.error(JSON.stringify({
      event: "openai_realtime_request_failed",
      incidentId,
      error: error instanceof Error ? error.name : "unknown",
    }));
    return Response.json(
      { error: "Не вдалося створити голосову сесію OpenAI.", incidentId },
      { status: 502, headers: { "cache-control": "no-store" } },
    );
  } finally {
    clearTimeout(timeout);
  }

  if (!openaiResponse.ok) {
    const incidentId = crypto.randomUUID();
    console.error(JSON.stringify({
      event: "openai_realtime_upstream_rejected",
      incidentId,
      status: openaiResponse.status,
      requestId: openaiResponse.headers.get("x-request-id"),
    }));
    await openaiResponse.body?.cancel();
    return Response.json(
      { error: "Не вдалося створити голосову сесію OpenAI.", incidentId },
      { status: 502, headers: { "cache-control": "no-store" } },
    );
  }

  return new Response(openaiResponse.body, {
    status: 201,
    headers: {
      "content-type": "application/sdp",
      "cache-control": "no-store",
    },
  });
}
