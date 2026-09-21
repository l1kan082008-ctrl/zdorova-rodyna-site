"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  branchServiceCatalog,
  type BranchServiceId,
  type CenterLocation,
} from "../../contacts/locationData";
import styles from "./locations.module.css";
import { useAdminSafeSave } from "../useAdminSafeSave";
import AdminRevisionHistory from "../AdminRevisionHistory";
import { useSiteSettings } from "../../components/SiteSettingsProvider";

type ApiPayload = { locations?: CenterLocation[]; location?: CenterLocation; error?: string };

const emptyLocation = (phone: string): CenterLocation => ({
  id: "",
  city: "Рівне",
  name: "Нове відділення",
  type: "Медичне відділення",
  address: "Нова адреса",
  fullAddress: "м. Рівне, нова адреса",
  description: "",
  hours: ["Пн–Пт · 08:00–18:00"],
  phone,
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

type LocationDraft = {
  location: CenterLocation;
  galleryText: string;
};

function formatSaveTime(timestamp: number) {
  return new Intl.DateTimeFormat("uk-UA", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(timestamp);
}

export default function LocationsAdminPage() {
  const settings = useSiteSettings();
  const [locations, setLocations] = useState<CenterLocation[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [draft, setDraft] = useState<CenterLocation | null>(null);
  const [galleryText, setGalleryText] = useState("");
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [creating, setCreating] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<number | null>(null);
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
    setLastSavedAt(null);
    setError("");
  }, [selected]);

  const update = <K extends keyof CenterLocation>(key: K, value: CenterLocation[K]) => {
    setDraft((current) => (current ? { ...current, [key]: value } : current));
  };

  const uploadPhotos = async (files: File[]) => {
    if (!draft || uploading || saving || !files.length) return;
    setUploading(true);
    setError("");
    try {
      for (const file of files) {
        if (file.size > 4 * 1024 * 1024) throw new Error(`«${file.name}»: розмір має бути до 4 МБ.`);
        const form = new FormData();
        form.append("locationId", draft.id);
        form.append("photo", file);
        const response = await fetch("/api/admin/locations/photo", { method: "POST", body: form });
        const result = await response.json() as { src?: string; error?: string };
        if (!response.ok || !result.src) throw new Error(result.error || "Не вдалося завантажити фото.");
        const photo = { src: result.src, alt: draft.address, caption: "" };
        setGalleryText(current => galleryToText([...parseGallery(current), photo]));
      }
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Не вдалося завантажити фото.");
    } finally {
      setUploading(false);
    }
  };

  const toggleService = (serviceId: BranchServiceId) => {
    if (!draft) return;
    const next = draft.services.includes(serviceId)
      ? draft.services.filter((id) => id !== serviceId)
      : [...draft.services, serviceId];
    update("services", next);
  };

  const save = useCallback(async () => {
    if (!draft || uploading) return;
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
      setLastSavedAt(Date.now());
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Сталася помилка.");
    } finally {
      setSaving(false);
    }
  }, [draft, galleryText, uploading]);

  const draftValue = useMemo<LocationDraft | null>(
    () => draft ? { location: draft, galleryText } : null,
    [draft, galleryText],
  );
  const baselineValue = useMemo<LocationDraft | null>(
    () => selected
      ? { location: selected, galleryText: galleryToText(selected.gallery) }
      : null,
    [selected],
  );
  const safeSave = useAdminSafeSave<LocationDraft>({
    storageKey: selected ? `admin-safe-draft:location:${selected.id}` : null,
    value: draftValue,
    baseline: baselineValue,
    onRestore: (restored) => {
      if (selected && restored.location.id === selected.id) {
        setDraft(restored.location);
        setGalleryText(restored.galleryText);
        setError("");
      }
    },
    onSave: save,
    busy: saving || uploading,
  });

  const create = async () => {
    if (!safeSave.confirmDiscard()) return;
    setCreating(true);
    setError("");
    try {
      const response = await fetch("/api/admin/locations", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(emptyLocation(settings.phone)),
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
      safeSave.clearStoredDraft();
      setLocations(remaining);
      setSelectedId(remaining[0]?.id ?? "");
      setDraft(null);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Сталася помилка.");
    } finally {
      setSaving(false);
    }
  };

  const saveStateLabel = saving
    ? "Зберігаємо зміни…"
    : error
      ? "Збереження потребує уваги"
      : safeSave.dirty
        ? "Є незбережені зміни"
        : lastSavedAt
          ? `Збережено о ${formatSaveTime(lastSavedAt)}`
          : "Усі зміни збережено";
  const saveStateDetail = error
    ? error
    : safeSave.recoveredAt
      ? `Відновлено чернетку о ${formatSaveTime(safeSave.recoveredAt)} · Ctrl+S`
      : safeSave.dirty
        ? "Чернетка зберігається у цьому браузері · Ctrl+S"
        : "Можна безпечно перейти до іншого відділення.";

  return (
    <main className={styles.page}>
      <header className={styles.pageHeader}>
        <div>
          <span className={styles.eyebrow}>Відділення</span>
          <h1>Керуйте відділеннями</h1>
          <p>Адреси, графік, доступні послуги та медіа — в одному місці.</p>
        </div>
        <Link className={`${styles.siteLink} admin-ui-button`} data-variant="ghost" href="/contacts">Переглянути на сайті <span aria-hidden="true">↗</span></Link>
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
              <button className={`${styles.createButton} admin-ui-button`} data-variant="primary" type="button" onClick={create} disabled={creating || uploading || saving} aria-label="Додати відділення">
                <span aria-hidden="true">+</span>
                {creating ? "Створюємо" : "Додати"}
              </button>
            </div>
            <div className={styles.locationList}>
              {locations.map((location, index) => (
                <button
                  disabled={uploading || saving}
                  key={location.id}
                  type="button"
                  className={`${styles.locationItem}${location.id === selectedId ? ` ${styles.locationItemActive}` : ""}`}
                  onClick={() => {
                    if (
                      location.id === selectedId ||
                      safeSave.confirmDiscard()
                    ) {
                      setSelectedId(location.id);
                    }
                  }}
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
                  <div className={styles.wideField}>
                    <label>Додати фотографії
                      <input type="file" accept="image/jpeg,image/png,image/webp,image/avif" multiple disabled={uploading || saving}
                        onChange={event => { const files = Array.from(event.target.files ?? []); event.target.value = ""; void uploadPhotos(files); }} />
                    </label>
                    <p className={styles.mediaHint} role="status">{uploading ? "Завантажуємо фотографії…" : "JPG, PNG, WEBP або AVIF до 4 МБ. Після додавання чи видалення натисніть «Зберегти зміни»."}</p>
                    <div className={styles.photoGrid}>
                      {parseGallery(galleryText).map((photo, index) => (
                        <div className={styles.photoCard} key={`${photo.src}-${index}`}>
                          {/* Uploaded photos may use the configured public media store. */}
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={photo.src} alt={photo.alt || `Фото відділення ${index + 1}`} loading="lazy" />
                          <span>{photo.caption || `Фото ${index + 1}`}</span>
                          <button type="button" className={`${styles.deleteButton} admin-ui-button`} data-variant="danger" disabled={uploading || saving}
                            aria-label={`Видалити фото ${index + 1}`}
                            onClick={() => {
                              if (!window.confirm(`Видалити фото ${index + 1}${photo.caption ? ` «${photo.caption}»` : ""}? Зміна набуде чинності після збереження відділення.`)) return;
                              setGalleryText(current => galleryToText(parseGallery(current).filter((_, i) => i !== index)));
                            }}>Видалити фото</button>
                        </div>
                      ))}
                    </div>
                    {!parseGallery(galleryText).length ? <p className={styles.mediaHint}>Фотографій ще немає. Додайте їх із комп’ютера або телефона.</p> : null}
                    <details className={styles.mediaDetails}>
                      <summary>Редагувати посилання та підписи</summary>
                      <label>Один рядок: шлях | опис | підпис<textarea value={galleryText} disabled={uploading || saving} onChange={event => setGalleryText(event.target.value)} /></label>
                    </details>
                  </div>
                  <label className={styles.wideField}>Посилання на відео<input value={draft.videoUrl ?? ""} onChange={(event) => update("videoUrl", event.target.value)} placeholder="https://…" /></label>
                </div>
              </section>

              <footer className={`${styles.actions} admin-safe-catalog-action-bar`}>
                <div className="admin-safe-save-summary" role="status" aria-live="polite">
                  <span className={`admin-safe-save-state${error ? " is-error" : safeSave.dirty ? " is-dirty" : " is-saved"}`}>
                    <i aria-hidden="true" />{saveStateLabel}
                  </span>
                  <small>{saveStateDetail}</small>
                </div>
                <div className="admin-safe-save-buttons">
                  <AdminRevisionHistory
                    entityType="location"
                    entityId={draft.id}
                    entityLabel={draft.name}
                    draftStorageKey={`admin-safe-draft:location:${draft.id}`}
                    disabled={saving || uploading}
                    hasUnsavedChanges={safeSave.dirty}
                  />
                  <button className={`${styles.deleteButton} admin-ui-button`} data-variant="danger" type="button" onClick={remove} disabled={saving || uploading}>Видалити відділення</button>
                  <button
                    className={`${styles.saveButton} admin-ui-button`} data-variant="primary"
                    type="button"
                    onClick={() => void save()}
                    disabled={!safeSave.dirty || saving || uploading}
                    aria-keyshortcuts="Control+S Meta+S"
                    aria-busy={saving}
                  >
                    {saving ? "Зберігаємо…" : "Зберегти зміни"}
                  </button>
                </div>
              </footer>
            </article>
          ) : (
            <div className={styles.emptyEditor}>
              <span aria-hidden="true">＋</span>
              <strong>Додайте перше відділення</strong>
              <p>Після створення тут з’являться всі налаштування пункту.</p>
              <button className="admin-ui-button" data-variant="primary" type="button" onClick={create} disabled={creating || uploading || saving}>{creating ? "Створюємо…" : "Створити відділення"}</button>
            </div>
          )}
        </section>
      ) : null}
    </main>
  );
}
