"use client";

import { useEffect, useMemo, useState } from "react";
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
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

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

  return (
    <main className="admin-editor-page">
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
          <button className="admin-create-button" type="button" onClick={create} disabled={creating}>
            {creating ? "Створення…" : "+ Додати банер"}
          </button>
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

        <section className="admin-editor-panel">
          {!draft ? <p className="admin-editor-empty">Оберіть банер або створіть новий.</p> : (
            <>
              <div className="admin-editor-grid">
                <label className="admin-field-wide">Заголовок<input value={draft.title} onChange={(event) => update("title", event.target.value)} /></label>
                <label>Рубрика<input value={draft.eyebrow} onChange={(event) => update("eyebrow", event.target.value)} /></label>
                <label>Візуальний стиль<select value={draft.theme} onChange={(event) => update("theme", event.target.value as PromoTheme)}>{promoThemes.map((theme) => <option key={theme} value={theme}>{themeLabels[theme]}</option>)}</select></label>
                <label className="admin-field-wide">Опис<textarea rows={3} value={draft.text} onChange={(event) => update("text", event.target.value)} /></label>
                <label>Коротка перевага<input value={draft.note} onChange={(event) => update("note", event.target.value)} /></label>
                <label>Акцентна плашка<input value={draft.accent ?? ""} onChange={(event) => update("accent", event.target.value || undefined)} placeholder="Необов’язково" /></label>
                <label>Текст кнопки<input value={draft.action} onChange={(event) => update("action", event.target.value)} /></label>
                <label>Посилання<input value={draft.href} onChange={(event) => update("href", event.target.value)} /></label>
                <label>Порядок<input type="number" min={0} value={draft.sortOrder} onChange={(event) => update("sortOrder", Number(event.target.value))} /></label>
                <label className="admin-checkbox-row"><input type="checkbox" checked={draft.active} onChange={(event) => update("active", event.target.checked)} /> Показувати на головній</label>
              </div>
              {error ? <p className="admin-editor-state is-error">{error}</p> : null}
              {saved ? <p className="admin-editor-state is-success">Зміни збережено і вже доступні на головній сторінці.</p> : null}
              <div className="admin-editor-actions">
                <button className="admin-save-button" type="button" onClick={save} disabled={saving}>{saving ? "Збереження…" : "Зберегти"}</button>
                <button className="admin-danger-button" type="button" onClick={remove} disabled={saving}>Видалити банер</button>
              </div>
            </>
          )}
        </section>
      </div>
    </main>
  );
}
