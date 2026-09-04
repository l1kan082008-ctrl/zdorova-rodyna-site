import { readBoundedJson } from "@/lib/requestBody";
import { isAuthorizedAdmin, unauthorizedAdminResponse } from "../adminAuth";
import { createBanner, listBanners, updateBanner } from "../../banners/bannerStore";
import { createDoctor, getDoctorById, updateDoctor } from "../../doctors/doctorStore";
import { createLocation, listLocations, updateLocation } from "../../locations/locationStore";
import {
  createManagedPriceItem,
  listManagedPriceItems,
  updateManagedPriceItem,
  type ManagedPriceItem,
} from "../../prices/priceStore";
import {
  createManagedService,
  listManagedServices,
  updateManagedService,
  type ManagedService,
} from "../../services/serviceStore";
import type { PromoSlide } from "../../../components/promoData";
import type { CenterLocation } from "../../../contacts/locationData";
import type { DoctorPatientGroup, DoctorSchedule } from "../../../doctors/doctorData";
import type { CategoryId } from "../../../prices/priceData";
import {
  getContentRevision,
  listContentRevisions,
  parseContentEntityType,
  recordContentRevision,
  type ContentEntityType,
} from "./revisionStore";

type RestoreRequest = {
  entityType?: unknown;
  entityId?: unknown;
  revisionId?: unknown;
};

function requiredId(value: unknown, label: string) {
  const id = typeof value === "string" ? value.trim() : "";
  if (!id || id.length > 160) throw new Error(`Не вказано ${label}.`);
  return id;
}

async function getCurrentSnapshot(entityType: ContentEntityType, entityId: string) {
  switch (entityType) {
    case "banner":
      return (await listBanners()).find((item) => item.id === entityId) ?? null;
    case "doctor":
      return await getDoctorById(entityId);
    case "service":
      return (await listManagedServices({ includeInactive: true }))
        .find((item) => item.id === entityId) ?? null;
    case "location":
      return (await listLocations()).find((item) => item.id === entityId) ?? null;
    case "price":
      return (await listManagedPriceItems()).find((item) => item.id === entityId) ?? null;
  }
}

function doctorValues(snapshot: Record<string, unknown>) {
  return {
    name: String(snapshot.name ?? "").trim(),
    specialty: String(snapshot.specialty ?? "").trim(),
    experienceYears: typeof snapshot.experienceYears === "number"
      ? Math.max(0, Math.round(snapshot.experienceYears))
      : null,
    consultationPrice: typeof snapshot.consultationPrice === "number"
      ? Math.min(100_000, Math.max(0, Math.round(snapshot.consultationPrice)))
      : null,
    branch: String(snapshot.branch ?? "").trim(),
    description: String(snapshot.description ?? "").trim(),
    biography: String(snapshot.biography ?? "").trim(),
    patientGroups: (Array.isArray(snapshot.patientGroups) ? snapshot.patientGroups : [])
      .filter((group): group is DoctorPatientGroup => group === "adults" || group === "children"),
    schedule: (snapshot.schedule && typeof snapshot.schedule === "object"
      ? snapshot.schedule
      : {}) as DoctorSchedule,
  };
}

function priceValues(snapshot: Record<string, unknown>) {
  return {
    name: String(snapshot.name ?? "").trim(),
    category: String(snapshot.category ?? "") as CategoryId,
    categoryLabel: String(snapshot.categoryLabel ?? "").trim(),
    amount: Math.max(0, Math.round(Number(snapshot.amount) || 0)),
    turnaround: String(snapshot.turnaround ?? "Уточнюйте").trim() || "Уточнюйте",
    citoAvailable: snapshot.citoAvailable === true,
    citoSurcharge: Math.max(0, Math.round(Number(snapshot.citoSurcharge) || 0)),
    aliases: (Array.isArray(snapshot.aliases) ? snapshot.aliases : [])
      .filter((alias): alias is string => typeof alias === "string"),
    isActive: snapshot.isActive !== false,
    sortOrder: Math.max(0, Math.round(Number(snapshot.sortOrder) || 0)),
  };
}

async function restoreSnapshot(
  entityType: ContentEntityType,
  entityId: string,
  snapshot: Record<string, unknown>,
) {
  const current = await getCurrentSnapshot(entityType, entityId);

  switch (entityType) {
    case "banner": {
      const values = {
        ...(snapshot as Partial<PromoSlide>),
        id: entityId,
        imageKey: (current as PromoSlide | null)?.imageKey,
      };
      return current ? updateBanner(entityId, values) : createBanner(values);
    }
    case "doctor": {
      const values = doctorValues(snapshot);
      if (!values.name || !values.specialty) throw new Error("Збережена версія лікаря неповна.");
      if (!current) await createDoctor({ id: entityId, name: values.name, specialty: values.specialty });
      await updateDoctor(entityId, values);
      return getDoctorById(entityId);
    }
    case "service": {
      const values = {
        ...(snapshot as Partial<ManagedService>),
        id: entityId,
        imageKey: (current as ManagedService | null)?.imageKey ?? null,
      };
      return current ? updateManagedService(entityId, values) : createManagedService(values);
    }
    case "location": {
      const values = { ...(snapshot as Partial<CenterLocation>), id: entityId };
      return current ? updateLocation(entityId, values) : createLocation(values);
    }
    case "price": {
      const values = priceValues(snapshot);
      if (!values.name || !values.categoryLabel) throw new Error("Збережена версія прайса неповна.");
      if (current) {
        await updateManagedPriceItem(entityId, values);
      } else {
        await createManagedPriceItem(values, { id: entityId, sortOrder: values.sortOrder });
      }
      return (await listManagedPriceItems()).find((item) => item.id === entityId) as ManagedPriceItem | undefined;
    }
  }
}

export async function GET(request: Request) {
  if (!(await isAuthorizedAdmin(request))) return unauthorizedAdminResponse();
  try {
    const url = new URL(request.url);
    const entityType = parseContentEntityType(url.searchParams.get("entityType"));
    const entityId = requiredId(url.searchParams.get("entityId"), "запис");
    return Response.json({ revisions: await listContentRevisions(entityType, entityId) });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Не вдалося завантажити історію." },
      { status: 400 },
    );
  }
}

export async function POST(request: Request) {
  if (!(await isAuthorizedAdmin(request))) return unauthorizedAdminResponse();
  try {
    const payload = (await readBoundedJson(request, 32 * 1024)) as RestoreRequest;
    const entityType = parseContentEntityType(payload.entityType);
    const entityId = requiredId(payload.entityId, "запис");
    const revisionId = requiredId(payload.revisionId, "версію");
    const stored = await getContentRevision(entityType, entityId, revisionId);
    if (!stored) return Response.json({ error: "Версію не знайдено." }, { status: 404 });

    const current = await getCurrentSnapshot(entityType, entityId);
    if (current) {
      await recordContentRevision({
        entityType,
        entityId,
        entityLabel: stored.revision.entityLabel,
        action: "restore",
        snapshot: current as unknown as Record<string, unknown>,
        changedFields: ["restore"],
      });
    }

    const restored = await restoreSnapshot(entityType, entityId, stored.snapshot);
    return Response.json({ ok: true, restored });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Не вдалося відновити версію." },
      { status: 400 },
    );
  }
}
