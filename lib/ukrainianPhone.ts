export const PHONE_PREFIX = "+38 ";

export function getUkrainianPhoneDigits(value: string) {
  let digits = value.replace(/\D/g, "");

  if (value.trimStart().startsWith("+38") && digits.startsWith("38")) {
    digits = digits.slice(2);
  } else if (digits.startsWith("380") && digits.length > 10) {
    digits = digits.slice(2);
  }

  return digits.slice(0, 10);
}

export function formatPhoneNumber(value: string) {
  const digits = getUkrainianPhoneDigits(value);
  if (!digits) return PHONE_PREFIX;

  const operator = digits.slice(0, 3);
  const first = digits.slice(3, 6);
  const second = digits.slice(6, 8);
  const third = digits.slice(8, 10);

  let formatted = `+38 ${operator}`;
  if (first) formatted += ` ${first}`;
  if (second) formatted += `-${second}`;
  if (third) formatted += `-${third}`;
  return formatted;
}

export function validatePhoneNumber(value: string) {
  const digits = getUkrainianPhoneDigits(value);
  if (/^0\d{9}$/.test(digits) && !/^0+$/.test(digits)) return "";
  return "Будь ласка, вкажіть номер у форматі +38 0XX XXX-XX-XX.";
}
