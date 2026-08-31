import {
  isAuthorizedAdmin,
  unauthorizedAdminResponse,
} from "../../adminAuth";
import { readBoundedJson } from "@/lib/requestBody";

type ToolRequest = {
  name?: string;
  arguments?: unknown;
};

type JsonRecord = Record<string, unknown>;

const TEST_SERVICES = [
  {
    id: "mri-brain",
    name: "МРТ головного мозку",
    aliases: ["мрт голови", "мрт головы", "мрт мозку", "мрт мозга"],
    testPrice: 3000,
    branches: ["Рівне · Стельмаха 18М"],
  },
  {
    id: "ct-chest",
    name: "КТ органів грудної клітки",
    aliases: ["кт грудної клітки", "кт грудной клетки", "кт легень", "кт легких"],
    testPrice: 2200,
    branches: [
      "Рівне · Стельмаха 18М",
      "Рівне · Олександра Олеся 13",
      "Костопіль · Грушевського 4",
    ],
  },
  {
    id: "urologist",
    name: "Консультація уролога",
    aliases: ["уролог", "прием уролога", "прийом уролога"],
    testPrice: 700,
    branches: ["Рівне · Стельмаха 18М"],
  },
] as const;

function asRecord(value: unknown): JsonRecord {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as JsonRecord)
    : {};
}

function readString(record: JsonRecord, key: string) {
  const value = record[key];
  return typeof value === "string" ? value.trim() : "";
}

function normalize(value: string) {
  return value.toLocaleLowerCase("uk-UA").replace(/[’']/g, "'").trim();
}

function findService(query: string) {
  const target = normalize(query);
  if (!target) return null;

  return (
    TEST_SERVICES.find((service) => {
      const candidates = [service.name, service.id, ...service.aliases].map(normalize);
      return candidates.some(
        (candidate) => candidate.includes(target) || target.includes(candidate),
      );
    }) ?? null
  );
}

function kyivDateAfter(days: number) {
  const date = new Date(Date.now() + days * 86_400_000);
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Kyiv",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function findTestSlots(args: JsonRecord) {
  const serviceQuery = readString(args, "service");
  const branch = readString(args, "branch");
  const requestedDate = readString(args, "date") || kyivDateAfter(1);
  const service = findService(serviceQuery);

  if (!service) {
    return {
      ok: false,
      mode: "TEST_ONLY",
      error: "TEST_SERVICE_NOT_FOUND",
      message: "У тестовій базі такої послуги немає.",
    };
  }

  if (branch && !service.branches.some((item) => normalize(item).includes(normalize(branch)))) {
    return {
      ok: false,
      mode: "TEST_ONLY",
      error: "TEST_BRANCH_NOT_AVAILABLE",
      service: service.name,
      availableBranches: service.branches,
    };
  }

  const times = service.id === "urologist"
    ? ["09:20", "11:40", "15:20", "17:00"]
    : ["08:40", "10:20", "14:40", "17:20"];

  return {
    ok: true,
    mode: "TEST_ONLY",
    service: service.name,
    date: requestedDate,
    branch: branch || service.branches[0],
    slots: times,
    disclaimer: "Це тестові слоти. Вони не пов'язані з реальним розкладом медцентру.",
  };
}

export async function POST(request: Request) {
  if (!(await isAuthorizedAdmin(request))) return unauthorizedAdminResponse();

  let payload: ToolRequest;
  try {
    payload = (await readBoundedJson(request, 32 * 1024)) as ToolRequest;
  } catch {
    return Response.json({ error: "Некоректний JSON." }, { status: 400 });
  }

  const name = payload.name?.trim() ?? "";
  const args = asRecord(payload.arguments);

  if (name === "lookup_test_service") {
    const query = readString(args, "query");
    const service = findService(query);

    if (!service) {
      return Response.json({
        ok: false,
        mode: "TEST_ONLY",
        error: "TEST_SERVICE_NOT_FOUND",
        availableServices: TEST_SERVICES.map((item) => item.name),
      });
    }

    return Response.json({
      ok: true,
      mode: "TEST_ONLY",
      service: service.name,
      testPrice: service.testPrice,
      currency: "UAH",
      branches: service.branches,
      disclaimer: "Ціна тестова і не є актуальним прайсом медцентру.",
    });
  }

  if (name === "find_test_slots") {
    return Response.json(findTestSlots(args));
  }

  if (name === "create_test_appointment") {
    const patientName = readString(args, "patient_name");
    const phone = readString(args, "phone");
    const serviceQuery = readString(args, "service");
    const date = readString(args, "date");
    const time = readString(args, "time");
    const branch = readString(args, "branch");
    const service = findService(serviceQuery);

    if (!patientName || !phone || !service || !date || !time) {
      return Response.json({
        ok: false,
        mode: "TEST_ONLY",
        error: "MISSING_REQUIRED_FIELDS",
        required: ["patient_name", "phone", "service", "date", "time"],
      });
    }

    return Response.json({
      ok: true,
      mode: "TEST_ONLY",
      appointment: {
        reference: `TEST-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
        patientName,
        phone,
        service: service.name,
        branch: branch || service.branches[0],
        date,
        time,
      },
      disclaimer: "Запис тестовий. Він не збережений у реальній системі медцентру.",
    });
  }

  return Response.json(
    { error: `Невідомий тестовий інструмент: ${name || "(порожньо)"}` },
    { status: 400 },
  );
}
