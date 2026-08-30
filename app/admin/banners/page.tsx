"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type CSSProperties,
} from "react";
import AdminNavigation from "../AdminNavigation";
import {
  defaultPromoSlides,
  promoThemes,
  type PromoSlide,
  type PromoTheme,
} from "../../components/promoData";

type Payload = { banners?: PromoSlide[]; banner?: PromoSlide; error?: string };

const themeLabels: Record<PromoTheme, string> = {
  laboratory: "Лабораторія",
  home: "Медсестра вдома",
  heart: "Кардіологія",
  mri: "МРТ",
  doctors: "Лікарі",
  dermoscopy: "Дерматоскопія",
  "ct-photo": "КТ",
};

function emptyBanner(order: number): PromoSlide {
  return {
    ...defaultPromoSlides[0],
    id: "",
    eyebrow: "Нова пропозиція",
    title: "Заголовок нового банера",
    text: "Коротко опишіть пропозицію або послугу.",
    note: "Важлива перевага",
    accent: undefined,
    action: "Дізнатися більше",
    href: "/services",
    sortOrder: order,
  };
}

export default function BannersAdminPage() {
  const [banners, setBanners] = useState<PromoSlide[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [draft, setDraft] = useState<PromoSlide | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const imageInputRef = useRef<HTMLInputElement>(null);

  const selected = useMemo(
    () => banners.find((banner) => banner.id === selectedId) ?? null,
    [banners, selectedId],
  );

  useEffect(() => {
    fetch("/api/admin/banners")
      .then(async (response) => {
        const payload = await response.json() as Payload;
        if (!response.ok || !payload.banners) throw new Error(payload.error || "Не вдалося завантажити банери.");
        setBanners(payload.banners);
        setSelectedId(payload.banners[0]?.id ?? "");
      })
      .catch((reason) => setError(reason instanceof Error ? reason.message : "Сталася помилка."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selected) return;
    setDraft(structuredClone(selected));
    setSaved(false);
    setError("");
  }, [selected]);

  const update = <K extends keyof PromoSlide>(key: K, value: PromoSlide[K]) => {
    setDraft((current) => current ? { ...current, [key]: value } : current);
    setSaved(false);
  };

  const create = async () => {
    setCreating(true);
    setError("");
    try {
      const response = await fetch("/api/admin/banners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(emptyBanner(banners.length)),
      });
      const payload = await response.json() as Payload;
      if (!response.ok || !payload.banner) throw new Error(payload.error || "Не вдалося створити банер.");
      setBanners((current) => [...current, payload.banner!]);
      setSelectedId(payload.banner.id);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Сталася помилка.");
    } finally {
      setCreating(false);
    }
  };

  const save = async () => {
    if (!draft) return;
    setSaving(true);
    setSaved(false);
    setError("");
    try {
      const response = await fetch("/api/admin/banners", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      });
      const payload = await response.json() as Payload;
      if (!response.ok || !payload.banner) throw new Error(payload.error || "Не вдалося зберегти банер.");
      setBanners((current) => current.map((item) => item.id === payload.banner!.id ? payload.banner! : item));
      setSaved(true);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Сталася помилка.");
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!draft || !window.confirm(`Видалити банер «${draft.title}»?`)) return;
    setSaving(true);
    setError("");
    try {
      const response = await fetch(`/api/admin/banners?id=${encodeURIComponent(draft.id)}`, { method: "DELETE" });
      const payload = await response.json() as { error?: string };
      if (!response.ok) throw new Error(payload.error || "Не вдалося видалити банер.");
      const remaining = banners.filter((item) => item.id !== draft.id);
      setBanners(remaining);
      setSelectedId(remaining[0]?.id ?? "");
      setDraft(null);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Сталася помилка.");
    } finally {
      setSaving(false);
    }
  };

  const uploadImage = async (event: ChangeEvent<HTMLInputElement>) => {
    const image = event.target.files?.[0];
    if (!image || !draft) return;

    setUploadingImage(true);
    setSaved(false);
    setError("");
    try {
      const formData = new FormData();
      formData.set("image", image);
      formData.set("bannerId", draft.id || "draft");
      const response = await fetch("/api/admin/banners/image", {
        method: "POST",
        body: formData,
      });
      const payload = await response.json() as { imageKey?: string; error?: string };
      if (!response.ok || !payload.imageKey) {
        throw new Error(payload.error || "Не вдалося завантажити зображення.");
      }
      update("imageKey", payload.imageKey);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Не вдалося завантажити зображення.");
    } finally {
      setUploadingImage(false);
      event.target.value = "";
    }
  };

  return (
    <main className="admin-editor-page admin-banners-editor-page">
      <header className="admin-page-heading">
        <div>
          <span className="section-kicker">Адмінпанель</span>
          <h1>Банери головної сторінки</h1>
          <p>Редагуйте текст, посилання, порядок і візуальний стиль без змін у коді.</p>
        </div>
        <AdminNavigation current="banners" className="admin-page-links" showSiteLink />
      </header>

      <div className="admin-editor-layout">
        <aside className="admin-editor-sidebar">
          <header className="admin-editor-sidebar__heading">
            <div>
              <strong>Банери</strong>
              <span>{banners.length} у списку</span>
            </div>
            <button className="admin-banner-create-button" type="button" onClick={create} disabled={creating}>
              <span aria-hidden="true">+</span>
              <span>{creating ? "Створення…" : "Додати"}</span>
            </button>
          </header>
          {loading ? <p>Завантаження…</p> : banners.map((banner) => (
            <button
              key={banner.id}
              type="button"
              className={`admin-editor-list-item${selectedId === banner.id ? " is-active" : ""}`}
              onClick={() => setSelectedId(banner.id)}
            >
              <strong>{banner.title}</strong>
              <span>{banner.active ? "Опублікований" : "Прихований"} · позиція {banner.sortOrder + 1}</span>
            </button>
          ))}
        </aside>

        <section className="admin-editor-panel admin-banner-editor-panel">
          {!draft ? <p className="admin-editor-empty">Оберіть банер або створіть новий.</p> : (
            <>
              <section className="admin-banner-preview" aria-label="Попередній перегляд банера">
                <header className="admin-banner-preview__header">
                  <div>
                    <strong>Попередній перегляд</strong>
                    <span>{draft.imageKey ? "Використовується завантажене зображення." : "Зображення змінюється разом із візуальним стилем."}</span>
                  </div>
                  <span className={`admin-banner-status${draft.active ? " is-active" : ""}`}>
                    {draft.active ? "На головній" : "Прихований"}
                  </span>
                </header>
                <div className="admin-banner-preview__viewport">
                  <article
                    className={`promo-slide promo-slide--${draft.theme}`}
                    style={draft.imageKey ? ({
                      "--promo-photo": `url("/api/banners/image?key=${encodeURIComponent(draft.imageKey)}")`,
                    } as CSSProperties) : undefined}
                  >
                    <div className="promo-copy">
                      <span className="promo-eyebrow">{draft.eyebrow}</span>
                      <h2>{draft.title}</h2>
                      {draft.accent ? <span className="promo-cito">{draft.accent}</span> : null}
                      <p>{draft.text}</p>
                      <div className="promo-actions">
                        <span className="promo-button">{draft.action} <span aria-hidden="true">→</span></span>
                        <span className="promo-note">{draft.note}</span>
                      </div>
                    </div>
                    <div className="promo-visual" aria-hidden="true" />
                  </article>
                </div>
                <div className="admin-banner-media-toolbar">
                  <div className="admin-banner-media-toolbar__copy">
                    <strong>Зображення банера</strong>
                    <span>{draft.imageKey ? "Завантажене зображення замінює фото вибраного стилю." : "Зараз використовується фото вибраного стилю."}</span>
                  </div>
                  <input
                    ref={imageInputRef}
                    hidden
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/avif"
                    onChange={uploadImage}
                  />
                  <div className="admin-banner-media-actions">
                    <button
                      type="button"
                      className="admin-banner-upload-button"
                      onClick={() => imageInputRef.current?.click()}
                      disabled={uploadingImage || saving}
                    >
                      {uploadingImage ? <span className="admin-button-loader" aria-hidden="true" /> : null}
                      {uploadingImage ? "Завантаження..." : draft.imageKey ? "Замінити зображення" : "Завантажити зображення"}
                    </button>
                    {draft.imageKey ? (
                      <button
                        type="button"
                        className="admin-banner-media-reset"
                        onClick={() => update("imageKey", "")}
                        disabled={uploadingImage || saving}
                      >
                        Повернути фото стилю
                      </button>
                    ) : null}
                  </div>
                </div>
              </section>

              <div className="admin-banner-form">
                <section className="admin-banner-form-section" aria-labelledby="banner-main-heading">
                  <h2 id="banner-main-heading">Основна інформація</h2>
                  <div className="admin-editor-grid">
                    <label className="admin-field-wide">Заголовок<input value={draft.title} onChange={(event) => update("title", event.target.value)} /></label>
                    <label>Рубрика<input value={draft.eyebrow} onChange={(event) => update("eyebrow", event.target.value)} /></label>
                    <label>Візуальний стиль<select value={draft.theme} onChange={(event) => update("theme", event.target.value as PromoTheme)}>{promoThemes.map((theme) => <option key={theme} value={theme}>{themeLabels[theme]}</option>)}</select></label>
                    <label className="admin-field-wide">Опис<textarea rows={3} value={draft.text} onChange={(event) => update("text", event.target.value)} /></label>
                  </div>
                </section>

                <section className="admin-banner-form-section" aria-labelledby="banner-content-heading">
                  <h2 id="banner-content-heading">Контент банера</h2>
                  <div className="admin-editor-grid">
                    <label>Коротка перевага<input value={draft.note} onChange={(event) => update("note", event.target.value)} /></label>
                    <label>Акцентна плашка<input value={draft.accent ?? ""} onChange={(event) => update("accent", event.target.value || undefined)} placeholder="Необов’язково" /></label>
                    <label>Текст кнопки<input value={draft.action} onChange={(event) => update("action", event.target.value)} /></label>
                    <label>Посилання<input value={draft.href} onChange={(event) => update("href", event.target.value)} /></label>
                  </div>
                </section>

                <section className="admin-banner-form-section admin-banner-settings" aria-labelledby="banner-settings-heading">
                  <h2 id="banner-settings-heading">Налаштування показу</h2>
                  <div className="admin-banner-settings__row">
                    <label className="admin-banner-order-field">Порядок<input type="number" min={0} value={draft.sortOrder} onChange={(event) => update("sortOrder", Number(event.target.value))} /></label>
                    <label className="admin-toggle-row">
                      <span>
                        <strong>Показувати на головній</strong>
                        <small>{draft.active ? "Банер доступний відвідувачам" : "Банер прихований від відвідувачів"}</small>
                      </span>
                      <input type="checkbox" checked={draft.active} onChange={(event) => update("active", event.target.checked)} />
                      <span className="admin-toggle" aria-hidden="true"><span /></span>
                    </label>
                  </div>
                </section>
              </div>
              {error ? <p className="admin-editor-state is-error">{error}</p> : null}
              {saved ? <p className="admin-editor-state is-success">Зміни збережено і вже доступні на головній сторінці.</p> : null}
              <div className="admin-editor-actions admin-banner-action-bar">
                <button className="admin-danger-button" type="button" onClick={remove} disabled={saving || uploadingImage}>Видалити банер</button>
                <button className="admin-save-button admin-banner-save-button" type="button" onClick={save} disabled={saving || uploadingImage} aria-busy={saving}>
                  {saving ? <span className="admin-button-loader" aria-hidden="true" /> : null}
                  {saving ? "Збереження..." : "Зберегти"}
                </button>
              </div>
            </>
          )}
        </section>
      </div>
    </main>
  );
}
