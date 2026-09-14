import type { PriceItem } from "../../prices/priceData";

export async function createPriceWorkbook(items: PriceItem[]) {
  const XLSX = await import("xlsx");
  const rows = items.map(item => [
    item.name, item.amount, item.categoryLabel, item.turnaround || "Уточнюйте",
    item.citoAvailable ? "Так" : "Ні", item.isActive === false ? "Ні" : "Так",
    JSON.stringify(item.aliases ?? []), item.sortOrder ?? 0, item.id,
  ]);
  const sheet = XLSX.utils.aoa_to_sheet([
    ["Повний прайс. ID існуючих позицій збережіть. Для нових залиште ID порожнім."],
    ["Завантажуйте всі категорії: відсутні у файлі позиції буде приховано із сайту."],
    ["Назва", "Ціна", "Категорія", "Термін виконання", "CITO", "Активна", "Синоніми", "Порядок", "ID"],
    ...rows,
  ]);
  sheet["!cols"] = [68, 12, 32, 22, 10, 12, 50, 12, 40].map(wch => ({ wch }));
  sheet["!autofilter"] = { ref: `A3:I${rows.length + 3}` };
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, sheet, "Прайс");
  return XLSX.write(workbook, { type: "array", bookType: "xlsx" }) as ArrayBuffer;
}
