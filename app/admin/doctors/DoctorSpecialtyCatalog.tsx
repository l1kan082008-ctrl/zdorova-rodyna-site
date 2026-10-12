"use client";

import { useId, useRef, useState, type FormEvent } from "react";
import type { SaveDoctorSpecialty } from "./useDoctorSpecialtyCatalog";
import styles from "./doctors.module.css";

export default function DoctorSpecialtyCatalog({ options, loading, error, onRetry, onSave }: {
  options: string[];
  loading: boolean;
  error: string;
  onRetry: () => void;
  onSave: SaveDoctorSpecialty;
}) {
  const id = useId();
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [message, setMessage] = useState("");
  const savingRef = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (savingRef.current || loading || error || !name.trim()) return;
    savingRef.current = true;
    setSaving(true);
    setSaveError("");
    setMessage("");
    try {
      const saved = await onSave(name);
      setName("");
      setMessage(`«${saved}» збережено. Можна обрати в профілі будь-якого лікаря.`);
      requestAnimationFrame(() => inputRef.current?.focus());
    } catch (reason) {
      setSaveError(reason instanceof Error ? reason.message : "Не вдалося зберегти спеціальність.");
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  };

  return (
    <details className={styles.specialtyCatalog}>
      <summary><span>Спеціальності лікарів</span><span className={styles.catalogSummaryHint}>Додати до списку</span></summary>
      <div className={styles.catalogBody}>
        <p id={`${id}-hint`}>Збережіть нову спеціальність один раз, щоб обирати її в профілях лікарів.</p>
        {loading ? <p role="status">Завантажуємо спеціальності…</p> : error ? (
          <div className={styles.catalogFeedback}>
            <p className={styles.fieldError} role="alert">{error}</p>
            <button className="admin-ui-button" data-variant="secondary" type="button" onClick={onRetry}>Спробувати ще раз</button>
          </div>
        ) : (
          <>
            <form className={styles.catalogForm} onSubmit={submit}>
              <label htmlFor={`${id}-name`}>Нова спеціальність
                <input ref={inputRef} id={`${id}-name`} value={name} onChange={(event) => { setName(event.target.value); setSaveError(""); setMessage(""); }} maxLength={80} required disabled={saving} placeholder="Наприклад, проктолог-хірург" aria-describedby={`${id}-hint`} />
              </label>
              <button className="admin-ui-button" data-variant="primary" type="submit" disabled={saving || !name.trim()}>{saving ? "Зберігаємо…" : "Зберегти спеціальність"}</button>
            </form>
            {saveError && <p className={styles.fieldError} role="alert">{saveError}</p>}
            <p className={styles.catalogStatus} role="status">{message}</p>
            <div className={styles.catalogSaved}>
              <h2>Доступні спеціальності <span>({options.length})</span></h2>
              <ul>{options.map((option) => <li key={option}>{option.charAt(0).toLocaleUpperCase("uk-UA") + option.slice(1)}</li>)}</ul>
            </div>
          </>
        )}
      </div>
    </details>
  );
}
