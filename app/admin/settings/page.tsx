"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { validateSiteSettings, type SiteSettings } from "@/lib/siteSettings";
import { useAdminSafeSave } from "../useAdminSafeSave";
import styles from "./settings.module.css";
import { upgradeLegacySettingsDraft } from "./settingsDraft";

type SettingsResponse = { settings?: SiteSettings; error?: string };

export default function AdminSettingsPage() {
  const router = useRouter();
  const [baseline, setBaseline] = useState<SiteSettings | null>(null);
  const [draft, setDraft] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [loadVersion, setLoadVersion] = useState(0);
  const [needsLogin, setNeedsLogin] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const savingRef = useRef(false);

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      try {
        const response = await fetch("/api/admin/settings", { cache: "no-store", signal: controller.signal });
        const payload = await response.json() as SettingsResponse;
        if (response.status === 401) setNeedsLogin(true);
        if (!response.ok || !payload.settings) throw new Error(payload.error || "Не вдалося завантажити налаштування.");
        const settings = validateSiteSettings(payload.settings);
        try {
          const key = "admin-safe-draft:site-settings";
          const raw = window.localStorage.getItem(key);
          if (raw) {
            const upgraded = upgradeLegacySettingsDraft(raw, settings);
            if (upgraded !== raw) window.localStorage.setItem(key, upgraded);
          }
        } catch {
          // Restricted browser storage must not block the settings form.
        }
        setBaseline(settings);
        setDraft(settings);
        setNeedsLogin(false);
      } catch (reason) {
        if (!controller.signal.aborted) setError(reason instanceof Error ? reason.message : "Не вдалося завантажити налаштування.");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    void load();
    return () => controller.abort();
  }, [loadVersion]);

  async function save(): Promise<void> {
    if (!draft || savingRef.current || formRef.current?.reportValidity() === false) return;
    setError("");
    setSaved(false);
    let settings: SiteSettings;
    try {
      settings = validateSiteSettings({ ...draft, hours: draft.hours.map((line) => line.trim()).filter(Boolean) });
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Перевірте введені дані.");
      return;
    }
    savingRef.current = true;
    setSaving(true);
    try {
      const response = await fetch("/api/admin/settings", {
        method: "PUT", headers: { "Content-Type": "application/json" },
        credentials: "same-origin", body: JSON.stringify(settings),
      });
      const payload = await response.json() as SettingsResponse;
      if (response.status === 401) setNeedsLogin(true);
      if (!response.ok || !payload.settings) throw new Error(payload.error || "Не вдалося зберегти налаштування.");
      const result = validateSiteSettings(payload.settings);
      safeSave.clearStoredDraft();
      setBaseline(result);
      setDraft(result);
      setSaved(true);
      router.refresh();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Не вдалося зберегти налаштування. Спробуйте ще раз.");
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  }

  const safeSave = useAdminSafeSave<SiteSettings>({
    storageKey: baseline ? "admin-safe-draft:site-settings" : null,
    value: draft, baseline,
    onRestore: (restored) => {
      if (!restored || !["phone", "email", "address", "facebookUrl", "instagramUrl", "tiktokUrl", "threadsUrl"].every((key) => typeof restored[key as keyof SiteSettings] === "string") || !Array.isArray(restored.hours) || !restored.hours.every((line) => typeof line === "string")) {
        throw new Error("Invalid settings draft.");
      }
      setDraft(restored);
    },
    onSave: save, busy: saving,
  });

  const update = <K extends keyof SiteSettings>(key: K, value: SiteSettings[K]) => {
    setDraft((current) => current ? { ...current, [key]: value } : current);
    setError("");
    setSaved(false);
  };

  return (
    <div className={styles.page}>
      <header className="admin-page-heading">
        <div>
          <p className="section-kicker">Керування сайтом</p>
          <h1>Налаштування</h1>
          <p>Загальні контакти, графік роботи та соціальні мережі сайту.</p>
        </div>
      </header>
      {loading ? <p className={styles.state} role="status">Завантажуємо налаштування…</p> : !draft ? (
        <div className={`admin-ui-panel ${styles.loadError}`}>
          <p role="alert">{error}</p>
          {needsLogin ? <Link className="admin-ui-button" data-variant="primary" href="/admin/login">Увійти</Link> : (
            <button className="admin-ui-button" data-variant="secondary" type="button" onClick={() => { setLoading(true); setError(""); setLoadVersion((value) => value + 1); }}>Спробувати ще раз</button>
          )}
        </div>
      ) : (
        <form ref={formRef} className={styles.form} onSubmit={(event) => { event.preventDefault(); void save(); }}>
          <div className={`admin-safe-save-bar ${styles.saveBar}`}>
            <p className={styles.saveStatus} role="status" aria-live="polite">
              {saving ? "Зберігаємо зміни…" : saved ? "Зміни збережено" : safeSave.recoveredAt ? "Відновлено незбережену чернетку · Ctrl+S" : safeSave.dirty ? "Є незбережені зміни · Ctrl+S" : "Усі зміни збережено"}
            </p>
            <button className="admin-ui-button" data-variant="primary" type="submit" disabled={!safeSave.dirty || saving} aria-busy={saving}>
              {saving && <span className="admin-button-loader" aria-hidden="true" />}
              {saving ? "Збереження…" : "Зберегти зміни"}
            </button>
          </div>
          {error && <div className={styles.error} role="alert">{error}{needsLogin && <> <Link href="/admin/login">Увійти знову</Link></>}</div>}
          <fieldset disabled={saving} className={styles.layout}>
            <legend className={styles.visuallyHidden}>Загальні налаштування сайту</legend>
            <section className={`admin-ui-panel ${styles.panel}`} aria-labelledby="settings-contacts-title">
              <div className={styles.sectionHeading}>
                <h2 id="settings-contacts-title">Контакти та графік</h2>
                <p>Ці дані показуються у шапці, підвалі та загальних контактних блоках.</p>
              </div>
              <div className={styles.pair}>
                <label>Телефон<input type="tel" autoComplete="tel" value={draft.phone} maxLength={40} required onChange={(event) => update("phone", event.target.value)} /></label>
                <label>Електронна пошта<input type="email" autoComplete="email" value={draft.email} maxLength={254} required onChange={(event) => update("email", event.target.value)} /></label>
              </div>
              <label>Основна адреса<textarea autoComplete="street-address" value={draft.address} maxLength={300} rows={2} required onChange={(event) => update("address", event.target.value)} /></label>
              <label>Графік роботи<textarea value={draft.hours.join("\n")} maxLength={846} rows={3} required aria-describedby="settings-hours-help" onChange={(event) => update("hours", event.target.value.split(/\r?\n/u))} /></label>
              <p className={styles.help} id="settings-hours-help">Кожен період — з нового рядка, до 7 рядків. Наприклад: Пн–Пт 08:00–19:00.</p>
              <p className={styles.note}>Адреси, телефони та графіки окремих відділень редагуються у розділі <Link href="/admin/locations">«Відділення»</Link>.</p>
            </section>
            <section className={`admin-ui-panel ${styles.panel}`} aria-labelledby="settings-social-title">
              <div className={styles.sectionHeading}>
                <h2 id="settings-social-title">Соціальні мережі</h2>
                <p>Посилання на офіційні сторінки медичного центру.</p>
              </div>
              <label>Facebook<input type="url" inputMode="url" value={draft.facebookUrl} maxLength={500} placeholder="https://www.facebook.com/…" onChange={(event) => update("facebookUrl", event.target.value)} /></label>
              <label>Instagram<input type="url" inputMode="url" value={draft.instagramUrl} maxLength={500} placeholder="https://www.instagram.com/…" onChange={(event) => update("instagramUrl", event.target.value)} /></label>
              <label>TikTok<input type="url" inputMode="url" value={draft.tiktokUrl} maxLength={500} placeholder="https://www.tiktok.com/@…" onChange={(event) => update("tiktokUrl", event.target.value)} /></label>
              <label>Threads<input type="url" inputMode="url" value={draft.threadsUrl} maxLength={500} placeholder="https://www.threads.com/@…" onChange={(event) => update("threadsUrl", event.target.value)} /></label>
              <p className={styles.help}>Залиште поле порожнім, щоб приховати відповідне посилання на сайті.</p>
            </section>
          </fieldset>
        </form>
      )}
    </div>
  );
}
