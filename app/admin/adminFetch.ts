import { expireAdminSession } from "./adminSessionClient";

let pendingSessionCheck: Promise<void> | null = null;

function verifyExpiredSession(): Promise<void> {
  if (!pendingSessionCheck) {
    pendingSessionCheck = (async () => {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 10_000);
      try {
        const response = await fetch("/api/admin/session", {
          method: "GET",
          credentials: "same-origin",
          cache: "no-store",
          signal: controller.signal,
        });
        if (response.status === 401) expireAdminSession();
      } catch {
        // Offline, timeout or temporary server failure is not proof of expiry.
      } finally {
        clearTimeout(timer);
      }
    })().finally(() => { pendingSessionCheck = null; });
  }
  return pendingSessionCheck;
}

export async function adminFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const response = await fetch(input, init);
  if (response.status === 401 && typeof window !== "undefined") {
    const url = new URL(typeof input === "string" || input instanceof URL ? input : input.url, window.location.href);
    if (
      url.origin === window.location.origin &&
      url.pathname.startsWith("/api/admin/") &&
      url.pathname !== "/api/admin/session"
    ) {
      await verifyExpiredSession();
    }
  }
  return response;
}
