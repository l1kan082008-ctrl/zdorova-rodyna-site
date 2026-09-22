"use client";

import { useEffect, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import styles from "./BookingStudySelect.module.css";

type Props = {
  id: string;
  label: string;
  value: string;
  options: string[];
  helpValue: string;
  loading?: boolean;
  disabled?: boolean;
  onChange: (value: string) => void;
};

const normalize = (text: string) => text.toLocaleLowerCase("uk-UA").replace(/[’ʼ']/g, "’").trim();

export function BookingStudySelect({ id, label, value, options, helpValue, loading = false, disabled = false, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const expanded = open && !disabled;
  const helpLabel = helpValue + " · Допоможіть обрати дослідження";
  const values = [...new Set([helpValue, ...(value !== helpValue && !options.includes(value) ? [value] : []), ...options])];
  const terms = normalize(query).split(/\s+/).filter(Boolean);
  const matches = values.filter(item => terms.every(term => normalize(item === helpValue ? helpLabel : item).includes(term)));
  const active = Math.min(activeIndex, matches.length - 1);
  const listId = id + "-options";

  useEffect(() => {
    if (!expanded) return;
    searchRef.current?.focus({ preventScroll: true });
    const panel = panelRef.current;
    const dialog = rootRef.current?.closest<HTMLElement>(".quick-booking");
    if (panel && dialog) {
      const bounds = panel.getBoundingClientRect();
      const viewport = dialog.getBoundingClientRect();
      if (bounds.bottom > viewport.bottom - 12) dialog.scrollTop += bounds.bottom - viewport.bottom + 12;
    }
    const dismiss = (event: PointerEvent) => {
      if (event.target instanceof Node && !rootRef.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener("pointerdown", dismiss);
    return () => document.removeEventListener("pointerdown", dismiss);
  }, [expanded]);

  useEffect(() => {
    const list = listRef.current;
    const option = list?.children[active] as HTMLElement | undefined;
    if (!expanded || !list || !option) return;
    // Scroll only the results, without moving the form or the page behind it.
    if (option.offsetTop < list.scrollTop) list.scrollTop = option.offsetTop;
    else if (option.offsetTop + option.offsetHeight > list.scrollTop + list.clientHeight) {
      list.scrollTop = option.offsetTop + option.offsetHeight - list.clientHeight;
    }
  }, [active, expanded, query]);

  function show(last = false) {
    setQuery("");
    setActiveIndex(last ? values.length - 1 : Math.max(0, values.indexOf(value)));
    setOpen(true);
  }
  function close() {
    setOpen(false);
    triggerRef.current?.focus({ preventScroll: true });
  }
  function select(next: string) {
    onChange(next);
    close();
  }
  function navigate(event: KeyboardEvent<HTMLInputElement>) {
    if (event.nativeEvent.isComposing) return;
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex(Math.max(0, Math.min(matches.length - 1, active + (event.key === "ArrowDown" ? 1 : -1))));
    } else if (event.key === "Enter") {
      event.preventDefault();
      if (matches[active]) select(matches[active]);
    } else if ((event.key === "Home" || event.key === "End") && event.ctrlKey) {
      event.preventDefault();
      setActiveIndex(event.key === "Home" ? 0 : Math.max(0, matches.length - 1));
    }
  }

  return <div ref={rootRef} className={styles.field}
    onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false); }}
    onKeyDown={event => {
      if (expanded && event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        close();
      }
    }}>
    <label id={id + "-label"} htmlFor={id}>{label}</label>
    <button ref={triggerRef} id={id} type="button" className={styles.trigger}
      aria-labelledby={id + "-label"} aria-haspopup="listbox" aria-expanded={expanded}
      aria-controls={expanded ? listId : undefined} disabled={disabled}
      title={value === helpValue ? helpLabel : value}
      onClick={() => expanded ? close() : show()}
      onKeyDown={event => {
        if (event.key === "ArrowDown" || event.key === "ArrowUp") {
          event.preventDefault();
          show(event.key === "ArrowUp");
        }
      }}>
      <span>{value === helpValue ? helpLabel : value}</span>
      <svg aria-hidden="true" viewBox="0 0 16 16"><path d="m4 6 4 4 4-4" /></svg>
    </button>
    {expanded && <div ref={panelRef} className={styles.panel}>
      <div className={styles.search}>
        <input ref={searchRef} type="search" role="combobox" aria-label="Пошук дослідження"
          aria-controls={listId} aria-expanded="true" aria-autocomplete="list"
          aria-activedescendant={active >= 0 ? id + "-option-" + active : undefined}
          autoComplete="off" placeholder="Знайти дослідження" value={query}
          onChange={event => { setQuery(event.target.value); setActiveIndex(0); }} onKeyDown={navigate} />
      </div>
      <ul ref={listRef} id={listId} role="listbox" tabIndex={-1} aria-label={"Дослідження " + helpValue} aria-busy={loading} className={styles.list}>
        {matches.map((item, index) => <li key={item} id={id + "-option-" + index} role="option"
          aria-selected={item === value} className={styles.option} data-active={index === active}
          onPointerDown={event => event.preventDefault()} onClick={() => select(item)}>
          <span>{item === helpValue ? helpLabel : item}</span>
          {item === value && <svg aria-hidden="true" viewBox="0 0 16 16"><path d="m3 8 3 3 7-7" /></svg>}
        </li>)}
      </ul>
      {matches.length === 0 && <p className={styles.empty} role="status">Досліджень за цим запитом не знайдено.</p>}
    </div>}
    {!expanded && value !== helpValue && <span className="quick-booking__service-detail">{value}</span>}
    {loading && <span className={styles.status} role="status">Завантажуємо дослідження…</span>}
  </div>;
}
