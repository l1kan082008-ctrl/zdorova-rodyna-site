"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type FormEvent } from "react";
import type { ManagedService } from "../../api/services/serviceStore";
import { useAdminSafeSave } from "../useAdminSafeSave";
import AdminRevisionHistory from "../AdminRevisionHistory";
import styles from "./services.module.css";

type ApiPayload = { services?: ManagedService[]; service?: ManagedService; error?: string };

const emptyService = (index: number): Partial<ManagedService> => ({
  slug: `new-service-${Date.now()}`,
  shortTitle: "Нова послуга",
  cardDescription: "Короткий опис послуги",
  href: "/services",
  imageKey: null,
  imagePath: "/service-cards/lab-glass-v3.jpg",
  sortOrder: index,
  showOnServicesPage: true,
  showOnHome: false,
  active: true,
});

function imageUrl(service: ManagedService) {
  return service.imageKey
    ? `/api/services/image?key=${encodeURIComponent(service.imageKey)}`
    : service.imagePath || "/service-cards/lab-glass-v3.jpg";
}

function formatSaveTime(timestamp: number) {
  return new Intl.DateTimeFormat("uk-UA", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(timestamp);
}

export default function ServicesAdminPage() {
  const [services, setServices] = useState<ManagedService[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [draft, setDraft] = useState<ManagedService | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [creating, setCreating] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<number | null>(null);
  const [error, setError] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);
  const editorForm = useRef<HTMLFormElement>(null);

  const selected = useMemo(
    () => services.find((service) => service.id === selectedId) ?? null,
    [services, selectedId],
  );

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/admin/services", { cache: "no-store" });
      const payload = (await response.json()) as ApiPayload;
      if (!response.ok || !payload.services) throw new Error(payload.error || "Не вдалося завантажити послуги.");
      setServices(payload.services);
      setSelectedId((current) => current || payload.services?.[0]?.id || "");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Сталася помилка.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, []);

  useEffect(() => {
    setDraft(selected ? structuredClone(selected) : null);
    setLastSavedAt(null);
    setError("");
  }, [selected]);

  const update = <K extends keyof ManagedService>(key: K, value: ManagedService[K]) => {
    setDraft((current) => current ? { ...current, [key]: value } : current);
  };

  const create = async () => {
    if (!safeSave.confirmDiscard()) return;
    setCreating(true);
    setError("");
    try {
      const response = await fetch("/api/admin/services", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(emptyService(services.length)),
      });
      const payload = (await response.json()) as ApiPayload;
      if (!response.ok || !payload.service) throw new Error(payload.error || "Не вдалося створити послугу.");
      setServices((current) => [...current, payload.service!]);
      setSelectedId(payload.service.id);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Сталася помилка.");
    } finally {
      setCreating(false);
    }
  };

  const save = useCallback(async () => {
    if (!draft || saving) return;
    setSaving(true);
    setError("");
    try {
      const response = await fetch("/api/admin/services", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(draft),
      });
      const payload = (await response.json()) as ApiPayload;
      if (!response.ok || !payload.service) throw new Error(payload.error || "Не вдалося зберегти послугу.");
      setServices((current) => current
        .map((item) => item.id === payload.service!.id ? payload.service! : item)
        .sort((a, b) => a.sortOrder - b.sortOrder));
      setDraft(payload.service);
      setLastSavedAt(Date.now());
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Сталася помилка.");
    } finally {
      setSaving(false);
    }
  }, [draft, saving]);

  const requestSave = useCallback(() => {
    if (editorForm.current?.reportValidity() === false) return;
    return save();
  }, [save]);

  const safeSave = useAdminSafeSave<ManagedService>({
    storageKey: selected ? `admin-safe-draft:service:${selected.id}` : null,
    value: draft,
    baseline: selected,
    onRestore: (restored) => {
      if (selected && restored.id === selected.id) {
        setDraft(restored);
        setError("");
      }
    },
    onSave: requestSave,
    busy: saving || uploading,
  });

  const remove = async () => {
    if (!draft || !confirm(`Видалити послугу «${draft.shortTitle}»?`)) return;
    setSaving(true);
    setError("");
    try {
      const response = await fetch(`/api/admin/services?id=${encodeURIComponent(draft.id)}`, { method: "DELETE" });
      const payload = (await response.json()) as ApiPayload;
      if (!response.ok) throw new Error(payload.error || "Не вдалося видалити послугу.");
      const remaining = services.filter((item) => item.id !== draft.id);
      safeSave.clearStoredDraft();
      setServices(remaining);
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
        : "Можна безпечно перейти до іншої послуги.";

  const uploadImage = async (file?: File) => {
    if (!file || !draft) return;
    setUploading(true);
    setError("");
    try {
      const body = new FormData();
      body.set("image", file);
      body.set("serviceId", draft.id);
      const response = await fetch("/api/admin/services/image", { method: "POST", body });
      const payload = (await response.json()) as { imageKey?: string; error?: string };
      if (!response.ok || !payload.imageKey) throw new Error(payload.error || "Не вдалося завантажити зображення.");
      update("imageKey", payload.imageKey);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Сталася помилка.");
    } finally {
      setUploading(false);
      if (fileInput.current) fileInput.current.value = "";
    }
  };

  return (
    <main className={styles.page}>
      <header className={styles.pageHeader}>
        <div>
          <span className={styles.eyebrow}>Каталог сайту</span>
          <h1>Наші послуги</h1>
          <p>Керуйте картками послуг, їхнім порядком, зображеннями та видимістю на сайті.</p>
        </div>
        <Link className={styles.siteLink} href="/services">Переглянути на сайті <span aria-hidden="true">↗</span></Link>
      </header>

      {error ? <p className={styles.error} role="alert">{error}</p> : null}
      {loading ? <div className={styles.loading}>Завантажуємо послуги…</div> : null}

      {!loading ? (
        <section className={styles.workspace}>
          <aside className={styles.catalogPanel}>
            <div className={styles.catalogHeader}>
              <div><strong>Усі послуги</strong><span>{services.length} у каталозі</span></div>
              <button className={styles.createButton} type="button" onClick={create} disabled={creating}>
                <span aria-hidden="true">+</span>{creating ? "Створюємо" : "Додати"}
              </button>
            </div>
            <div className={styles.serviceList}>
              {services.map((service, index) => (
                <button
                  type="button"
                  key={service.id}
                  className={`${styles.serviceItem}${service.id === selectedId ? ` ${styles.serviceItemActive}` : ""}`}
                  onClick={() => {
                    if (
                      service.id === selectedId ||
                      safeSave.confirmDiscard()
                    ) {
                      setSelectedId(service.id);
                    }
                  }}
                >
                  <span className={styles.order}>{String(index + 1).padStart(2, "0")}</span>
                  <span className={styles.serviceCopy}>
                    <strong>{service.shortTitle}</strong>
                    <small>{service.active ? "Опубліковано" : "Приховано"}{service.showOnHome ? " · Головна" : ""}</small>
                  </span>
                  <span className={styles.chevron} aria-hidden="true">›</span>
                </button>
              ))}
            </div>
            {!services.length ? <div className={styles.emptyList}><strong>Послуг ще немає</strong><span>Створіть першу картку.</span></div> : null}
          </aside>

          {draft ? (
            <form
              ref={editorForm}
              className={styles.editor}
              onSubmit={(event: FormEvent<HTMLFormElement>) => {
                event.preventDefault();
                void save();
              }}
            >
              <div className={styles.editorHeader}>
                <div><span className={styles.editorLabel}>Редагування</span><h2>{draft.shortTitle}</h2></div>
              </div>

              <section className={styles.previewSection} aria-label="Попередній перегляд картки">
                <div className={styles.previewCopy}>
                  <span>Попередній перегляд</span>
                  <p>Так картка виглядатиме для пацієнта.</p>
                </div>
                <div className={styles.previewCard} style={{ "--preview-image": `url("${imageUrl(draft)}")` } as CSSProperties}>
                  <span><strong>{draft.shortTitle}</strong><small>{draft.cardDescription}</small></span>
                  <i aria-hidden="true">→</i>
                </div>
              </section>

              <section className={styles.formSection}>
                <div className={styles.sectionHeading}><span>01</span><div><h3>Основна інформація</h3><p>Назва, опис і адреса переходу.</p></div></div>
                <div className={styles.formGrid}>
                  <label className={styles.full}>Назва послуги<input value={draft.shortTitle} onChange={(event) => update("shortTitle", event.target.value)} required /></label>
                  <label className={styles.full}>Короткий опис<textarea rows={3} value={draft.cardDescription} onChange={(event) => update("cardDescription", event.target.value)} /></label>
                  <label>Системна назва<input value={draft.slug} onChange={(event) => update("slug", event.target.value)} required /></label>
                  <label>Посилання<input value={draft.href} onChange={(event) => update("href", event.target.value)} required /></label>
                </div>
              </section>

              <section className={styles.formSection}>
                <div className={styles.sectionHeading}><span>02</span><div><h3>Зображення</h3><p>Завантажте JPG, PNG, WEBP або AVIF до 8 МБ.</p></div></div>
                <div className={styles.mediaRow}>
                  <div className={styles.mediaThumb} style={{ backgroundImage: `url("${imageUrl(draft)}")` }} aria-hidden="true" />
                  <div className={styles.mediaActions}>
                    <input ref={fileInput} className={styles.fileInput} type="file" accept="image/jpeg,image/png,image/webp,image/avif" onChange={(event) => void uploadImage(event.target.files?.[0])} />
                    <button type="button" className={styles.uploadButton} onClick={() => fileInput.current?.click()} disabled={uploading}>
                      {uploading ? "Завантажуємо…" : "Замінити зображення"}
                    </button>
                    <small>Нове зображення застосовується після збереження картки.</small>
                  </div>
                </div>
              </section>

              <section className={styles.formSection}>
                <div className={styles.sectionHeading}><span>03</span><div><h3>Публікація</h3><p>Оберіть місця показу та порядок картки.</p></div></div>
                <div className={styles.publishPanel}>
                  <label className={styles.orderField}>Порядок<input type="number" value={draft.sortOrder} onChange={(event) => update("sortOrder", Number(event.target.value))} /></label>
                  <Toggle checked={draft.active} onChange={(value) => update("active", value)} label="Послуга активна" />
                  <Toggle checked={draft.showOnServicesPage} onChange={(value) => update("showOnServicesPage", value)} label="Показувати в усіх послугах" />
                  <Toggle checked={draft.showOnHome} onChange={(value) => update("showOnHome", value)} label="Показувати на головній" />
                </div>
              </section>

              <div className={`${styles.actionBar} admin-safe-catalog-action-bar`}>
                <div className="admin-safe-save-summary" role="status" aria-live="polite">
                  <span className={`admin-safe-save-state${error ? " is-error" : safeSave.dirty ? " is-dirty" : " is-saved"}`}>
                    <i aria-hidden="true" />{saveStateLabel}
                  </span>
                  <small>{saveStateDetail}</small>
                </div>
                <div className="admin-safe-save-buttons">
                  <AdminRevisionHistory
                    entityType="service"
                    entityId={draft.id}
                    entityLabel={draft.shortTitle}
                    draftStorageKey={`admin-safe-draft:service:${draft.id}`}
                    disabled={saving || uploading}
                    hasUnsavedChanges={safeSave.dirty}
                  />
                  <button className={styles.deleteButton} type="button" onClick={remove} disabled={saving}>Видалити послугу</button>
                  <button
                    className={styles.saveButton}
                    type="submit"
                    disabled={!safeSave.dirty || saving || uploading}
                    aria-keyshortcuts="Control+S Meta+S"
                    aria-busy={saving}
                  >
                    {saving ? <><span className={styles.spinner} aria-hidden="true" /> Збереження…</> : "Зберегти"}
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <div className={styles.emptyEditor}><strong>Оберіть послугу</strong><p>Або створіть нову картку в каталозі.</p><button type="button" onClick={create}>Додати послугу</button></div>
          )}
        </section>
      ) : null}
    </main>
  );
}

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (value: boolean) => void; label: string }) {
  return (
    <label className={styles.toggleRow}>
      <button
        className={`${styles.toggle}${checked ? ` ${styles.toggleOn}` : ""}`}
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
      ><span /></button>
      <span>{label}</span>
    </label>
  );
}
