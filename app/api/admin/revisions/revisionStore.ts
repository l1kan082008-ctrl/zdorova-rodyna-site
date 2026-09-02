import "server-only";

import { env } from "cloudflare:workers";

export const contentEntityTypes = [
  "banner",
  "doctor",
  "service",
  "location",
  "price",
] as const;

export type ContentEntityType = (typeof contentEntityTypes)[number];
export type ContentRevisionAction = "update" | "delete" | "restore";

export type ContentRevision = {
  id: string;
  entityType: ContentEntityType;
  entityId: string;
  entityLabel: string;
  action: ContentRevisionAction;
  changedFields: string[];
  createdAt: number;
};

type ContentRevisionRow = {
  id: string;
  entity_type: string;
  entity_id: string;
  entity_label: string;
  action: string;
  snapshot_json: string;
  changed_fields_json: string;
  created_at: number;
};

const MAX_REVISIONS_PER_ENTITY = 20;
const MAX_SNAPSHOT_BYTES = 512 * 1024;
const validEntityTypes = new Set<string>(contentEntityTypes);

function database() {
  return (env as unknown as { DB: D1Database }).DB;
}

export function parseContentEntityType(value: unknown): ContentEntityType {
  const entityType = typeof value === "string" ? value.trim() : "";
  if (!validEntityTypes.has(entityType)) {
    throw new Error("Невідомий тип запису історії.");
  }
  return entityType as ContentEntityType;
}

function requiredIdentifier(value: unknown, field: string) {
  const identifier = typeof value === "string" ? value.trim() : "";
  if (!identifier || identifier.length > 160) {
    throw new Error(`Некоректне поле «${field}».`);
  }
  return identifier;
}

function normalizeChangedFields(fields: string[]) {
  return Array.from(new Set(fields.map((field) => field.trim()).filter(Boolean))).slice(0, 40);
}

function parseStringArray(value: string) {
  try {
    const parsed = JSON.parse(value) as unknown;
    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === "string")
      : [];
  } catch {
    return [];
  }
}

function rowToRevision(row: ContentRevisionRow): ContentRevision {
  return {
    id: row.id,
    entityType: parseContentEntityType(row.entity_type),
    entityId: row.entity_id,
    entityLabel: row.entity_label,
    action: ["update", "delete", "restore"].includes(row.action)
      ? row.action as ContentRevisionAction
      : "update",
    changedFields: parseStringArray(row.changed_fields_json),
    createdAt: Number(row.created_at),
  };
}

export async function recordContentRevision(input: {
  entityType: ContentEntityType;
  entityId: string;
  entityLabel: string;
  action: ContentRevisionAction;
  snapshot: Record<string, unknown>;
  changedFields?: string[];
}) {
  const entityId = requiredIdentifier(input.entityId, "ідентифікатор");
  const entityLabel = String(input.entityLabel || "Без назви").trim().slice(0, 240);
  const snapshotJson = JSON.stringify(input.snapshot);
  if (new TextEncoder().encode(snapshotJson).byteLength > MAX_SNAPSHOT_BYTES) {
    throw new Error("Запис завеликий для безпечного збереження історії.");
  }

  await database().prepare(`
    INSERT INTO admin_content_revisions (
      id, entity_type, entity_id, entity_label, action,
      snapshot_json, changed_fields_json, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    crypto.randomUUID(),
    input.entityType,
    entityId,
    entityLabel,
    input.action,
    snapshotJson,
    JSON.stringify(normalizeChangedFields(input.changedFields ?? [])),
    Date.now(),
  ).run();

  await database().prepare(`
    DELETE FROM admin_content_revisions
    WHERE id IN (
      SELECT id FROM admin_content_revisions
      WHERE entity_type = ? AND entity_id = ?
      ORDER BY created_at DESC, id DESC
      LIMIT -1 OFFSET ?
    )
  `).bind(input.entityType, entityId, MAX_REVISIONS_PER_ENTITY).run();
}

export async function listContentRevisions(
  entityType: ContentEntityType,
  entityId: string,
) {
  const result = await database().prepare(`
    SELECT id, entity_type, entity_id, entity_label, action,
           snapshot_json, changed_fields_json, created_at
    FROM admin_content_revisions
    WHERE entity_type = ? AND entity_id = ?
    ORDER BY created_at DESC, id DESC
    LIMIT ?
  `).bind(entityType, requiredIdentifier(entityId, "ідентифікатор"), MAX_REVISIONS_PER_ENTITY)
    .all<ContentRevisionRow>();
  return result.results.map(rowToRevision);
}

export async function getContentRevision(
  entityType: ContentEntityType,
  entityId: string,
  revisionId: string,
) {
  const row = await database().prepare(`
    SELECT id, entity_type, entity_id, entity_label, action,
           snapshot_json, changed_fields_json, created_at
    FROM admin_content_revisions
    WHERE id = ? AND entity_type = ? AND entity_id = ?
  `).bind(
    requiredIdentifier(revisionId, "версія"),
    entityType,
    requiredIdentifier(entityId, "ідентифікатор"),
  ).first<ContentRevisionRow>();

  if (!row) return null;
  let snapshot: Record<string, unknown>;
  try {
    const parsed = JSON.parse(row.snapshot_json) as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      throw new Error("invalid snapshot");
    }
    snapshot = parsed as Record<string, unknown>;
  } catch {
    throw new Error("Збережена версія пошкоджена.");
  }

  return { revision: rowToRevision(row), snapshot };
}

export function changedSnapshotFields(
  current: Record<string, unknown>,
  next: Record<string, unknown>,
) {
  return Array.from(new Set([...Object.keys(current), ...Object.keys(next)]))
    .filter((key) => JSON.stringify(current[key]) !== JSON.stringify(next[key]));
}
