export type SiteSettings = {
  phone: string;
  email: string;
  address: string;
  hours: string[];
  facebookUrl: string;
  instagramUrl: string;
  tiktokUrl: string;
  threadsUrl: string;
};

export const defaultSiteSettings: SiteSettings = {
  phone: "+38 (067) 671-44-44",
  email: "zdorovarodynarivne@ukr.net",
  address: "м. Рівне, вул. Володимира Стельмаха (Курчатова), 18-М",
  hours: ["Пн–Пт 08:00–19:00", "Сб 08:00–17:00"],
  facebookUrl: "https://www.facebook.com/zdorovarodina.rivne",
  instagramUrl: "https://www.instagram.com/zdorova_rodyna_rivne/",
  tiktokUrl: "",
  threadsUrl: "",
};

export class SiteSettingsValidationError extends Error {}

function text(value: unknown, label: string, maximum: number, optional = false) {
  if (typeof value !== "string") {
    throw new SiteSettingsValidationError(`Поле «${label}» має містити текст.`);
  }
  const result = value.trim();
  if ((!optional && !result) || result.length > maximum || /[\u0000-\u001f\u007f]/u.test(result)) {
    throw new SiteSettingsValidationError(`Перевірте поле «${label}» (до ${maximum} символів).`);
  }
  return result;
}

function socialUrl(value: unknown, label: string) {
  const result = text(value ?? "", label, 500, true);
  if (!result) return "";
  try {
    const parsed = new URL(result);
    if (!["https:", "http:"].includes(parsed.protocol) || !parsed.hostname || parsed.username || parsed.password) throw new Error();
    return parsed.href;
  } catch {
    throw new SiteSettingsValidationError(`Для «${label}» вкажіть повне посилання https:// або залиште поле порожнім.`);
  }
}

export function validateSiteSettings(value: unknown): SiteSettings {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new SiteSettingsValidationError("Невірний формат налаштувань.");
  }
  const payload = value as Record<string, unknown>;
  const phone = text(payload.phone, "Телефон", 40);
  const digits = phone.replace(/\D/gu, "");
  if (!/^\+?[\d ().-]+$/u.test(phone) || digits.length < 10 || digits.length > 15) {
    throw new SiteSettingsValidationError("Вкажіть коректний телефон, наприклад +38 (067) 671-44-44.");
  }
  const email = text(payload.email, "Електронна пошта", 254);
  if (!/^[^\s@<>"?&#]+@[a-z\d](?:[a-z\d.-]*[a-z\d])?\.[a-z]{2,}$/iu.test(email)) {
    throw new SiteSettingsValidationError("Вкажіть коректну електронну пошту.");
  }
  if (!Array.isArray(payload.hours) || payload.hours.length < 1 || payload.hours.length > 7) {
    throw new SiteSettingsValidationError("Графік має містити від 1 до 7 рядків.");
  }
  return {
    phone,
    email,
    address: text(payload.address, "Адреса", 300),
    hours: payload.hours.map((line) => text(line, "Графік роботи", 120)),
    facebookUrl: socialUrl(payload.facebookUrl, "Facebook"),
    instagramUrl: socialUrl(payload.instagramUrl, "Instagram"),
    tiktokUrl: socialUrl(payload.tiktokUrl, "TikTok"),
    threadsUrl: socialUrl(payload.threadsUrl, "Threads"),
  };
}

function phoneNumber(phone: string) {
  const digits = phone.replace(/\D/gu, "");
  return `+${digits.length === 10 && digits.startsWith("0") ? `38${digits}` : digits}`;
}

export const sitePhoneHref = (phone: string) => `tel:${phoneNumber(phone)}`;
export const siteViberHref = (phone: string) => `viber://chat?number=${encodeURIComponent(phoneNumber(phone))}`;
