"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { getSpecialtyOptions, isSpecialtyQualifier, specialtyKey, splitSpecialties } from "./doctorFormState";
import styles from "./doctors.module.css";

export default function DoctorSpecialtyPicker({ value, options, onChange, disabled = false }: {
  value: string;
  options: readonly string[];
  onChange: (value: string) => void;
  disabled?: boolean;
}) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [invalid, setInvalid] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const selected = useMemo(() => splitSpecialties(value), [value]);
  const allOptions = useMemo(() => getSpecialtyOptions(options, value), [options, value]);
  const normalized = specialtyKey(query);
  const filtered = allOptions.filter((option) => specialtyKey(option).includes(normalized));
  const customOptions = splitSpecialties(query).filter((option) => !isSpecialtyQualifier(option) && !allOptions.some((known) => specialtyKey(known) === specialtyKey(option)));

  useEffect(() => {
    searchRef.current?.setCustomValidity(selected.length ? "" : "Оберіть принаймні одну спеціальність.");
  }, [selected.length]);

  const updateSelection = (next: string[]) => {
    setInvalid(false);
    onChange(next.join(", "));
  };
  const remove = (option: string) => updateSelection(selected.filter((item) => specialtyKey(item) !== specialtyKey(option)));
  const label = (option: string) => option.charAt(0).toLocaleUpperCase("uk-UA") + option.slice(1);

  return (
    <fieldset
      className={styles.specialtyPicker}
      disabled={disabled}
      onBlur={(event) => {
        if (event.relatedTarget && !event.currentTarget.contains(event.relatedTarget as Node)) setOpen(false);
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape" && open) {
          event.preventDefault();
          event.stopPropagation();
          setOpen(false);
          triggerRef.current?.focus();
        }
      }}
    >
      <legend>Спеціальності</legend>
      {selected.length > 0 && (
        <ul className={styles.specialtyChips} aria-label="Обрані спеціальності">
          {selected.map((option) => (
            <li key={specialtyKey(option)}>
              <button className={`admin-ui-button ${styles.specialtyChip}`} data-variant="ghost" type="button" onClick={() => remove(option)} aria-label={`Прибрати спеціальність: ${label(option)}`}>
                {label(option)} <span aria-hidden="true">×</span>
              </button>
            </li>
          ))}
        </ul>
      )}
      <button
        ref={triggerRef}
        type="button"
        className={`admin-ui-button ${styles.specialtyTrigger}`}
        data-variant="secondary"
        aria-expanded={open}
        aria-controls={`${id}-panel`}
        aria-describedby={invalid ? `${id}-error` : undefined}
        onClick={() => {
          setOpen(!open);
          if (!open) requestAnimationFrame(() => searchRef.current?.focus());
        }}
      >
        {selected.length ? "Змінити спеціальності" : "Обрати спеціальності"}
        <span aria-hidden="true">{open ? "−" : "+"}</span>
      </button>
      <div id={`${id}-panel`} className={styles.specialtyPanel} hidden={!open}>
        <input
          ref={searchRef}
          type="search"
          value={query}
          aria-label="Знайти спеціальність"
          aria-invalid={invalid || undefined}
          aria-describedby={invalid ? `${id}-error` : undefined}
          placeholder="Пошук спеціальності"
          autoComplete="off"
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={(event) => { if (event.key === "Enter") event.preventDefault(); }}
          onInvalid={(event) => {
            event.preventDefault();
            setInvalid(true);
            setOpen(true);
            requestAnimationFrame(() => searchRef.current?.focus());
          }}
        />
        <div className={styles.specialtyOptions} role="group" aria-label="Доступні спеціальності">
          {filtered.map((option) => {
            const checked = selected.some((item) => specialtyKey(item) === specialtyKey(option));
            return (
              <label className={styles.specialtyOption} key={specialtyKey(option)}>
                <input type="checkbox" checked={checked} onChange={() => checked ? remove(option) : updateSelection([...selected, option])} />
                <span>{label(option)}</span>
              </label>
            );
          })}
          {!filtered.length && <p className={styles.fieldHint}>Такої спеціальності ще немає у списку.</p>}
        </div>
        {customOptions.length > 0 && (
          <button className={`admin-ui-button ${styles.customSpecialty}`} data-variant="ghost" type="button" onClick={() => {
            updateSelection([...selected, ...customOptions]);
            setQuery("");
          }}>Додати «{customOptions.join(", ")}»</button>
        )}
      </div>
      {invalid && <p id={`${id}-error`} className={styles.fieldError} role="alert">Оберіть принаймні одну спеціальність.</p>}
    </fieldset>
  );
}
