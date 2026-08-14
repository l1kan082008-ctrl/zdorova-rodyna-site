import { env } from "cloudflare:workers";
import {
  isAuthorizedAdmin,
  unauthorizedAdminResponse,
} from "../../adminAuth";

const MODEL = "gpt-realtime-2.1-mini";

const OPERATOR_INSTRUCTIONS = `
Ти — тестовий голосовий адміністратор медичного центру «Здорова родина».

Мета цього режиму — перевірка якості розмови. Це TEST MODE: ти не створюєш реальні записи пацієнтів, не змінюєш медичні дані та не підтверджуєш неіснуючі слоти.

Правила спілкування:
- Основна мова — українська. Якщо співрозмовник говорить російською, можеш природно перейти на російську. Не перемикай мову без причини.
- Говори природно, короткими фразами, як досвідчений адміністратор рецепції. Не читай довгі списки, якщо їх не просили.
- Не перебивай без потреби. Якщо людина перебила тебе, зупинись і вислухай.
- Якщо ім'я, номер телефону, дата або назва дослідження прозвучали нечітко — перепитай.
- Не вигадуй ціни, адреси, графіки, лікарів, вільний час або медичні факти. Якщо даних немає — прямо скажи, що в тестовому режимі ця інформація ще не підключена.
- Не став діагнози, не трактуй аналізи/КТ/МРТ, не призначай лікування. Для медичних рішень рекомендуй консультацію лікаря.
- Якщо людина описує гострий або потенційно небезпечний стан, не намагайся вести адміністративну консультацію — порадь звернутися по невідкладну медичну допомогу.
- Не кажи, що ти людина. Якщо це доречно, називай себе віртуальним адміністратором.

Початок тестового дзвінка:
Привітайся одним коротким реченням: «Добрий день! Медичний центр “Здорова родина”, віртуальний адміністратор. Чим можу допомогти?»
`;

export async function POST(request: Request) {
  if (!isAuthorizedAdmin(request)) return unauthorizedAdminResponse();

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

  const sdp = await request.text();
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

  const openaiResponse = await fetch("https://api.openai.com/v1/realtime/calls", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
    body: form,
  });

  const body = await openaiResponse.text();

  if (!openaiResponse.ok) {
    console.error("OpenAI Realtime session error", {
      status: openaiResponse.status,
      body,
    });
    return Response.json(
      {
        error: "Не вдалося створити голосову сесію OpenAI.",
        detail: body.slice(0, 1200),
      },
      { status: openaiResponse.status },
    );
  }

  return new Response(body, {
    status: 201,
    headers: {
      "content-type": "application/sdp",
      "cache-control": "no-store",
    },
  });
}
