"use client";

import { ChangeEvent, useMemo, useRef, useState } from "react";
import type { PriceItem } from "../../prices/priceData";
import {
  parsePriceWorkbook,
  type ParsedPriceImportRow,
  type PriceImportIssue,
} from "./priceImport";

type ManagedPriceItem = PriceItem & {
  isActive: boolean;
  sortOrder: number;
};

type ImportResponse = {
  items?: ManagedPriceItem[];
  summary?: { created: number; updated: number; hidden: number };
  error?: string;
};

function normalize(value: string) {
  return value.trim().toLocaleLowerCase("uk-UA");
}

function formatIssue(issue: PriceImportIssue) {
  return `${issue.sheet}${issue.row ? `, рядок ${issue.row}` : ""}: ${issue.message}`;
}

export default function PriceImportPanel({
  items,
  onImported,
}: {
  items: ManagedPriceItem[];
  onImported: (items: ManagedPriceItem[]) => void;
}) {
  const fileInput = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState("");
  const [rows, setRows] = useState<ParsedPriceImportRow[]>([]);
  const [issues, setIssues] = useState<PriceImportIssue[]>([]);
  const [parsing, setParsing] = useState(false);
  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState("");
  const [status, setStatus] = useState("");

  const importSummary = useMemo(() => {
    const ids = new Set(items.map((item) => item.id));
    const byName = new Map(items.map(item => [`${item.category}::${normalize(item.name)}`, item.id]));
    const selected = new Set<string>();
    let updated = 0;
    let created = 0;
    for (const row of rows) {
      const id = row.id && ids.has(row.id) ? row.id : byName.get(`${row.category}::${normalize(row.name)}`);
      if (id) { selected.add(id); updated += 1; }
      else created += 1;
    }
    const hidden = items.filter(item => item.isActive && !selected.has(item.id)).length;
    return { updated, created, hidden };
  }, [items, rows]);

  const downloadPrices = async () => {
    setExporting(true);
    setExportError("");
    try {
      const response = await fetch("/api/admin/prices", { cache: "no-store" });
      const payload = await response.json() as ImportResponse;
      if (!response.ok || !payload.items) throw new Error(payload.error || "Не вдалося завантажити прайс.");
      const { createPriceWorkbook } = await import("./priceExport");
      const bytes = await createPriceWorkbook(payload.items);
      const url = URL.createObjectURL(new Blob([bytes], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }));
      const link = document.createElement("a");
      link.href = url;
      link.download = `prais-${new Date().toISOString().slice(0, 10)}.xlsx`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch (error) {
      setExportError(error instanceof Error ? error.message : "Не вдалося створити Excel.");
    } finally { setExporting(false); }
  };

  const reset = () => {
    setFileName("");
    setRows([]);
    setIssues([]);
    setStatus("");
    if (fileInput.current) fileInput.current.value = "";
  };

  const selectFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setParsing(true);
    setStatus("");
    setFileName(file.name);
    try {
      const result = await parsePriceWorkbook(await file.arrayBuffer());
      setRows(result.rows);
      setIssues(result.issues);
    } catch (error) {
      setRows([]);
      setIssues([
        {
          sheet: file.name,
          message:
            error instanceof Error
              ? error.message
              : "Не вдалося прочитати Excel-файл.",
        },
      ]);
    } finally {
      setParsing(false);
    }
  };

  const importRows = async () => {
    if (!rows.length || issues.length) return;
    setImporting(true);
    setStatus("");
    try {
      const response = await fetch("/api/admin/prices/import", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          items: rows.map((row) => ({
            id: row.id,
            code: row.code,
            name: row.name,
            category: row.category,
            categoryLabel: row.categoryLabel,
            amount: row.amount,
            turnaround: row.turnaround,
            citoAvailable: row.citoAvailable,
            citoSurcharge: row.citoSurcharge,
            aliases: row.aliases,
            isActive: row.isActive,
            sortOrder: row.sortOrder,
          })),
        }),
      });
      const payload = (await response.json()) as ImportResponse;
      if (!response.ok || !payload.items) {
        throw new Error(payload.error || "Не вдалося імпортувати прайс.");
      }

      onImported(payload.items);
      const summary = payload.summary ?? importSummary;
      setStatus(
        `Готово: оновлено ${summary.updated}, додано ${summary.created}, приховано відсутніх у файлі ${summary.hidden} позицій.`,
      );
      setRows([]);
      setIssues([]);
      setFileName("");
      if (fileInput.current) fileInput.current.value = "";
    } catch (error) {
      setStatus(
        error instanceof Error ? error.message : "Сталася помилка імпорту.",
      );
    } finally {
      setImporting(false);
    }
  };

  return (
    <section className="admin-price-import" aria-labelledby="price-import-title">
      <div className="admin-price-import-heading">
        <div>
          <span>Масове оновлення</span>
          <h2 id="price-import-title">Імпорт прайса з Excel</h2>
          <p>
            Підтримуються .xlsx, .xls і .csv. Обов’язкові колонки: «Назва» та
            «Ціна». Категорію можна вказати в колонці або назвою аркуша.
            Для термінового виконання додайте необов’язкову колонку «CITO доступно».
            Доплата розраховується автоматично за кількістю обраних досліджень.
            Старі файли з колонкою «Доплата CITO» також підтримуються.
          </p>
        </div>
        <div className="admin-import-file-actions">
          <button className="admin-ui-button" data-variant="secondary" type="button" onClick={downloadPrices} disabled={exporting || importing}>
            {exporting ? "Готуємо Excel…" : "Скачати актуальний прайс Excel"}
          </button>
          <label className="admin-import-file admin-ui-button" data-variant="primary">
            <input
              ref={fileInput}
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={selectFile}
              disabled={parsing || importing}
            />
            <span>{parsing ? "Перевіряємо…" : "Обрати Excel-файл"}</span>
          </label>
          {fileName ? (
            <button className="admin-ui-button" data-variant="ghost" type="button" onClick={reset} disabled={importing}>
              Скасувати
            </button>
          ) : null}
        </div>
      </div>

      {exportError ? <p role="alert">{exportError}</p> : null}
      <p className="admin-import-note">
        Збіги за ID або назвою в межах категорії буде оновлено, нові позиції —
        додано. Усі позиції, яких немає у файлі, буде приховано із сайту. Завантажуйте повний прайс усіх категорій.
      </p>

      {fileName ? (
        <div className="admin-import-metrics" aria-label="Результат перевірки файлу">
          <span><b>Файл</b>{fileName}</span>
          <span><b>Готово</b>{rows.length}</span>
          <span><b>Оновиться</b>{importSummary.updated}</span>
          <span><b>Нових</b>{importSummary.created}</span>
          <span><b>Зникне із сайту</b>{importSummary.hidden}</span>
          <span className={issues.length ? "has-errors" : undefined}>
            <b>Помилок</b>{issues.length}
          </span>
        </div>
      ) : null}

      {issues.length ? (
        <div className="admin-import-issues" role="alert">
          <strong>Виправте файл перед імпортом:</strong>
          <ul>
            {issues.slice(0, 8).map((issue, index) => (
              <li key={`${issue.sheet}-${issue.row ?? 0}-${index}`}>
                {formatIssue(issue)}
              </li>
            ))}
          </ul>
          {issues.length > 8 ? (
            <p>І ще {issues.length - 8} помилок.</p>
          ) : null}
        </div>
      ) : null}

      {rows.length ? (
        <>
          <div className="admin-import-preview">
            <table>
              <thead>
                <tr>
                  <th>Назва</th>
                  <th>Категорія</th>
                  <th>Ціна</th>
                  <th>Термін</th>
                  <th>CITO</th>
                  <th>Дія</th>
                </tr>
              </thead>
              <tbody>
                {rows.slice(0, 8).map((row) => {
                  const exists =
                    importSummary.updated > 0 &&
                    (items.some((item) => item.id === row.id) ||
                      items.some(
                        (item) =>
                          item.category === row.category &&
                          normalize(item.name) === normalize(row.name),
                      ));
                  return (
                    <tr key={`${row.sourceSheet}-${row.sourceRow}`}>
                      <td>{row.name}</td>
                      <td>{row.categoryLabel}</td>
                      <td>{new Intl.NumberFormat("uk-UA").format(row.amount)} ₴</td>
                      <td>{row.turnaround}</td>
                      <td>
                        {row.citoAvailable ? "Так · до 2 годин" : "—"}
                      </td>
                      <td>
                        <span className={exists ? "is-update" : "is-new"}>
                          {exists ? "Оновити" : "Додати"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {rows.length > 8 ? (
            <p className="admin-import-more">
              У попередньому перегляді показано 8 із {rows.length} позицій.
            </p>
          ) : null}
          <div className="admin-import-confirm">
            <p role="status">{status}</p>
            <button
              className="book-button admin-ui-button" data-variant="primary"
              type="button"
              onClick={importRows}
              disabled={importing || issues.length > 0}
            >
              {importing ? "Імпортуємо…" : `Замінити прайс (${rows.length} позицій)`}
              <span>→</span>
            </button>
          </div>
        </>
      ) : status ? (
        <p className="admin-import-status" role="status">{status}</p>
      ) : null}
    </section>
  );
}
