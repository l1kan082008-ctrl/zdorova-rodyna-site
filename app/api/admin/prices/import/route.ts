import { isAuthorizedAdmin, unauthorizedAdminResponse } from "../../adminAuth";
import {
  importManagedPriceItems,
  listManagedPriceItems,
  type ImportedPriceItem,
} from "../../../prices/priceStore";
import {
  categoryOptions,
  type CategoryId,
} from "../../../../prices/priceData";

const MAX_ITEMS = 5000;
const categoryById = new Map(
  categoryOptions.map((category) => [category.id, category]),
);

function parseItem(value: unknown, index: number): ImportedPriceItem {
  if (!value || typeof value !== "object") {
    throw new Error(`Рядок ${index + 1}: некоректний формат.`);
  }
  const payload = value as Record<string, unknown>;
  const id = typeof payload.id === "string" ? payload.id.trim().slice(0, 200) : "";
  const name = typeof payload.name === "string" ? payload.name.trim() : "";
  const category =
    typeof payload.category === "string" ? payload.category : "";
  const categoryOption = categoryById.get(category as CategoryId);
  const amount = Number(payload.amount);
  const turnaround =
    typeof payload.turnaround === "string"
      ? payload.turnaround.trim()
      : "Уточнюйте";
  const aliases = Array.isArray(payload.aliases)
    ? payload.aliases
        .filter((alias): alias is string => typeof alias === "string")
        .map((alias) => alias.trim().slice(0, 200))
        .filter(Boolean)
        .slice(0, 30)
    : [];

  if (!name || name.length > 500) {
    throw new Error(`Рядок ${index + 1}: перевірте назву послуги.`);
  }
  if (!categoryOption) {
    throw new Error(`Рядок ${index + 1}: невідома категорія.`);
  }
  if (!Number.isFinite(amount) || amount < 0 || amount > 10_000_000) {
    throw new Error(`Рядок ${index + 1}: некоректна ціна.`);
  }
  if (turnaround.length > 200) {
    throw new Error(`Рядок ${index + 1}: термін виконання надто довгий.`);
  }

  return {
    id: id || undefined,
    name,
    category: category as CategoryId,
    categoryLabel: categoryOption.label,
    amount: Math.round(amount),
    turnaround: turnaround || "Уточнюйте",
    aliases,
    isActive: payload.isActive !== false,
    sortOrder: Math.min(
      1_000_000,
      Math.max(0, Math.round(Number(payload.sortOrder) || index)),
    ),
  };
}

export async function POST(request: Request) {
  if (!isAuthorizedAdmin(request)) return unauthorizedAdminResponse();

  try {
    const payload = (await request.json()) as { items?: unknown[] };
    if (!Array.isArray(payload.items) || !payload.items.length) {
      throw new Error("Файл не містить позицій для імпорту.");
    }
    if (payload.items.length > MAX_ITEMS) {
      throw new Error(`За один раз можна імпортувати до ${MAX_ITEMS} позицій.`);
    }

    const items = payload.items.map(parseItem);
    const seen = new Set<string>();
    for (const item of items) {
      const key = `${item.category}::${item.name
        .trim()
        .toLocaleLowerCase("uk-UA")}`;
      if (seen.has(key)) {
        throw new Error(`Позиція «${item.name}» дублюється у файлі.`);
      }
      seen.add(key);
    }

    const summary = await importManagedPriceItems(items);
    return Response.json({
      items: await listManagedPriceItems(),
      summary,
    });
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Не вдалося імпортувати прайс.",
      },
      { status: 400 },
    );
  }
}
