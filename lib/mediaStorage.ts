import { del, put } from "@vercel/blob";

const blobHostnameSuffix = ".public.blob.vercel-storage.com";

export function isTrustedBlobUrl(value: string) {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "https:"
      && !parsed.username
      && !parsed.password
      && parsed.hostname.endsWith(blobHostnameSuffix);
  } catch {
    return false;
  }
}

export function normalizeMediaReference(value: unknown, prefix: string, field: string) {
  const text = typeof value === "string" ? value.trim() : "";
  if (!text) return "";
  if (isTrustedBlobUrl(text)) return text;
  if (
    text.length <= 320
    && text.startsWith(`${prefix}/`)
    && !text.includes("..")
    && /^[A-Za-z0-9/_-]+\.(?:jpe?g|png|webp|avif)$/u.test(text)
  ) {
    return text;
  }
  throw new Error(`Поле «${field}» містить некоректне зображення.`);
}

export async function uploadPublicImage(
  pathname: string,
  bytes: ArrayBuffer,
  contentType: string,
) {
  const token = process.env.BLOB_READ_WRITE_TOKEN?.trim();
  if (!token) throw new Error("BLOB_READ_WRITE_TOKEN is not configured.");
  const blob = await put(pathname, new Blob([bytes], { type: contentType }), {
    access: "public",
    addRandomSuffix: false,
    contentType,
    token,
  });
  return blob.url;
}

export async function deleteMediaReference(reference: string, prefix: string) {
  if (!reference) return;
  if (isTrustedBlobUrl(reference)) {
    const token = process.env.BLOB_READ_WRITE_TOKEN?.trim();
    if (!token) return;
    await del(reference, { token });
    return;
  }
  if (!reference.startsWith(`${prefix}/`)) return;
}
