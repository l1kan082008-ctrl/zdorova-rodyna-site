"use client";

import { useEffect, useId, useRef, useState, useSyncExternalStore, type KeyboardEvent, type RefObject } from "react";
import { createPortal } from "react-dom";
import { useModalDialog } from "../../components/useModalDialog";
import {
  bookingDatePresets, formatBookingRange, getBookingMonthDays, getBookingPresetRange,
  getKyivToday, isBookingDate, shiftBookingDate, shiftBookingMonth,
  type BookingDateRange, type BookingPeriod,
} from "./bookingDateRange";
import styles from "./BookingDateRangePicker.module.css";

const compactQuery = "(max-width: 1000px)";
const subscribe = (onChange: () => void) => {
  const media = window.matchMedia(compactQuery);
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
};
const monthTitle = new Intl.DateTimeFormat("uk-UA", { month: "long", year: "numeric", timeZone: "UTC" });
const fullDate = new Intl.DateTimeFormat("uk-UA", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
const months = ["Січень", "Лютий", "Березень", "Квітень", "Травень", "Червень", "Липень", "Серпень", "Вересень", "Жовтень", "Листопад", "Грудень"];
const weekDays = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Нд"];
const minimumDate = "0001-01-01";
const monthOf = (date: string) => `${date.slice(0, 7)}-01`;
const inputDate = (date: string) => date ? date.split("-").reverse().join(".") : "";
function parseInput(value: string) {
  const match = /^(\d{2})\.?\s*(\d{2})\.?\s*(\d{4})$/u.exec(value.trim());
  const date = match ? `${match[3]}-${match[2]}-${match[1]}` : value.trim();
  return isBookingDate(date) ? date : "";
}
function Arrow({ direction = "down" }: { direction?: "left" | "right" | "down" }) {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={direction === "left" ? "m14 6-6 6 6 6" : direction === "right" ? "m10 6 6 6-6 6" : "m6 9 6 6 6-6"} /></svg>;
}
type Props = {
  value: BookingDateRange;
  period: BookingPeriod;
  onChange: (range: BookingDateRange, period: BookingPeriod) => void;
};
type Position = { left: number; top: number };
function pickerPosition(rect: { right: number; bottom: number } | undefined, compact: boolean): Position {
  const width = Math.min(compact ? 460 : 860, window.innerWidth - 32);
  return {
    left: Math.max(16, Math.min((rect?.right ?? window.innerWidth - 16) - width, window.innerWidth - width - 16)),
    top: compact ? 16 : Math.max(16, Math.min((rect?.bottom ?? 16) + 8, window.innerHeight - 640)),
  };
}

export default function BookingDateRangePicker(props: Props) {
  const [open, setOpen] = useState(false);
  const [initialPosition, setInitialPosition] = useState<Position>({ left: 16, top: 16 });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const id = useId();
  const compact = useSyncExternalStore(subscribe, () => window.matchMedia(compactQuery).matches, () => false);
  const label = props.period === "custom" ? "Обрані дати" : bookingDatePresets.find(item => item.id === props.period)?.label;
  return <>
    <button ref={triggerRef} type="button" className={`admin-ui-button ${styles.trigger}`} data-variant="secondary" aria-haspopup="dialog" aria-expanded={open} aria-controls={open ? id : undefined} aria-label={`Період заявок: ${formatBookingRange(props.value)}`} onClick={event => { setInitialPosition(pickerPosition(event.currentTarget.getBoundingClientRect(), compact)); setOpen(true); }}>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="3" /><path d="M7 3v4m10-4v4M3 11h18m-11 4h2m3 0h2" /></svg>
      <span><small>{label}</small><strong>{formatBookingRange(props.value)}</strong></span><Arrow />
    </button>
    {open && createPortal(<RangeDialog {...props} id={id} compact={compact} triggerRef={triggerRef} initialPosition={initialPosition} onClose={() => setOpen(false)} />, document.body)}
  </>;
}

function RangeDialog({ value, period, onChange, id, compact, triggerRef, initialPosition, onClose }: Props & {
  id: string; compact: boolean; triggerRef: RefObject<HTMLButtonElement | null>; initialPosition: Position; onClose: () => void;
}) {
  const today = getKyivToday();
  const currentMonth = monthOf(today);
  const initialMonth = monthOf((compact ? value.to : value.from) || today);
  const [viewMonth, setViewMonth] = useState(initialMonth);
  const [text, setText] = useState({ from: inputDate(value.from), to: inputDate(value.to) });
  const [draftPeriod, setDraftPeriod] = useState<BookingPeriod>(period);
  const [selectingEnd, setSelectingEnd] = useState(false);
  const [hover, setHover] = useState("");
  const [error, setError] = useState("");
  const [focusedDay, setFocusedDay] = useState(() => {
    const selected = compact ? value.to : value.from;
    return selected || today;
  });
  const dialogRef = useRef<HTMLDivElement>(null);
  const dayRef = useRef<HTMLButtonElement>(null);
  const fromRef = useRef<HTMLInputElement>(null);
  const toRef = useRef<HTMLInputElement>(null);
  const [position, setPosition] = useState(initialPosition);
  useModalDialog({ open: true, dialogRef, onClose, initialFocusRef: dayRef, restoreFocusRef: triggerRef });
  useEffect(() => {
    let focusFrame: number | undefined;
    const update = () => {
      const isCompact = window.matchMedia(compactQuery).matches;
      setPosition(pickerPosition(triggerRef.current?.getBoundingClientRect(), isCompact));
      if (isCompact) setViewMonth(monthOf(focusedDay));
      // A breakpoint can remove the focused control. Do not steal focus from
      // an input or navigation button that is still present in the dialog.
      if (document.activeElement === document.body) {
        if (focusFrame !== undefined) cancelAnimationFrame(focusFrame);
        focusFrame = requestAnimationFrame(() => dayRef.current?.focus({ preventScroll: true }));
      }
    };
    const frame = requestAnimationFrame(update);
    window.addEventListener("resize", update);
    return () => {
      cancelAnimationFrame(frame);
      if (focusFrame !== undefined) cancelAnimationFrame(focusFrame);
      window.removeEventListener("resize", update);
    };
  }, [compact, focusedDay, triggerRef]);
  useEffect(() => {
    const html = document.documentElement.style.overflow;
    const body = document.body.style.overflow;
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    return () => { document.documentElement.style.overflow = html; document.body.style.overflow = body; };
  }, []);

  const draft = { from: parseInput(text.from), to: parseInput(text.to) };
  const valid = Boolean(draft.from && draft.to && draft.from <= draft.to && draft.to <= today);
  const summary = draftPeriod === "all" ? "За весь час" : valid ? formatBookingRange(draft) : "Оберіть початок і кінець періоду";
  const highlighted = selectingEnd && draft.from && hover
    ? { from: draft.from < hover ? draft.from : hover, to: draft.from < hover ? hover : draft.from }
    : draft;
  const latestFirstMonth = compact || currentMonth === minimumDate ? currentMonth : shiftBookingMonth(currentMonth, -1);
  // Keep the focused month's keyed DOM when switching from two calendars to one.
  const effectiveViewMonth = compact ? monthOf(focusedDay) : viewMonth > latestFirstMonth ? latestFirstMonth : viewMonth;
  const shownMonths = compact ? [effectiveViewMonth] : [effectiveViewMonth, shiftBookingMonth(effectiveViewMonth, 1)];
  const year = Number(effectiveViewMonth.slice(0, 4));
  const currentYear = Number(today.slice(0, 4));
  const years = Array.from({ length: currentYear - Math.min(currentYear - 10, year) + 1 }, (_, i) => currentYear - i);

  const setDates = (range: BookingDateRange) => setText({ from: inputDate(range.from), to: inputDate(range.to) });
  const showMonth = (month: string) => {
    const next = month > latestFirstMonth ? latestFirstMonth : month;
    setViewMonth(next); setFocusedDay(next); setHover("");
  };
  const choosePreset = (next: BookingPeriod) => {
    setDraftPeriod(next); setSelectingEnd(false); setHover(""); setError("");
    if (next === "custom") return;
    const range = getBookingPresetRange(next, today);
    setDates(range);
    const first = monthOf((compact ? range.to : range.from) || today);
    setViewMonth(first); setFocusedDay((compact ? range.to : range.from) || today);
  };
  const chooseDay = (day: string) => {
    setDraftPeriod("custom"); setError(""); setHover(""); setFocusedDay(day);
    if (selectingEnd && draft.from) {
      setDates(day < draft.from ? { from: day, to: draft.from } : { from: draft.from, to: day });
      setSelectingEnd(false);
    } else {
      setDates({ from: day, to: day }); setSelectingEnd(true);
    }
  };
  const editDate = (field: "from" | "to", input: string) => {
    const date = parseInput(input);
    const displayValue = /^\d{8}$/u.test(input) && date ? inputDate(date) : input;
    setText(previous => ({ ...previous, [field]: displayValue }));
    setDraftPeriod("custom"); setHover(""); setError("");
    if (date && date <= today) { setViewMonth(monthOf(date)); setFocusedDay(date); }
  };
  const calendarKey = (event: KeyboardEvent<HTMLButtonElement>, day: string) => {
    let next = day;
    const weekday = (new Date(`${day}T12:00:00Z`).getUTCDay() + 6) % 7;
    const offsets: Record<string, number> = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7, Home: -weekday, End: 6 - weekday };
    if (event.key in offsets) {
      const offset = offsets[event.key];
      next = offset < 0 && day < shiftBookingDate(minimumDate, -offset) ? minimumDate : shiftBookingDate(day, offset);
    }
    else if (event.key === "PageUp" || event.key === "PageDown") {
      const offset = (event.key === "PageUp" ? -1 : 1) * (event.shiftKey ? 12 : 1);
      const monthsSinceMinimum = (Number(day.slice(0, 4)) - 1) * 12 + Number(day.slice(5, 7)) - 1;
      const month = shiftBookingMonth(monthOf(day), Math.max(offset, -monthsSinceMinimum));
      const days = getBookingMonthDays(month).filter((date): date is string => date !== null);
      next = days[Math.min(Number(day.slice(8)), days.length) - 1];
    } else return;
    event.preventDefault();
    if (next > today) next = today;
    const nextMonth = monthOf(next);
    if (nextMonth < effectiveViewMonth) setViewMonth(nextMonth);
    else if (nextMonth > shownMonths[shownMonths.length - 1]) setViewMonth(compact ? nextMonth : shiftBookingMonth(nextMonth, -1));
    setFocusedDay(next);
    requestAnimationFrame(() => dialogRef.current?.querySelector<HTMLButtonElement>(`button[data-date="${next}"]`)?.focus());
  };
  const apply = () => {
    if (draftPeriod !== "all" && !valid) {
      setError(!draft.from || !draft.to ? "Вкажіть обидві дати у форматі ДД.ММ.РРРР." : draft.from > draft.to ? "Дата початку має бути не пізнішою за дату завершення." : "Оберіть сьогоднішню або попередню дату.");
      (!draft.from ? fromRef : toRef).current?.focus(); return;
    }
    onChange(draftPeriod === "all" ? { from: "", to: "" } : draft, draftPeriod); onClose();
  };

  return <div className={`admin-ui ${styles.layer}`} data-admin-ui role="presentation" onClick={event => { if (event.target === event.currentTarget) onClose(); }}>
    <div ref={dialogRef} id={id} role="dialog" aria-modal="true" aria-labelledby={`${id}-title`} tabIndex={-1} className={styles.dialog} style={{ left: position.left, top: position.top, maxHeight: `calc(100dvh - ${position.top + 16}px)` }}>
      <header className={styles.header}><h3 id={`${id}-title`}>Період заявок</h3><button type="button" className="admin-ui-icon-button" data-variant="ghost" aria-label="Закрити календар" onClick={onClose}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" /></svg></button></header>
      <div className={styles.body}>
        {!compact && <aside className={styles.presets} aria-label="Швидкий вибір періоду">
          {bookingDatePresets.map(item => <button type="button" key={item.id} className={`admin-ui-button ${styles.preset}`} data-variant="ghost" aria-pressed={draftPeriod === item.id} onClick={() => choosePreset(item.id)}><span>{item.label}</span>{draftPeriod === item.id && <span aria-hidden="true">✓</span>}</button>)}
        </aside>}
        <div className={styles.main}>
          {compact && <label className={styles.quickSelect}>Швидкий вибір<select value={draftPeriod} onChange={event => choosePreset(event.target.value as BookingPeriod)}><option value="custom">Обрати дати</option>{bookingDatePresets.map(item => <option key={item.id} value={item.id}>{item.label}</option>)}</select></label>}
          <div className={styles.fields}>
            <label>Дата початку<input ref={fromRef} type="text" inputMode="numeric" autoComplete="off" maxLength={10} value={text.from} placeholder="ДД.ММ.РРРР" aria-invalid={Boolean(error)} aria-describedby={error ? `${id}-error` : undefined} onFocus={() => setSelectingEnd(false)} onChange={event => editDate("from", event.target.value)} onKeyDown={event => { if (event.key === "Enter") { event.preventDefault(); apply(); } }} /></label>
            <label>Дата завершення<input ref={toRef} type="text" inputMode="numeric" autoComplete="off" maxLength={10} value={text.to} placeholder="ДД.ММ.РРРР" aria-invalid={Boolean(error)} aria-describedby={error ? `${id}-error` : undefined} onFocus={() => setSelectingEnd(Boolean(draft.from))} onChange={event => editDate("to", event.target.value)} onKeyDown={event => { if (event.key === "Enter") { event.preventDefault(); apply(); } }} /></label>
          </div>
          <div className={styles.monthNav}>
            <button type="button" className="admin-ui-icon-button" data-variant="ghost" aria-label="Попередній місяць" disabled={effectiveViewMonth === minimumDate} onClick={() => showMonth(shiftBookingMonth(effectiveViewMonth, -1))}><Arrow direction="left" /></button>
            <div><select aria-label="Місяць календаря" value={effectiveViewMonth.slice(5, 7)} onChange={event => showMonth(`${effectiveViewMonth.slice(0, 4)}-${event.target.value}-01`)}>{months.map((label, i) => <option key={label} value={String(i + 1).padStart(2, "0")} disabled={`${effectiveViewMonth.slice(0, 4)}-${String(i + 1).padStart(2, "0")}-01` > latestFirstMonth}>{label}</option>)}</select><select aria-label="Рік календаря" value={year} onChange={event => showMonth(`${event.target.value.padStart(4, "0")}-${effectiveViewMonth.slice(5, 7)}-01`)}>{years.map(value => <option key={value} value={value}>{value}</option>)}</select></div>
            <button type="button" className="admin-ui-icon-button" data-variant="ghost" aria-label="Наступний місяць" disabled={shownMonths[shownMonths.length - 1] >= currentMonth} onClick={() => showMonth(shiftBookingMonth(effectiveViewMonth, 1))}><Arrow direction="right" /></button>
          </div>
          <div className={styles.calendars} onMouseLeave={() => setHover("")}>
            {shownMonths.map(month => {
              const days = getBookingMonthDays(month);
              const title = monthTitle.format(new Date(`${month}T12:00:00Z`));
              return <div className={styles.month} key={month}>
                <p className={styles.monthTitle} aria-live="polite">{title}</p>
                <table role="grid" aria-multiselectable="true" aria-label={title} className={styles.grid}>
                  <thead><tr>{weekDays.map(day => <th key={day} scope="col">{day}</th>)}</tr></thead>
                  <tbody>{Array.from({ length: 6 }, (_, row) => <tr key={row}>{days.slice(row * 7, row * 7 + 7).map((day, column) => {
                    const selected = Boolean(day && highlighted.from && highlighted.to && day >= highlighted.from && day <= highlighted.to);
                    const start = day === highlighted.from, end = day === highlighted.to;
                    return <td key={column} aria-selected={selected} className={styles.cell} data-selected={selected} data-start={start} data-end={end}>
                      {day && <button ref={day === focusedDay ? dayRef : undefined} type="button" data-date={day} className={styles.day} data-endpoint={selected && (start || end)} aria-label={`${fullDate.format(new Date(`${day}T12:00:00Z`))}${day === draft.from ? ", початок періоду" : ""}${day === draft.to ? ", кінець періоду" : ""}`} aria-current={day === today ? "date" : undefined} disabled={day > today} tabIndex={day === focusedDay ? 0 : -1} onFocus={() => setFocusedDay(day)} onClick={() => chooseDay(day)} onMouseEnter={() => setHover(day)} onKeyDown={event => calendarKey(event, day)}>{Number(day.slice(8))}</button>}
                    </td>;
                  })}</tr>)}</tbody>
                </table>
              </div>;
            })}
          </div>
          <p className={styles.hint} role="status">{selectingEnd ? "Оберіть кінцеву дату або застосуйте один день." : "Натисніть початкову, потім кінцеву дату."}</p>
          {error && <p className={styles.error} id={`${id}-error`} role="alert">{error}</p>}
        </div>
      </div>
      <footer className={styles.footer}><span>{summary}</span><div><button type="button" className="admin-ui-button" data-variant="ghost" onClick={onClose}>Скасувати</button><button type="button" className="admin-ui-button" data-variant="primary" onClick={apply}>Застосувати</button></div></footer>
    </div>
  </div>;
}
