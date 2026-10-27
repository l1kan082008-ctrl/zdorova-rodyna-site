export type AdminTheme = "light" | "dark";

export const ADMIN_THEME_COOKIE = "zr_admin_theme";

export function resolveAdminTheme(value: unknown): AdminTheme {
  return value === "dark" ? "dark" : "light";
}

/** A display preference only; never reads or changes the admin session cookie. */
export function persistAdminTheme(theme: AdminTheme) {
  if (typeof document === "undefined" || typeof window === "undefined") return;
  try {
    document.cookie = `${ADMIN_THEME_COOKIE}=${resolveAdminTheme(theme)}; Path=/admin; Max-Age=31536000; SameSite=Lax${window.location.protocol === "https:" ? "; Secure" : ""}`;
  } catch {
    // The switch still works for this visit if browser storage is unavailable.
  }
}
