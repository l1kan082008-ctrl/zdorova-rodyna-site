import { isAuthorizedAdmin, unauthorizedAdminResponse } from "../adminAuth";
import {
  createManagedPriceItem,
  deleteManagedPriceItem,
  listManagedPriceItems,
  updateManagedPriceItem,
} from "../../prices/priceStore";
import {
  categoryOptions,
  type CategoryId,
} from "../../../prices/priceData";
import {
  DEFAULT_CITO_SURCHARGE,
  usesDefaultCitoPolicy,
} from "../../../prices/citoPolicy";
import { readBoundedJson } from "@/lib/requestBody";
import { changedSnapshotFields, recordContentRevision } from "../revisions/revisionStore";

const categoryIds = new Set(categoryOptions.map((category) => category.id));

function parseValues(payload: Record<string, unknown>) {
  const name = typeof payload.name === "string" ? payload.name.trim() : "";
  const category =
    typeof payload.category === "string" ? payload.category : "";
  const categoryLabel =
    typeof payload.categoryLabel === "string"
      ? payload.categoryLabel.trim()
      : "";
  const amount = Number(payload.amount);
  const defaultCitoEnabled = categoryIds.has(category as CategoryId)
    ? usesDefaultCitoPolicy(category as CategoryId)
    : false;
  const citoAvailable = defaultCitoEnabled || payload.citoAvailable === true;
  const citoSurcharge = citoAvailable ? DEFAULT_CITO_SURCHARGE : 0;
  const turnaround =
    typeof payload.turnaround === "string"
      ? payload.turnaround.trim()
      : "Уточнюйте";
  const aliases = Array.isArray(payload.aliases)
    ? payload.aliases
        .filter((value): value is string => typeof value === "string")
        .map((value) => value.trim())
        .filter(Boolean)
    : [];

  if (
    !name ||
    !categoryLabel ||
    !categoryIds.has(category as CategoryId) ||
    !Number.isFinite(amount) ||
    amount < 0
  ) {
    throw new Error("Заповніть назву, категорію та коректну вартість");
  }
  return {
    name,
    category: category as CategoryId,
    categoryLabel,
    amount: Math.round(amount),
    turnaround: turnaround || "Уточнюйте",
    citoAvailable,
    citoSurcharge: citoAvailable ? citoSurcharge : 0,
    aliases,
    isActive: payload.isActive !== false,
    sortOrder: Math.max(0, Math.round(Number(payload.sortOrder) || 0)),
  };
}

export async function GET(request: Request) {
  if (!(await isAuthorizedAdmin(request))) return unauthorizedAdminResponse();
  try {
    return Response.json({ items: await listManagedPriceItems() });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Не вдалося завантажити прайс" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  if (!(await isAuthorizedAdmin(request))) return unauthorizedAdminResponse();
  try {
    const values = parseValues((await readBoundedJson(request, 64 * 1024)) as Record<string, unknown>);
    await createManagedPriceItem(values);
    return Response.json({ items: await listManagedPriceItems() });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Не вдалося додати позицію" },
      { status: 400 },
    );
  }
}

export async function PATCH(request: Request) {
  if (!(await isAuthorizedAdmin(request))) return unauthorizedAdminResponse();
  try {
    const payload = (await readBoundedJson(request, 64 * 1024)) as Record<string, unknown>;
    const id = typeof payload.id === "string" ? payload.id.trim() : "";
    if (!id) throw new Error("Не вказано позицію прайса");
    const existing = (await listManagedPriceItems()).find((item) => item.id === id);
    if (!existing) return Response.json({ error: "Позицію не знайдено" }, { status: 404 });
    const values = parseValues(payload);
    await recordContentRevision({
      entityType: "price",
      entityId: existing.id,
      entityLabel: existing.name,
      action: "update",
      snapshot: existing as unknown as Record<string, unknown>,
      changedFields: changedSnapshotFields(
        existing as unknown as Record<string, unknown>,
        { ...existing, ...values } as unknown as Record<string, unknown>,
      ),
    });
    const updated = await updateManagedPriceItem(id, values);
    if (!updated) {
      return Response.json({ error: "Позицію не знайдено" }, { status: 404 });
    }
    return Response.json({ items: await listManagedPriceItems() });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Не вдалося зберегти позицію" },
      { status: 400 },
    );
  }
}

export async function DELETE(request: Request) {
  if (!(await isAuthorizedAdmin(request))) {
    return unauthorizedAdminResponse();
  }

  try {
    const payload = (await readBoundedJson(request, 64 * 1024).catch(() => ({}))) as Record<string, unknown>;
    const id = typeof payload.id === "string" ? payload.id.trim() : "";
    if (!id) {
      throw new Error("Не вказано позицію прайса");
    }

    const existing = (await listManagedPriceItems()).find((item) => item.id === id);
    if (!existing) return Response.json({ error: "Позицію не знайдено" }, { status: 404 });
    await recordContentRevision({
      entityType: "price",
      entityId: existing.id,
      entityLabel: existing.name,
      action: "delete",
      snapshot: existing as unknown as Record<string, unknown>,
      changedFields: ["record"],
    });

    const deleted = await deleteManagedPriceItem(id);
    if (!deleted) {
      return Response.json({ error: "Позицію не знайдено" }, { status: 404 });
    }

    return Response.json({ items: await listManagedPriceItems() });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Не вдалося видалити позицію" },
      { status: 400 },
    );
  }
}
