import { categoryOptions, type CategoryId } from "../../prices/priceData";
import {
  DEFAULT_CITO_SURCHARGE,
  usesDefaultCitoPolicy,
} from "../../prices/citoPolicy";

export type ParsedPriceImportRow = {
  id?: string;
  name: string;
  category: CategoryId;
  categoryLabel: string;
  amount: number;
  turnaround: string;
  citoAvailable: boolean;
  citoSurcharge: number;
  aliases: string[];
  isActive: boolean;
  sortOrder: number;
  sourceSheet: string;
  sourceRow: number;
};

export type PriceImportIssue = {
  sheet: string;
  row?: number;
  message: string;
};

export type PriceImportResult = {
  rows: ParsedPriceImportRow[];
  issues: PriceImportIssue[];
  sheetNames: string[];
};

type ColumnName =
  | "id"
  | "name"
  | "category"
  | "amount"
  | "turnaround"
  | "citoAvailable"
  | "citoSurcharge"
  | "aliases"
  | "isActive"
  | "sortOrder";

const MAX_ROWS = 5000;

const columnAliases: Record<ColumnName, string[]> = {
  id: ["id", "код", "артикул", "ідентифікатор"],
  name: [
    "назва",
    "найменування",
    "послуга",
    "дослідження",
    "назва послуги",
    "назва дослідження",
    "name",
  ],
  category: [
    "категорія",
    "категория",
    "розділ",
    "раздел",
    "напрям",
    "група",
    "category",
  ],
  amount: ["ціна", "цена", "вартість", "сума", "price", "грн"],
  turnaround: [
    "термін виконання",
    "термін",
    "строк",
    "термін готовності",
    "готовність",
    "turnaround",
  ],
  citoAvailable: [
    "cito",
    "cito доступно",
    "режим cito",
    "цито",
    "цито доступно",
    "режим цито",
    "cito available",
  ],
  citoSurcharge: [
    "доплата cito",
    "доплата цито",
    "вартість cito",
    "вартість цито",
    "cito surcharge",
    "cito доплата",
  ],
  aliases: [
    "синоніми",
    "синонимы",
    "інші назви",
    "пошукові назви",
    "aliases",
  ],
  isActive: [
    "активна",
    "активний",
    "опубліковано",
    "показувати",
    "статус",
    "active",
  ],
  sortOrder: [
    "порядок",
    "сортування",
    "порядок сортування",
    "sort order",
  ],
};

function normalize(value: unknown) {
  return String(value ?? "")
    .normalize("NFKC")
    .trim()
    .toLocaleLowerCase("uk-UA")
    .replace(/[’'"]/g, "")
    .replace(/[^a-zа-яіїєґ0-9]+/gu, " ")
    .trim();
}

const normalizedColumnAliases = Object.fromEntries(
  Object.entries(columnAliases).map(([key, aliases]) => [
    key,
    new Set(aliases.map(normalize)),
  ]),
) as Record<ColumnName, Set<string>>;

const categoryLookup = new Map<string, (typeof categoryOptions)[number]>();
for (const option of categoryOptions) {
  categoryLookup.set(normalize(option.id), option);
  categoryLookup.set(normalize(option.label), option);
}

function findColumns(row: unknown[]) {
  const result = new Map<ColumnName, number>();

  row.forEach((cell, index) => {
    const normalized = normalize(cell);
    if (!normalized) return;
    for (const [column, aliases] of Object.entries(
      normalizedColumnAliases,
    ) as [ColumnName, Set<string>][]) {
      if (!result.has(column) && aliases.has(normalized)) {
        result.set(column, index);
      }
    }
  });

  return result;
}

function findHeader(rows: unknown[][]) {
  const candidates = rows.slice(0, 20);
  for (let index = 0; index < candidates.length; index += 1) {
    const columns = findColumns(candidates[index]);
    if (columns.has("name") && columns.has("amount")) {
      return { rowIndex: index, columns };
    }
  }
  return null;
}

function resolveCategory(value: unknown, sheetName: string) {
  const normalized = normalize(value) || normalize(sheetName);
  const exact = categoryLookup.get(normalized);
  if (exact) return exact;

  const partial = categoryOptions.find((option) => {
    const label = normalize(option.label);
    return (
      normalized.length >= 4 &&
      (normalized.includes(label) || label.includes(normalized))
    );
  });
  return partial;
}

function parseAmount(value: unknown) {
  const normalized = String(value ?? "")
    .replace(/[\s\u00a0]/g, "")
    .replace(",", ".")
    .replace(/[^\d.-]/g, "");
  const amount = Number(normalized);
  return Number.isFinite(amount) && amount >= 0 ? Math.round(amount) : null;
}

function parseBoolean(value: unknown, defaultValue = true) {
  const normalized = normalize(value);
  if (!normalized) return defaultValue;
  if (["ні", "нет", "false", "0", "приховано", "неактивна"].includes(normalized)) {
    return false;
  }
  return true;
}

function getCell(
  row: unknown[],
  columns: Map<ColumnName, number>,
  name: ColumnName,
) {
  const index = columns.get(name);
  return index === undefined ? "" : row[index];
}

function isEmptyRow(row: unknown[]) {
  return row.every((value) => !String(value ?? "").trim());
}

export async function parsePriceWorkbook(
  buffer: ArrayBuffer,
): Promise<PriceImportResult> {
  const XLSX = await import("xlsx");
  const workbook = XLSX.read(buffer, { type: "array", cellText: true });
  const rows: ParsedPriceImportRow[] = [];
  const issues: PriceImportIssue[] = [];
  let sortOrder = 0;

  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName];
    const sheetRows = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
      header: 1,
      raw: false,
      defval: "",
      blankrows: false,
    });
    const header = findHeader(sheetRows);

    if (!header) {
      if (sheetRows.some((row) => !isEmptyRow(row))) {
        issues.push({
          sheet: sheetName,
          message: "Не знайдено колонки «Назва» та «Ціна».",
        });
      }
      continue;
    }

    for (
      let rowIndex = header.rowIndex + 1;
      rowIndex < sheetRows.length;
      rowIndex += 1
    ) {
      const sourceRow = rowIndex + 1;
      const row = sheetRows[rowIndex];
      if (isEmptyRow(row)) continue;

      const name = String(getCell(row, header.columns, "name")).trim();
      const amount = parseAmount(getCell(row, header.columns, "amount"));
      const category = resolveCategory(
        getCell(row, header.columns, "category"),
        sheetName,
      );

      if (!name) {
        issues.push({
          sheet: sheetName,
          row: sourceRow,
          message: "Не вказано назву послуги.",
        });
        continue;
      }
      if (amount === null) {
        issues.push({
          sheet: sheetName,
          row: sourceRow,
          message: `Некоректна ціна для «${name}».`,
        });
        continue;
      }
      if (!category) {
        issues.push({
          sheet: sheetName,
          row: sourceRow,
          message: `Не вдалося розпізнати категорію для «${name}».`,
        });
        continue;
      }

      const aliases = String(getCell(row, header.columns, "aliases"))
        .split(/[;,|]/)
        .map((alias) => alias.trim())
        .filter(Boolean);
      const explicitOrder = Number(
        getCell(row, header.columns, "sortOrder"),
      );
      const defaultCitoEnabled = usesDefaultCitoPolicy(category.id);
      const legacyCitoSurcharge =
        parseAmount(getCell(row, header.columns, "citoSurcharge")) ?? 0;
      const citoAvailable = parseBoolean(
        getCell(row, header.columns, "citoAvailable"),
        defaultCitoEnabled || legacyCitoSurcharge > 0,
      );

      rows.push({
        id:
          String(getCell(row, header.columns, "id")).trim() || undefined,
        name,
        category: category.id,
        categoryLabel: category.label,
        amount,
        turnaround:
          String(getCell(row, header.columns, "turnaround")).trim() ||
          "Уточнюйте",
        citoAvailable,
        citoSurcharge: citoAvailable ? DEFAULT_CITO_SURCHARGE : 0,
        aliases,
        isActive: parseBoolean(
          getCell(row, header.columns, "isActive"),
        ),
        sortOrder:
          Number.isFinite(explicitOrder) && explicitOrder >= 0
            ? Math.round(explicitOrder)
            : sortOrder,
        sourceSheet: sheetName,
        sourceRow,
      });
      sortOrder += 1;

      if (rows.length > MAX_ROWS) {
        return {
          rows: [],
          issues: [
            {
              sheet: sheetName,
              row: sourceRow,
              message: `Файл містить понад ${MAX_ROWS} позицій. Розділіть його на кілька імпортів.`,
            },
          ],
          sheetNames: workbook.SheetNames,
        };
      }
    }
  }

  if (!workbook.SheetNames.length) {
    issues.push({ sheet: "Файл", message: "У файлі немає аркушів." });
  } else if (!rows.length && !issues.length) {
    issues.push({ sheet: "Файл", message: "У файлі немає позицій прайса." });
  }

  const seen = new Map<string, ParsedPriceImportRow>();
  for (const row of rows) {
    const key = `${row.category}::${normalize(row.name)}`;
    const first = seen.get(key);
    if (first) {
      issues.push({
        sheet: row.sourceSheet,
        row: row.sourceRow,
        message: `«${row.name}» дублює рядок ${first.sourceRow} аркуша «${first.sourceSheet}».`,
      });
    } else {
      seen.set(key, row);
    }
  }

  return { rows, issues, sheetNames: workbook.SheetNames };
}
