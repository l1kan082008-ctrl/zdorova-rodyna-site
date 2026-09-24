"use client";

import { useId } from "react";
import { joinDoctorBranches, splitDoctorBranches } from "@/lib/doctorBranches";
import styles from "./doctors.module.css";

const branchKey = (address: string) => address.trim().toLocaleLowerCase("uk-UA").replace(/\s+/gu, " ");

export default function DoctorBranchPicker({ value, addresses, onChange, loading = false, error = "", disabled = false }: {
  value: string;
  addresses: readonly string[];
  onChange: (value: string) => void;
  loading?: boolean;
  error?: string;
  disabled?: boolean;
}) {
  const id = useId();
  const selected = splitDoctorBranches(value);
  const published = splitDoctorBranches(joinDoctorBranches(addresses));
  const publishedKeys = new Set(published.map(branchKey));
  const selectedKeys = new Set(selected.map(branchKey));
  const options = [...published, ...selected.filter((address) => !publishedKeys.has(branchKey(address)))];

  return (
    <fieldset className={styles.branchPicker} disabled={disabled || loading} aria-busy={loading} aria-describedby={`${id}-hint`}>
      <legend>Відділення</legend>
      <p id={`${id}-hint`} className={styles.fieldHint}>Оберіть усі пункти, де приймає лікар.</p>
      {options.length > 0 && (
        <div className={styles.branchOptions}>
          {options.map((address) => {
            const key = branchKey(address);
            const checked = selectedKeys.has(key);
            return (
              <label key={address} className={styles.branchOption} data-selected={checked || undefined}>
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={(event) => onChange(joinDoctorBranches(event.target.checked ? [...selected, address] : selected.filter((item) => branchKey(item) !== key)))}
                />
                <span>{address}{!publishedKeys.has(key) && !loading && <small>Збережена адреса поза поточним списком</small>}</span>
              </label>
            );
          })}
        </div>
      )}
      <div className={styles.branchFooter}>
        <p className={styles.fieldHint} role="status">{loading ? "Завантажуємо відділення…" : selected.length ? `Обрано: ${selected.length}` : "Відділення не вказано"}</p>
        <button className="admin-ui-button" data-variant="ghost" type="button" disabled={!selected.length} onClick={() => onChange("")} aria-label="Очистити вибір відділень">Очистити</button>
      </div>
      {!loading && error && <p className={styles.fieldHint} role="status">{error}</p>}
      {!loading && !error && !options.length && <p className={styles.fieldHint}>Список відділень порожній. Додайте адресу в розділі «Відділення».</p>}
    </fieldset>
  );
}
