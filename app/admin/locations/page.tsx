"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  branchServiceCatalog,
  type BranchServiceId,
  type CenterLocation,
} from "../../contacts/locationData";
import styles from "./locations.module.css";

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
    <main className={styles.page}>
      <header className={styles.pageHeader}>
        <div>
          <span className={styles.eyebrow}>Відділення</span>
          <h1>Керуйте відділеннями</h1>
          <p>Адреси, графік, доступні послуги та медіа — в одному місці.</p>
        </div>
        <Link className={styles.siteLink} href="/contacts">Переглянути на сайті <span aria-hidden="true">↗</span></Link>
      </header>

      {error ? <p className={styles.error} role="alert">{error}</p> : null}
      {loading ? <div className={styles.loading}>Завантажуємо відділення…</div> : null}

      {!loading ? (
        <section className={styles.workspace}>
          <aside className={styles.locationPanel}>
            <div className={styles.locationPanelHeader}>
              <div>
                <strong>Усі відділення</strong>
                <span>{locations.length} {locations.length === 1 ? "пункт" : "пунктів"}</span>
              </div>
              <button className={styles.createButton} type="button" onClick={create} disabled={creating} aria-label="Додати відділення">
                <span aria-hidden="true">+</span>
                {creating ? "Створюємо" : "Додати"}
              </button>
            </div>
            <div className={styles.locationList}>
              {locations.map((location, index) => (
                <button
                  key={location.id}
                  type="button"
                  className={`${styles.locationItem}${location.id === selectedId ? ` ${styles.locationItemActive}` : ""}`}
                  onClick={() => setSelectedId(location.id)}
                >
                  <span className={styles.locationNumber}>{String(index + 1).padStart(2, "0")}</span>
                  <span className={styles.locationCopy}>
                    <strong>{location.address}</strong>
                    <small>{location.city} · {location.type}</small>
                  </span>
                  <span className={styles.locationArrow} aria-hidden="true">›</span>
                </button>
              ))}
            </div>
            {!locations.length ? (
              <div className={styles.emptyList}>
                <strong>Відділень ще немає</strong>
                <span>Створіть перший пункт кнопкою вище.</span>
              </div>
            ) : null}
          </aside>

          {draft ? (
            <article className={styles.editor}>
              <div className={styles.editorHeader}>
                <div>
                  <span className={styles.editorLabel}>Редагування</span>
                  <h2>{draft.address}</h2>
                </div>
                <span className={`${styles.saveState}${saved ? ` ${styles.saveStateVisible}` : ""}`} aria-live="polite">
                  <span aria-hidden="true">✓</span> Зміни збережено
                </span>
              </div>

              <section className={styles.formSection}>
                <div className={styles.sectionHeading}>
                  <span>01</span>
                  <div><h3>Основна інформація</h3><p>Назва пункту та контактні дані.</p></div>
                </div>
                <div className={styles.formGrid}>
                  <label>Назва<input value={draft.name} onChange={(event) => update("name", event.target.value)} /></label>
                  <label>Тип пункту<input value={draft.type} onChange={(event) => update("type", event.target.value)} /></label>
                  <label>Місто<input value={draft.city} onChange={(event) => update("city", event.target.value)} /></label>
                  <label>Телефон<input value={draft.phone} onChange={(event) => update("phone", event.target.value)} /></label>
                </div>
              </section>

              <section className={styles.formSection}>
                <div className={styles.sectionHeading}>
                  <span>02</span>
                  <div><h3>Адреса та карта</h3><p>Дані, за якими пацієнт знайде відділення.</p></div>
                </div>
                <div className={styles.formGrid}>
                  <label>Коротка адреса<input value={draft.address} onChange={(event) => update("address", event.target.value)} /></label>
                  <label>Орієнтир<input value={draft.landmark ?? ""} onChange={(event) => update("landmark", event.target.value)} placeholder="Наприклад, біля центрального входу" /></label>
                  <label className={styles.wideField}>Повна адреса<input value={draft.fullAddress} onChange={(event) => update("fullAddress", event.target.value)} /></label>
                  <label>Широта<input type="number" step="0.000001" value={draft.coordinates.lat} onChange={(event) => update("coordinates", { ...draft.coordinates, lat: Number(event.target.value) })} /></label>
                  <label>Довгота<input type="number" step="0.000001" value={draft.coordinates.lng} onChange={(event) => update("coordinates", { ...draft.coordinates, lng: Number(event.target.value) })} /></label>
                </div>
              </section>

              <section className={styles.formSection}>
                <div className={styles.sectionHeading}>
                  <span>03</span>
                  <div><h3>Опис і графік</h3><p>Коротко поясніть особливості роботи пункту.</p></div>
                </div>
                <div className={styles.formGrid}>
                  <label className={styles.wideField}>Опис<textarea value={draft.description} onChange={(event) => update("description", event.target.value)} /></label>
                  <label className={styles.wideField}>Графік роботи <small>Кожен рядок відображається окремо</small><textarea value={draft.hours.join("\n")} onChange={(event) => update("hours", event.target.value.split("\n"))} /></label>
                </div>
              </section>

              <section className={styles.formSection}>
                <div className={styles.sectionHeading}>
                  <span>04</span>
                  <div><h3>Доступні послуги</h3><p>Позначте напрямки, доступні за цією адресою.</p></div>
                </div>
                <div className={styles.serviceGrid}>
                  {branchServiceCatalog.map((service) => {
                    const selectedService = draft.services.includes(service.id);
                    return (
                      <button key={service.id} type="button" aria-pressed={selectedService} className={`${styles.serviceOption}${selectedService ? ` ${styles.serviceOptionSelected}` : ""}`} onClick={() => toggleService(service.id)}>
                        <span aria-hidden="true">{selectedService ? "✓" : "+"}</span>{service.label}
                      </button>
                    );
                  })}
                </div>
              </section>

              <section className={styles.formSection}>
                <div className={styles.sectionHeading}>
                  <span>05</span>
                  <div><h3>Фото та відео</h3><p>Матеріали для сторінки контактів.</p></div>
                </div>
                <div className={styles.formGrid}>
                  <label className={styles.wideField}>Фотографії <small>Один рядок: шлях | опис | підпис</small><textarea value={galleryText} onChange={(event) => { setGalleryText(event.target.value); setSaved(false); }} placeholder="/images/location.jpg | Вхід до пункту | Центральний вхід" /></label>
                  <label className={styles.wideField}>Посилання на відео<input value={draft.videoUrl ?? ""} onChange={(event) => update("videoUrl", event.target.value)} placeholder="https://…" /></label>
                </div>
              </section>

              <footer className={styles.actions}>
                <button className={styles.deleteButton} type="button" onClick={remove} disabled={saving}>Видалити відділення</button>
                <button className={styles.saveButton} type="button" onClick={save} disabled={saving}>{saving ? "Зберігаємо…" : "Зберегти зміни"}</button>
              </footer>
            </article>
          ) : (
            <div className={styles.emptyEditor}>
              <span aria-hidden="true">＋</span>
              <strong>Додайте перше відділення</strong>
              <p>Після створення тут з’являться всі налаштування пункту.</p>
              <button type="button" onClick={create} disabled={creating}>{creating ? "Створюємо…" : "Створити відділення"}</button>
            </div>
          )}
        </section>
      ) : null}
    </main>
  );
}
