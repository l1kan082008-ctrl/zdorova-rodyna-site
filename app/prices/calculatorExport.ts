import { calculateCitoSurcharge } from "./citoPolicy";

export type CalculatorExportItem = {
  name: string;
  categoryLabel: string;
  turnaround: string;
  amount: number;
  cito?: boolean;
};

const PAGE_WIDTH = 1240;
const PAGE_HEIGHT = 1754;
const PDF_WIDTH = 595;
const PDF_HEIGHT = 842;

const formatPrice = (amount: number) =>
  `${new Intl.NumberFormat("uk-UA").format(amount)} грн`;

const formatDate = () =>
  new Intl.DateTimeFormat("uk-UA", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date());

export function buildCalculatorShareText(
  items: CalculatorExportItem[],
  total: number,
) {
  const citoCount = items.filter((item) => item.cito).length;
  const citoSurcharge = calculateCitoSurcharge(citoCount);
  const rows = items.map(
    (item, index) =>
      `${index + 1}. ${item.name}${item.cito ? " · CITO" : ""} — ${formatPrice(item.amount)}`,
  );

  return [
    "Медичний центр «Здорова Родина»",
    "Обрані дослідження:",
    ...rows,
    ...(citoCount > 0
      ? [
          `Доплата CITO (${citoCount} досл., до 2 годин) — ${formatPrice(citoSurcharge)}`,
        ]
      : []),
    `Орієнтовна сума: ${formatPrice(total)}`,
    "Остаточну вартість і доступний час підтвердить адміністратор.",
  ].join("\n");
}

function wrapText(
  context: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
) {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let currentLine = "";

  words.forEach((word) => {
    const candidate = currentLine ? `${currentLine} ${word}` : word;
    if (currentLine && context.measureText(candidate).width > maxWidth) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = candidate;
    }
  });

  if (currentLine) lines.push(currentLine);
  return lines;
}

function createPageCanvas() {
  const canvas = document.createElement("canvas");
  canvas.width = PAGE_WIDTH;
  canvas.height = PAGE_HEIGHT;
  const context = canvas.getContext("2d");

  if (!context) throw new Error("Canvas is unavailable");

  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, PAGE_WIDTH, PAGE_HEIGHT);
  return { canvas, context };
}

let brandLogoPromise: Promise<HTMLImageElement | null> | null = null;

function loadBrandLogo() {
  if (brandLogoPromise) return brandLogoPromise;

  brandLogoPromise = new Promise((resolve) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => resolve(null);
    image.src = "/zdorova-rodyna-logo-cropped.png";
  });

  return brandLogoPromise;
}

function drawPageHeader(
  context: CanvasRenderingContext2D,
  pageNumber: number,
  brandLogo: HTMLImageElement | null,
) {
  if (brandLogo) {
    const logoWidth = 410;
    const logoHeight = (brandLogo.height / brandLogo.width) * logoWidth;
    context.drawImage(brandLogo, 88, 38, logoWidth, logoHeight);
  } else {
    context.fillStyle = "#ff7a00";
    context.font = "700 24px Arial, sans-serif";
    context.fillText("ЗДОРОВА РОДИНА", 88, 92);
  }

  context.fillStyle = "#03464d";
  context.font = "700 48px Arial, sans-serif";
  context.fillText("Обрані дослідження", 88, 164);

  context.fillStyle = "#6f8184";
  context.font = "400 20px Arial, sans-serif";
  context.fillText(`Сформовано ${formatDate()}`, 88, 205);
  context.textAlign = "right";
  context.fillText(`Сторінка ${pageNumber}`, PAGE_WIDTH - 88, 205);
  context.textAlign = "left";

  context.strokeStyle = "#d9e5e4";
  context.lineWidth = 2;
  context.beginPath();
  context.moveTo(88, 240);
  context.lineTo(PAGE_WIDTH - 88, 240);
  context.stroke();
}

async function canvasToJpeg(canvas: HTMLCanvasElement) {
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (result) =>
        result ? resolve(result) : reject(new Error("PDF image failed")),
      "image/jpeg",
      0.92,
    );
  });

  return new Uint8Array(await blob.arrayBuffer());
}

async function renderPdfPages(
  items: CalculatorExportItem[],
  total: number,
) {
  const citoCount = items.filter((item) => item.cito).length;
  const citoSurcharge = calculateCitoSurcharge(citoCount);
  const brandLogo = await loadBrandLogo();
  const pages: Uint8Array[] = [];
  let pageNumber = 1;
  let { canvas, context } = createPageCanvas();
  drawPageHeader(context, pageNumber, brandLogo);
  let y = 300;

  const finishPage = async (isLastPage: boolean) => {
    if (isLastPage) {
      context.fillStyle = "#edf5f4";
      context.beginPath();
      context.roundRect(88, y + 20, PAGE_WIDTH - 176, 150, 28);
      context.fill();
      context.fillStyle = "#61777a";
      context.font = "700 21px Arial, sans-serif";
      context.fillText("ОРІЄНТОВНА СУМА", 122, y + 73);
      context.fillStyle = "#03464d";
      context.font = "700 38px Arial, sans-serif";
      context.textAlign = "right";
      context.fillText(formatPrice(total), PAGE_WIDTH - 122, y + 88);
      context.textAlign = "left";
      context.fillStyle = "#6f8184";
      context.font = "400 18px Arial, sans-serif";
      context.fillText(
        "Остаточну вартість і доступний час підтвердить адміністратор.",
        122,
        y + 132,
      );
    }

    pages.push(await canvasToJpeg(canvas));
  };

  for (let index = 0; index < items.length; index += 1) {
    const item = items[index];
    context.font = "700 25px Arial, sans-serif";
    const nameLines = wrapText(
      context,
      `${index + 1}. ${item.name}${item.cito ? " · CITO" : ""}`,
      760,
    );
    const rowHeight = Math.max(104, 68 + nameLines.length * 31);

    if (y + rowHeight > PAGE_HEIGHT - 230) {
      await finishPage(false);
      pageNumber += 1;
      ({ canvas, context } = createPageCanvas());
      drawPageHeader(context, pageNumber, brandLogo);
      y = 300;
    }

    context.fillStyle = index % 2 === 0 ? "#f7faf9" : "#ffffff";
    context.beginPath();
    context.roundRect(88, y, PAGE_WIDTH - 176, rowHeight - 12, 20);
    context.fill();

    context.fillStyle = "#03464d";
    context.font = "700 25px Arial, sans-serif";
    nameLines.forEach((line, lineIndex) => {
      context.fillText(line, 116, y + 41 + lineIndex * 31);
    });

    context.fillStyle = "#718487";
    context.font = "400 18px Arial, sans-serif";
    context.fillText(
      `${item.categoryLabel} · ${item.turnaround}`,
      116,
      y + 56 + nameLines.length * 31,
    );

    context.fillStyle = "#03464d";
    context.font = "700 25px Arial, sans-serif";
    context.textAlign = "right";
    context.fillText(formatPrice(item.amount), PAGE_WIDTH - 116, y + 48);
    context.textAlign = "left";
    y += rowHeight;
  }

  if (citoCount > 0) {
    const rowHeight = 108;

    if (y + rowHeight > PAGE_HEIGHT - 230) {
      await finishPage(false);
      pageNumber += 1;
      ({ canvas, context } = createPageCanvas());
      drawPageHeader(context, pageNumber, brandLogo);
      y = 300;
    }

    context.fillStyle = "#fff4e8";
    context.beginPath();
    context.roundRect(88, y, PAGE_WIDTH - 176, rowHeight - 12, 20);
    context.fill();
    context.fillStyle = "#03464d";
    context.font = "700 23px Arial, sans-serif";
    context.fillText("Доплата CITO · до 2 годин", 116, y + 38);
    context.fillStyle = "#718487";
    context.font = "400 18px Arial, sans-serif";
    context.fillText(
      `${citoCount} термінових досліджень за єдиною шкалою доплати`,
      116,
      y + 69,
    );
    context.fillStyle = "#ff7900";
    context.font = "700 25px Arial, sans-serif";
    context.textAlign = "right";
    context.fillText(
      `+${formatPrice(citoSurcharge)}`,
      PAGE_WIDTH - 116,
      y + 50,
    );
    context.textAlign = "left";
    y += rowHeight;
  }

  await finishPage(true);
  return pages;
}

function encode(value: string) {
  return new TextEncoder().encode(value);
}

function joinBytes(parts: Uint8Array[]) {
  const length = parts.reduce((sum, part) => sum + part.length, 0);
  const result = new Uint8Array(length);
  let offset = 0;

  parts.forEach((part) => {
    result.set(part, offset);
    offset += part.length;
  });

  return result;
}

export async function createCalculatorPdf(
  items: CalculatorExportItem[],
  total: number,
) {
  const images = await renderPdfPages(items, total);
  const objectCount = 2 + images.length * 3;
  const offsets = new Array<number>(objectCount + 1).fill(0);
  const parts: Uint8Array[] = [encode("%PDF-1.4\n%\xE2\xE3\xCF\xD3\n")];
  let byteLength = parts[0].length;

  const appendObject = (objectNumber: number, body: Uint8Array) => {
    offsets[objectNumber] = byteLength;
    const start = encode(`${objectNumber} 0 obj\n`);
    const end = encode("\nendobj\n");
    parts.push(start, body, end);
    byteLength += start.length + body.length + end.length;
  };

  appendObject(1, encode("<< /Type /Catalog /Pages 2 0 R >>"));
  const pageReferences = images
    .map((_, index) => `${3 + index * 3} 0 R`)
    .join(" ");
  appendObject(
    2,
    encode(
      `<< /Type /Pages /Kids [${pageReferences}] /Count ${images.length} >>`,
    ),
  );

  images.forEach((imageBytes, index) => {
    const pageObject = 3 + index * 3;
    const imageObject = pageObject + 1;
    const contentObject = pageObject + 2;
    const imageName = `Im${index + 1}`;
    const content = `q ${PDF_WIDTH} 0 0 ${PDF_HEIGHT} 0 0 cm /${imageName} Do Q`;

    appendObject(
      pageObject,
      encode(
        `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PDF_WIDTH} ${PDF_HEIGHT}] /Resources << /XObject << /${imageName} ${imageObject} 0 R >> >> /Contents ${contentObject} 0 R >>`,
      ),
    );
    appendObject(
      imageObject,
      joinBytes([
        encode(
          `<< /Type /XObject /Subtype /Image /Width ${PAGE_WIDTH} /Height ${PAGE_HEIGHT} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${imageBytes.length} >>\nstream\n`,
        ),
        imageBytes,
        encode("\nendstream"),
      ]),
    );
    appendObject(
      contentObject,
      encode(`<< /Length ${content.length} >>\nstream\n${content}\nendstream`),
    );
  });

  const xrefOffset = byteLength;
  const xrefRows = ["0000000000 65535 f "];
  for (let objectNumber = 1; objectNumber <= objectCount; objectNumber += 1) {
    xrefRows.push(`${String(offsets[objectNumber]).padStart(10, "0")} 00000 n `);
  }
  const trailer = encode(
    `xref\n0 ${objectCount + 1}\n${xrefRows.join("\n")}\ntrailer\n<< /Size ${objectCount + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`,
  );
  parts.push(trailer);

  return new Blob([joinBytes(parts)], { type: "application/pdf" });
}

const getPdfCacheKey = (items: CalculatorExportItem[], total: number) =>
  JSON.stringify({ items, total });

let preparedPdf: { key: string; blob: Blob } | null = null;
let preparationVersion = 0;

export async function prepareCalculatorPdf(
  items: CalculatorExportItem[],
  total: number,
) {
  const key = getPdfCacheKey(items, total);
  if (preparedPdf?.key === key) return preparedPdf.blob;

  const version = ++preparationVersion;
  const blob = await createCalculatorPdf(items, total);

  if (version === preparationVersion) {
    preparedPdf = { key, blob };
  }

  return blob;
}

export function isCalculatorPdfPrepared(
  items: CalculatorExportItem[],
  total: number,
) {
  return preparedPdf?.key === getPdfCacheKey(items, total);
}

export async function downloadCalculatorPdf(
  items: CalculatorExportItem[],
  total: number,
) {
  const pdf = await prepareCalculatorPdf(items, total);
  const url = URL.createObjectURL(pdf);
  const link = document.createElement("a");
  link.href = url;
  link.download = `zdorova-rodyna-doslidzhennia-${new Date().toISOString().slice(0, 10)}.pdf`;
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export async function shareCalculatorSelection(
  items: CalculatorExportItem[],
  total: number,
) {
  const text = buildCalculatorShareText(items, total);
  const key = getPdfCacheKey(items, total);
  const pdf = preparedPdf?.key === key ? preparedPdf.blob : null;

  if (!pdf) {
    throw new Error("PDF is not prepared yet");
  }

  const file = new File([pdf], "zdorova-rodyna-doslidzhennia.pdf", {
    type: "application/pdf",
  });

  try {
    if (navigator.share && navigator.canShare?.({ files: [file] })) {
      await navigator.share({
        files: [file],
      });
      return "shared" as const;
    }

    if (navigator.share) {
      await navigator.share({
        title: "Обрані дослідження — Здорова Родина",
        text,
      });
      return "shared" as const;
    }

    await navigator.clipboard.writeText(text);
    return "copied" as const;
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      return "cancelled" as const;
    }
    throw error;
  }
}
