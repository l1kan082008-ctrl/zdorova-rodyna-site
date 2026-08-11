import { env } from "cloudflare:workers";
import {
  branchServiceCatalog,
  centerLocations,
  type BranchServiceId,
} from "../../contacts/locationData";

type BranchServiceRow = {
  location_id: string;
  service_ids: string;
};

const serviceIds = new Set<BranchServiceId>(
  branchServiceCatalog.map((service) => service.id),
);

const createBranchServicesTable = `
  CREATE TABLE IF NOT EXISTS branch_services (
    location_id TEXT PRIMARY KEY,
    service_ids TEXT NOT NULL DEFAULT '[]',
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )
`;

function normalizeServices(value: unknown): BranchServiceId[] {
  if (!Array.isArray(value)) return [];
  return Array.from(
    new Set(
      value.filter(
        (service): service is BranchServiceId =>
          typeof service === "string" && serviceIds.has(service as BranchServiceId),
      ),
    ),
  );
}

function parseServices(value: string): BranchServiceId[] {
  try {
    return normalizeServices(JSON.parse(value));
  } catch {
    return [];
  }
}

export async function ensureBranchServicesTable() {
  await env.DB.prepare(createBranchServicesTable).run();
}

export async function listBranchServices() {
  await ensureBranchServicesTable();
  const result = await env.DB.prepare(
    "SELECT location_id, service_ids FROM branch_services",
  ).all<BranchServiceRow>();
  const stored = new Map(
    result.results.map((row) => [row.location_id, parseServices(row.service_ids)]),
  );

  return Object.fromEntries(
    centerLocations.map((location) => [
      location.id,
      stored.get(location.id) ?? location.services,
    ]),
  ) as Record<string, BranchServiceId[]>;
}

export async function updateBranchServices(
  locationId: string,
  services: unknown,
) {
  const location = centerLocations.find((item) => item.id === locationId);
  if (!location) throw new Error("Відділення не знайдено");

  const normalized = normalizeServices(services);
  if (normalized.length === 0) {
    throw new Error("Оберіть хоча б одну послугу для цього відділення.");
  }

  await ensureBranchServicesTable();
  await env.DB.prepare(
    `INSERT INTO branch_services (location_id, service_ids, updated_at)
     VALUES (?, ?, CURRENT_TIMESTAMP)
     ON CONFLICT(location_id) DO UPDATE SET
       service_ids = excluded.service_ids,
       updated_at = CURRENT_TIMESTAMP`,
  )
    .bind(locationId, JSON.stringify(normalized))
    .run();

  return listBranchServices();
}
