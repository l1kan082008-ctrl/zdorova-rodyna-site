"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import AdminNavigation from "../AdminNavigation";
import {
  branchServiceCatalog,
  type BranchServiceId,
  type CenterLocation,
} from "../../contacts/locationData";

type ApiPayload = { locations?: CenterLocation[]; location?: CenterLocation; error?: string };

const emptyLocation = (): CenterLocation => ({
  id: "",
  city: "Рівне",
  name: "Нове відділення",
  type: "Медичне відділення",
  address: "Нова адреса",
  fullAddress: "м. Рівне, нова адреса",
  description: "",
  hours: ["Пн–Пт · 08:00–18:00"],
  phone: "+38 (067) 671-44-44",
  services: ["laboratory"],
  coordinates: { lat: 50.6199, lng: 26.2516 },
  gallery: [],
});

function galleryToText(gallery: CenterLocation["gallery"]) {
  return gallery.map((item) => [item.src, item.alt, item.caption].join(" | ")).join("\n");
}

function parseGallery(value: string): CenterLocation["gallery"] {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [src = "", alt = "", caption = ""] = line.split("|").map((part) => part.trim());
      return { src, alt, caption };
    })
    .filter((item) => item.src);
}

export default function LocationsAdminPage() {
  const [locations, setLocations] = useState<CenterLocation[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [draft, setDraft] = useState<CenterLocation | null>(null);
  const [galleryText, setGalleryText] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [creating, setCreating] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const selected = useMemo(
    () => locations.find((location) => location.id === selectedId) ?? null,
    [locations, selectedId],
  );

  useEffect(() => {
    fetch("/api/admin/locations")
      .then(async (response) => {
        const payload = (await response.json()) as ApiPayload;
        if (!response.ok || !payload.locations) throw new Error(payload.error || "Не вдалося завантажити відділення.");
        setLocations(payload.locations);
        setSelectedId(payload.locations[0]?.id ?? "");
      })
      .catch((reason) => setError(reason instanceof Error ? reason.message : "Сталася помилка."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selected) return;
    setDraft(structuredClone(selected));
    setGalleryText(galleryToText(selected.gallery));
    setSaved(false);
    setError("");
  }, [selected]);

  const update = <K extends keyof CenterLocation>(key: K, value: CenterLocation[K]) => {
    setSaved(false);
    setDraft((current) => (current ? { ...current, [key]: value } : current));
  };

  const toggleService = (serviceId: BranchServiceId) => {
    if (!draft) return;
    const next = draft.services.includes(serviceId)
      ? draft.services.filter((id) => id !== serviceId)
      : [...draft.services, serviceId];
    update("services", next);
  };

  const save = async () => {
    if (!draft) return;
    setSaving(true);
    setError("");
    try {
      const response = await fetch("/api/admin/locations", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...draft, gallery: parseGallery(galleryText) }),
      });
      const payload = (await response.json()) as ApiPayload;
      if (!response.ok || !payload.location) throw new Error(payload.error || "Не вдалося зберегти відділення.");
      setLocations((current) => current.map((item) => (item.id === payload.location!.id ? payload.location! : item)));
      setDraft(payload.location);
      setGalleryText(galleryToText(payload.location.gallery));
      setSaved(true);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Сталася помилка.");
    } finally {
      setSaving(false);
    }
  };

  const create = async () => {
    setCreating(true);
    setError("");
    try {
      const response = await fetch("/api/admin/locations", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(emptyLocation()),
      });
      const payload = (await response.json()) as ApiPayload;
      if (!response.ok || !payload.location) throw new Error(payload.error || "Не вдалося створити відділення.");
      setLocations((current) => [...current, payload.location!]);
      setSelectedId(payload.location.id);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Сталася помилка.");
    } finally {
      setCreating(false);
    }
  };

  const remove = async () => {
    if (!draft || !confirm(`Видалити відділення «${draft.address}»?`)) return;
    setSaving(true);
    setError("");
    try {
      const response = await fetch(`/api/admin/locations?id=${encodeURIComponent(draft.id)}`, { method: "DELETE" });
      const payload = (await response.json()) as ApiPayload;
      if (!response.ok) throw new Error(payload.error || "Не вдалося видалити відділення.");
      const remaining = locations.filter((item) => item.id !== draft.id);
      setLocations(remaining);
      setSelectedId(remaining[0]?.id ?? "");
      setDraft(null);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Сталася помилка.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="admin-locations-page">
      <header className="admin-topbar">
        <Link href="/contacts">← До контактів</Link>
        <AdminNavigation current="locations" />
      </header>

      <section className="admin-intro admin-locations-intro">
        <span>Контакти</span>
        <h1>Відділення та доступні послуги</h1>
        <p>Створюйте нові пункти, редагуйте адресу, графік, послуги, карту, фотографії та відео.</p>
      </section>

      {error ? <p className="admin-error">{error}</p> : null}
      {loading ? <p className="admin-loading">Завантаження…</p> : null}

      {!loading ? (
        <section className="admin-editor-layout">
          <aside className="admin-editor-sidebar">
            <button className="admin-create-button" type="button" onClick={create} disabled={creating}>
              {creating ? "Створюємо…" : "+ Додати відділення"}
            </button>
            {locations.map((location) => (
              <button
                key={location.id}
                type="button"
                className={`admin-location-list-item${location.id === selectedId ? " is-active" : ""}`}
                onClick={() => setSelectedId(location.id)}
              >
                <strong>{location.address}</strong>
                <span>{location.city} · {location.type}</span>
              </button>
            ))}
          </aside>

          {draft ? (
            <article className="admin-editor-panel">
              <div className="admin-editor-heading">
                <div><span>Редагування пункту</span><h2>{draft.address}</h2></div>
                <span className="admin-save-state" aria-live="polite">{saved ? "Збережено" : ""}</span>
              </div>

              <div className="admin-editor-grid">
                <label>Місто<input value={draft.city} onChange={(event) => update("city", event.target.value)} /></label>
                <label>Назва<input value={draft.name} onChange={(event) => update("name", event.target.value)} /></label>
                <label>Тип пункту<input value={draft.type} onChange={(event) => update("type", event.target.value)} /></label>
                <label>Коротка адреса<input value={draft.address} onChange={(event) => update("address", event.target.value)} /></label>
                <label className="admin-field-wide">Повна адреса<input value={draft.fullAddress} onChange={(event) => update("fullAddress", event.target.value)} /></label>
                <label>Орієнтир<input value={draft.landmark ?? ""} onChange={(event) => update("landmark", event.target.value)} /></label>
                <label>Телефон<input value={draft.phone} onChange={(event) => update("phone", event.target.value)} /></label>
                <label>Широта<input type="number" step="0.000001" value={draft.coordinates.lat} onChange={(event) => update("coordinates", { ...draft.coordinates, lat: Number(event.target.value) })} /></label>
                <label>Довгота<input type="number" step="0.000001" value={draft.coordinates.lng} onChange={(event) => update("coordinates", { ...draft.coordinates, lng: Number(event.target.value) })} /></label>
                <label className="admin-field-wide">Опис<textarea value={draft.description} onChange={(event) => update("description", event.target.value)} /></label>
                <label className="admin-field-wide">Графік роботи <small>Кожен рядок відображається окремо</small><textarea value={draft.hours.join("\n")} onChange={(event) => update("hours", event.target.value.split("\n"))} /></label>
              </div>

              <fieldset className="admin-service-fieldset">
                <legend>Доступні послуги</legend>
                <div className="admin-service-grid">
                  {branchServiceCatalog.map((service) => (
                    <button key={service.id} type="button" aria-pressed={draft.services.includes(service.id)} className={`admin-service-option${draft.services.includes(service.id) ? " is-selected" : ""}`} onClick={() => toggleService(service.id)}>
                      <span aria-hidden="true">{draft.services.includes(service.id) ? "✓" : "+"}</span>{service.label}
                    </button>
                  ))}
                </div>
              </fieldset>

              <div className="admin-editor-grid admin-media-fields">
                <label className="admin-field-wide">Фотографії <small>Один рядок: шлях | опис | підпис</small><textarea value={galleryText} onChange={(event) => { setGalleryText(event.target.value); setSaved(false); }} placeholder="/images/location.jpg | Вхід до пункту | Центральний вхід" /></label>
                <label className="admin-field-wide">Посилання на відео<input value={draft.videoUrl ?? ""} onChange={(event) => update("videoUrl", event.target.value)} placeholder="https://…" /></label>
              </div>

              <footer className="admin-editor-actions">
                <button className="admin-danger-button" type="button" onClick={remove} disabled={saving}>Видалити</button>
                <button className="admin-save-button" type="button" onClick={save} disabled={saving}>{saving ? "Зберігаємо…" : "Зберегти зміни"}</button>
              </footer>
            </article>
          ) : <div className="admin-editor-empty">Додайте перше відділення.</div>}
        </section>
      ) : null}
    </main>
  );
}
