"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { formatBookingDateTime } from "./bookingDateTime";
import { parseBookingDetails } from "@/lib/bookingDetails";
import { bookingCategoryLabels, bookingStatusLabels, bookingWorkflowStatuses, type BookingCategory, type AdminBooking, type AdminBookingsResponse } from "@/lib/adminBookingStatistics";
import type { BookingStatus } from "../../api/bookings/bookingStore";
import styles from "./bookings.module.css";

type DateRange = { from: string; to: string };
type Period = "today" | "7" | "30" | "all" | "custom";
const workflowStatusEntries: [BookingStatus, string][] = bookingWorkflowStatuses.map((key) => [key, bookingStatusLabels[key]]);
const completedStatusEntry: [BookingStatus, string] = ["closed", bookingStatusLabels.closed];
const categoryEntries = Object.entries(bookingCategoryLabels) as [BookingCategory, string][];
const statusCountLabels: Record<BookingStatus, string> = { new: "Нові", contacted: "Зв’язалися", confirmed: "Підтверджені", no_answer: "Не відповідає", closed: "Завершені", cancelled: "Скасовані" };
const countFormat = new Intl.NumberFormat("uk-UA");
const shortDate = new Intl.DateTimeFormat("uk-UA", { timeZone: "Europe/Kyiv", day: "2-digit", month: "2-digit", year: "numeric" });
const shortTime = new Intl.DateTimeFormat("uk-UA", { timeZone: "Europe/Kyiv", hour: "2-digit", minute: "2-digit", hourCycle: "h23" });
const pulsePreferenceKey = "zr-admin-booking-pulse";

function localBookingPhone(phone: string) {
  const digits = phone.replace(/\D/g, "");
  if (/^380\d{9}$/.test(digits)) return digits.slice(2);
  return /^0\d{9}$/.test(digits) ? digits : phone;
}

function presetRange(period: Exclude<Period, "custom">): DateRange {
  if (period === "all") return { from: "", to: "" };
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Kyiv", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date());
  const part = (type: string) => parts.find((item) => item.type === type)!.value;
  const to = `${part("year")}-${part("month")}-${part("day")}`;
  const start = new Date(`${to}T12:00:00Z`);
  start.setUTCDate(start.getUTCDate() - (period === "today" ? 0 : Number(period) - 1));
  return { from: start.toISOString().slice(0, 10), to };
}

function Chevron({ open = false }: { open?: boolean }) {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={open ? "m6 15 6-6 6 6" : "m6 9 6 6 6-6"} /></svg>;
}

export default function BookingsAdminPage() {
  const [period, setPeriod] = useState<Period>("30");
  const [range, setRange] = useState<DateRange>(() => presetRange("30"));
  const [draftRange, setDraftRange] = useState<DateRange>(() => presetRange("30"));
  const [dateError, setDateError] = useState("");
  const [query, setQuery] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<BookingCategory | "">("");
  const [status, setStatus] = useState<BookingStatus | "">("");
  const [page, setPage] = useState(1);
  const [revision, setRevision] = useState(0);
  const [result, setResult] = useState<{ key: string; rangeKey: string; payload: AdminBookingsResponse } | null>(null);
  const [loadError, setLoadError] = useState<{ key: string; message: string } | null>(null);
  const [mutationError, setMutationError] = useState("");
  const [notice, setNotice] = useState("");
  const [pendingId, setPendingId] = useState("");
  const [expandedId, setExpandedId] = useState("");
  const [statsOpen, setStatsOpen] = useState(true);
  const [pulseEnabled, setPulseEnabled] = useState(true);
  const [copyFeedback, setCopyFeedback] = useState<{ id: string; error: boolean; message: string } | null>(null);
  const copyRequestRef = useRef(0);
  const listHeadingRef = useRef<HTMLDivElement>(null);

  useEffect(() => () => { copyRequestRef.current += 1; }, []);

  useEffect(() => {
    if (!copyFeedback) return;
    const timer = window.setTimeout(() => setCopyFeedback(null), copyFeedback.error ? 8000 : 2500);
    return () => window.clearTimeout(timer);
  }, [copyFeedback]);

  const copyPhone = async (booking: AdminBooking) => {
    const request = ++copyRequestRef.current;
    setCopyFeedback(null);
    try {
      await navigator.clipboard.writeText(localBookingPhone(booking.phone));
      if (copyRequestRef.current === request) setCopyFeedback({ id: booking.id, error: false, message: "Номер скопійовано" });
    } catch {
      if (copyRequestRef.current === request) setCopyFeedback({ id: booking.id, error: true, message: "Не вдалося скопіювати. Виділіть номер і скопіюйте його вручну." });
    }
  };

  useEffect(() => {
    try { setPulseEnabled(window.localStorage.getItem(pulsePreferenceKey) !== "off"); }
    catch { /* Keep the default when browser storage is unavailable. */ }
  }, []);

  const togglePulse = () => {
    const enabled = !pulseEnabled;
    setPulseEnabled(enabled);
    try { window.localStorage.setItem(pulsePreferenceKey, enabled ? "on" : "off"); }
    catch { /* The toggle still works for the current visit. */ }
  };

  useEffect(() => {
    const timer = window.setTimeout(() => { setSearch(query.trim()); setPage(1); }, 300);
    return () => window.clearTimeout(timer);
  }, [query]);

  const requestQuery = useMemo(() => {
    const params = new URLSearchParams({ page: String(page), pageSize: "25" });
    if (range.from) params.set("from", range.from);
    if (range.to) params.set("to", range.to);
    if (category) params.set("category", category);
    if (status) params.set("status", status);
    if (search) params.set("q", search);
    return params.toString();
  }, [range, category, status, search, page]);
  const requestKey = `${requestQuery}:${revision}`;
  const rangeKey = `${range.from}:${range.to}`;
  const current = result?.payload ?? null;
  const error = loadError?.key === requestKey && result?.key !== requestKey ? loadError.message : "";
  const loading = result?.key !== requestKey && !error;

  useEffect(() => {
    const controller = new AbortController();
    fetch(`/api/admin/bookings?${requestQuery}`, { signal: controller.signal, cache: "no-store" })
      .then(async (response) => {
        const payload = await response.json();
        if (!response.ok || !Array.isArray(payload.bookings) || !payload.stats) throw new Error(payload.error || "Не вдалося завантажити заявки");
        if (!controller.signal.aborted) {
          setResult({ key: requestKey, rangeKey, payload });
          setLoadError(null);
        }
      })
      .catch((reason: unknown) => {
        if (!controller.signal.aborted) setLoadError({ key: requestKey, message: reason instanceof Error ? reason.message : "Не вдалося завантажити заявки" });
      });
    return () => controller.abort();
  }, [requestQuery, requestKey, rangeKey]);

  const selectPeriod = (value: Period) => {
    setPeriod(value); setDateError("");
    if (value === "custom") { setDraftRange(range.from ? range : presetRange("30")); return; }
    setRange(presetRange(value)); setPage(1);
  };
  const applyDates = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!draftRange.from || !draftRange.to || draftRange.from > draftRange.to) { setDateError("Оберіть дати: початок періоду не може бути пізніше за кінець."); return; }
    setDateError(""); setRange(draftRange); setPage(1);
  };
  const resetFilters = () => { setQuery(""); setSearch(""); setCategory(""); setStatus(""); setPage(1); };
  const goToPage = (next: number) => {
    setPage(next); setExpandedId("");
    listHeadingRef.current?.scrollIntoView({ block: "start", behavior: "instant" });
  };

  const mutateBooking = async (booking: AdminBooking, nextStatus?: BookingStatus) => {
    if (pendingId) return;
    if (!nextStatus && !window.confirm(`Видалити заявку ${booking.reference}? Цю дію неможливо скасувати.`)) return;
    setPendingId(booking.id); setMutationError(""); setNotice("");
    try {
      const response = await fetch("/api/admin/bookings", {
        method: nextStatus ? "PATCH" : "DELETE", headers: { "content-type": "application/json" },
        body: JSON.stringify(nextStatus ? { id: booking.id, status: nextStatus } : { id: booking.id }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Не вдалося зберегти зміни");
      setNotice(nextStatus ? `Статус заявки ${booking.reference} оновлено.` : `Заявку ${booking.reference} видалено.`);
      if (!nextStatus) setExpandedId("");
      setRevision((value) => value + 1);
    } catch (reason) { setMutationError(reason instanceof Error ? reason.message : "Не вдалося зберегти зміни"); }
    finally { setPendingId(""); }
  };

  const stats = result?.rangeKey === rangeKey && !error ? result.payload.stats : undefined;
  const showCompletedStatus = Boolean(stats?.statuses.closed) || status === "closed";
  const statusEntries = showCompletedStatus ? [...workflowStatusEntries, completedStatusEntry] : workflowStatusEntries;
  const hasFilters = Boolean(category || status || query);
  const rangeLabel = range.from ? `${range.from.split("-").reverse().join(".")} — ${range.to.split("-").reverse().join(".")}` : "Усі збережені заявки";

  return (
    <div className={`admin-bookings-page ${styles.page}`} data-pulse={pulseEnabled}>
      <header className={styles.heading}>
        <div className="admin-intro"><span className="section-kicker">Адмін-панель</span><h1>Заявки пацієнтів</h1><p>Кількість звернень, напрямки та робота із заявками.</p></div>
        <button type="button" className="admin-ui-button" data-variant="secondary" disabled={loading || Boolean(pendingId)} onClick={() => setRevision((value) => value + 1)}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 7v5h-5M4 17v-5h5" /><path d="M6 7a7 7 0 0 1 12-1l2 3M4 15l2 3a7 7 0 0 0 12-1" /></svg>Оновити
        </button>
      </header>
      <section className={styles.overview} aria-labelledby="booking-statistics-heading" aria-busy={loading}>
        <div className={styles.overviewHeading}>
          <div><h2 id="booking-statistics-heading">Статистика заявок</h2><p>{rangeLabel}</p></div>
          <div className={styles.overviewControls}><label className={styles.period}><span>Період</span><select value={period} onChange={(event) => selectPeriod(event.target.value as Period)}><option value="today">Сьогодні</option><option value="7">Останні 7 днів</option><option value="30">Останні 30 днів</option><option value="all">Усі збережені</option><option value="custom">Обрати дати</option></select></label><button type="button" className="admin-ui-icon-button" data-variant="ghost" aria-label={statsOpen ? "Згорнути статистику" : "Розгорнути статистику"} aria-expanded={statsOpen} aria-controls="booking-statistics-content" onClick={() => setStatsOpen(!statsOpen)}><Chevron open={statsOpen} /></button></div>
        </div>
        {period === "custom" ? <form className={styles.dateForm} onSubmit={applyDates}>
          <label><span>Від</span><input type="date" required value={draftRange.from} max={draftRange.to || undefined} onChange={(event) => setDraftRange({ ...draftRange, from: event.target.value })} /></label>
          <label><span>До</span><input type="date" required value={draftRange.to} min={draftRange.from || undefined} onChange={(event) => setDraftRange({ ...draftRange, to: event.target.value })} /></label>
          <button type="submit" className="admin-ui-button" data-variant="primary">Застосувати</button>
          {dateError ? <p className={styles.error} role="alert">{dateError}</p> : null}
        </form> : null}
        <div id="booking-statistics-content" hidden={!statsOpen}><div className={styles.metrics} data-legacy={showCompletedStatus}>
          <button type="button" className={`${styles.metric} ${styles.metricTotal}`} aria-pressed={!hasFilters} onClick={resetFilters}><span>Усього заявок</span><strong>{stats ? countFormat.format(stats.total) : "—"}</strong></button>
          {statusEntries.map(([key]) => <button key={key} type="button" className={styles.metric} data-status={key} aria-pressed={status === key} onClick={() => { setStatus(status === key ? "" : key); setPage(1); }}><span><i aria-hidden="true" />{statusCountLabels[key]}</span><strong>{stats ? countFormat.format(stats.statuses[key]) : "—"}</strong></button>)}
        </div>
        <div className={styles.categoriesHeading}><h3>За категоріями</h3><span>Натисніть, щоб переглянути заявки</span></div>
        <div className={styles.categories}>{categoryEntries.map(([key, label]) => {
          const count = stats?.categories.find((item) => item.id === key)?.count ?? 0;
          return <button type="button" key={key} className={styles.category} data-category={key} aria-pressed={category === key} onClick={() => { setCategory(category === key ? "" : key); setPage(1); }}><span className={styles.categoryLabel}>{label}</span><strong>{stats ? countFormat.format(count) : "—"}</strong><span className={styles.categoryTrack} aria-hidden="true"><span style={{ width: `${stats?.total ? count / stats.total * 100 : 0}%` }} /></span></button>;
        })}</div>
        <p className={styles.note}>За датою створення, час за Києвом. Усього — разом зі скасованими. Видалені заявки не враховуються.</p>
        </div>
      </section>
      <section className={styles.workspace} aria-labelledby="booking-list-heading" aria-busy={loading}>
        <div className={styles.listHeading} ref={listHeadingRef}>
          <h2 id="booking-list-heading">Список заявок</h2>
          <div className={styles.listActions}>
            {hasFilters ? <button className="admin-ui-button" data-variant="ghost" type="button" onClick={resetFilters}>Скинути фільтри</button> : null}
            <button type="button" className={`admin-ui-button ${styles.pulseToggle}`} data-variant="ghost" aria-pressed={pulseEnabled} title={pulseEnabled ? "Призупинити пульсацію нових заявок" : "Увімкнути пульсацію нових заявок"} onClick={togglePulse}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{pulseEnabled ? <path d="M9 5v14M15 5v14" /> : <path d="m8 5 11 7-11 7Z" />}</svg>
              Пульсація нових
            </button>
          </div>
        </div>
        <div className={styles.filters}>
          <label className={styles.search}><span>Знайти заявку</span><input type="search" value={query} maxLength={200} onChange={(event) => setQuery(event.target.value)} placeholder="Ім’я, телефон, лікар або номер" /></label>
          <label><span>Категорія</span><select value={category} onChange={(event) => { setCategory(event.target.value as BookingCategory | ""); setPage(1); }}><option value="">Усі категорії</option>{categoryEntries.map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label>
          <label><span>Статус</span><select value={status} onChange={(event) => { setStatus(event.target.value as BookingStatus | ""); setPage(1); }}><option value="">Усі статуси</option>{statusEntries.map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label>
        </div>
        <p className={styles.srOnly} role="status">{loading ? "Завантажуємо заявки…" : current ? `Знайдено заявок: ${current.total}.` : ""} {notice}</p>
        {mutationError ? <p className={styles.error} role="alert">{mutationError}</p> : null}
        {error ? <div className={styles.empty} role="alert"><strong>Не вдалося завантажити заявки</strong><p>{error}</p><button type="button" className="admin-ui-button" data-variant="secondary" onClick={() => setRevision((value) => value + 1)}>Спробувати ще раз</button></div> : null}
        {loading && !current ? <div className={styles.empty}>Завантажуємо заявки та статистику…</div> : !error && current && current.bookings.length ? <>
          <div className={styles.columnHeadings} aria-hidden="true"><span>Дата / час</span><span>Пацієнт / телефон</span><span>Категорія</span><span>Лікар / послуга</span><span>Статус</span><span /></div>
          <ol className={styles.list} aria-label="Заявки пацієнтів" data-loading={loading}>{current.bookings.map((booking) => {
            const createdAt = formatBookingDateTime(booking.createdAt);
            const date = createdAt.dateTime ? new Date(createdAt.dateTime) : null;
            const details = parseBookingDetails(booking.comment);
            const open = expandedId === booking.id;
            const service = booking.doctor || (details.studies.length ? details.studies.join("; ") : booking.service);
            const phone = localBookingPhone(booking.phone);
            return <li className={styles.item} key={booking.id} data-expanded={open} data-status={booking.status} data-category={booking.category}>
              <div className={styles.row}>
                <time className={styles.date} dateTime={createdAt.dateTime} title={createdAt.label}>{date ? <><span>{shortDate.format(date)}</span><small>{shortTime.format(date)}</small></> : <span>Дата недоступна</span>}</time>
                <div className={styles.patient}>
                  <strong title={booking.patientName}>{booking.patientName}</strong>
                  <button type="button" className={`admin-ui-button ${styles.phoneCopy}`} data-variant="ghost" aria-label={`Скопіювати телефон ${phone}`} title="Скопіювати номер телефону" onClick={() => void copyPhone(booking)}>
                    <span>{phone}</span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{copyFeedback?.id === booking.id && !copyFeedback.error ? <path d="m5 12 4 4L19 6" /> : <><rect x="8" y="8" width="12" height="12" rx="2" /><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3" /></>}</svg>
                  </button>
                </div>
                <div className={styles.kind}><span>{bookingCategoryLabels[booking.category]}</span></div>
                <div className={styles.service} title={service}>{service || "Без уточнення"}</div>
                <label className={styles.rowStatus}><span className={styles.srOnly}>Статус заявки {booking.reference}</span><select value={booking.status} data-status={booking.status} disabled={loading || Boolean(pendingId)} onChange={(event) => mutateBooking(booking, event.target.value as BookingStatus)}>{(booking.status === "closed" ? [...workflowStatusEntries, completedStatusEntry] : workflowStatusEntries).map(([key, label]) => <option value={key} key={key}>{label}</option>)}</select></label>
                <button type="button" className={`admin-ui-icon-button ${styles.expand}`} data-variant="ghost" aria-label={`${open ? "Згорнути" : "Деталі заявки"} ${booking.reference}`} aria-expanded={open} aria-controls={`booking-${booking.id}`} onClick={() => setExpandedId(open ? "" : booking.id)}><Chevron open={open} /></button>
              </div>
              {open ? <div className={styles.expanded} id={`booking-${booking.id}`}>
                <div className={styles.detailHeading}><div><strong>{booking.patientName}</strong><span>{booking.reference} · {createdAt.label}</span></div><button type="button" className="admin-ui-button" data-variant="ghost" data-intent="danger" aria-label={`Видалити заявку ${booking.reference}`} aria-busy={pendingId === booking.id} disabled={loading || Boolean(pendingId)} onClick={() => mutateBooking(booking)}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 6h18M9 6V4h6v2M5 6l1 14h12l1-14M10 10v6M14 10v6" /></svg>{pendingId === booking.id ? "Зберігаємо…" : "Видалити"}</button></div>
                <dl className={styles.details}>
                  <div><dt>Послуга</dt><dd>{booking.service || "Не вказано"}</dd></div>
                  {booking.doctor ? <div><dt>Лікар</dt><dd>{booking.doctor}</dd></div> : null}
                  {details.location ? <div><dt>Відділення</dt><dd>{details.location}</dd></div> : null}
                  {details.studies.length ? <div className={styles.studies}><dt>Обрані дослідження</dt><dd><ol>{details.studies.map((study, index) => <li key={`${index}-${study}`}>{study}</li>)}</ol></dd></div> : null}
                  {details.total ? <div><dt>Орієнтовна сума</dt><dd className={styles.total}>{details.total}</dd></div> : null}
                  {details.comment ? <div className={styles.comment}><dt>Коментар</dt><dd>{details.comment}</dd></div> : null}
                </dl>
              </div> : null}
            </li>;
          })}</ol>
          <div className={styles.pagination}><span>{loading ? "Оновлюємо список…" : `${(current.page - 1) * current.pageSize + 1}–${Math.min(current.page * current.pageSize, current.total)} із ${countFormat.format(current.total)}`}</span><div><button type="button" className="admin-ui-button" data-variant="secondary" disabled={loading || current.page <= 1} onClick={() => goToPage(current.page - 1)}>Назад</button><span>{current.page} / {current.totalPages}</span><button type="button" className="admin-ui-button" data-variant="secondary" disabled={loading || current.page >= current.totalPages} onClick={() => goToPage(current.page + 1)}>Далі</button></div></div>
        </> : !error && current ? <div className={styles.empty}><strong>{loading ? "Оновлюємо список…" : hasFilters ? "За цими фільтрами заявок немає" : "За цей період заявок немає"}</strong><p>{hasFilters ? "Змініть пошук, категорію чи статус або скиньте фільтри." : "Оберіть інший період або оновіть список пізніше."}</p>{hasFilters ? <button type="button" className="admin-ui-button" data-variant="secondary" onClick={resetFilters}>Скинути фільтри</button> : null}</div> : null}
      </section>
      <p className={copyFeedback ? styles.copyFeedback : styles.srOnly} role="status" aria-atomic="true" data-error={copyFeedback?.error}>{copyFeedback?.message ?? ""}</p>
    </div>
  );
}
