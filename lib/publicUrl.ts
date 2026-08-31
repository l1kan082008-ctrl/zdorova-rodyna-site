const unsafeCharacters = /[\u0000-\u001f\u007f]/u;

export function normalizeInternalHref(value: unknown, field: string) {
  const text = typeof value === "string" ? value.trim() : "";
  if (!text || unsafeCharacters.test(text) || !text.startsWith("/") || text.startsWith("//")) {
    throw new Error(`Поле «${field}» має містити внутрішній шлях, що починається з /.`);
  }
  const parsed = new URL(text, "https://site.invalid");
  if (parsed.origin !== "https://site.invalid") {
    throw new Error(`Поле «${field}» містить небезпечне посилання.`);
  }
  return `${parsed.pathname}${parsed.search}${parsed.hash}`;
}

export function normalizeMediaUrl(value: unknown, field: string) {
  const text = typeof value === "string" ? value.trim() : "";
  if (!text) return "";
  if (text.startsWith("/") && !text.startsWith("//")) {
    return normalizeInternalHref(text, field);
  }
  if (unsafeCharacters.test(text)) {
    throw new Error(`Поле «${field}» містить небезпечне посилання.`);
  }
  let parsed: URL;
  try {
    parsed = new URL(text);
  } catch {
    throw new Error(`Поле «${field}» містить некоректне посилання.`);
  }
  if (parsed.protocol !== "https:" || parsed.username || parsed.password) {
    throw new Error(`Поле «${field}» має використовувати безпечне HTTPS-посилання.`);
  }
  return parsed.toString();
}

export function normalizeMediaKey(value: unknown, prefix: string, field: string) {
  const text = typeof value === "string" ? value.trim() : "";
  if (!text) return "";
  if (
    text.length > 320
    || !text.startsWith(`${prefix}/`)
    || text.includes("..")
    || !/^[A-Za-z0-9/_-]+\.(?:jpe?g|png|webp|avif)$/u.test(text)
  ) {
    throw new Error(`Поле «${field}» містить некоректний ключ зображення.`);
  }
  return text;
}
