export const ADMIN_SESSION_EXPIRING_EVENT = "zr-admin-session-expiring";

let expiring = false;

export function isAdminSessionExpiring() {
  return expiring;
}

function redirectToLogin() {
  const next = window.location.pathname + window.location.search + window.location.hash;
  window.location.replace(`/admin/login?reason=expired&next=${encodeURIComponent(next)}`);
}

export function expireAdminSession() {
  if (typeof window === "undefined" || expiring || window.location.pathname === "/admin/login") return;
  expiring = true;
  // Draft listeners run synchronously before navigation, including pending autosaves.
  window.dispatchEvent(new Event(ADMIN_SESSION_EXPIRING_EVENT));
  redirectToLogin();
}

type SessionStatus = { serverNow: number; idleExpiresAt: number; expiresAt: number };
const CHECK_INTERVAL_MS = 60_000;
const ACTIVITY_INTERVAL_MS = 15_000;
const RETRY_INTERVAL_MS = 30_000;

function isSessionStatus(value: unknown): value is SessionStatus {
  if (!value || typeof value !== "object") return false;
  const status = value as SessionStatus;
  return [status.serverNow, status.idleExpiresAt, status.expiresAt].every(Number.isSafeInteger)
    && status.serverNow > 0 && status.idleExpiresAt > status.serverNow
    && status.expiresAt >= status.idleExpiresAt;
}

/** One monitor for the entire admin layout. Background checks never extend a session. */
export function startAdminSessionMonitor() {
  let stopped = false;
  let checking = false;
  let checkAgain = false;
  let checkTimer: number | undefined;
  let activityTimer: number | undefined;
  let abortController: AbortController | undefined;
  let timeoutTimer: number | undefined;
  let activityAt: number | null = null;
  let nextActivityRequest = 0;

  const running = () => !stopped && !isAdminSessionExpiring();

  const scheduleCheck = (delay: number) => {
    window.clearTimeout(checkTimer);
    if (running()) checkTimer = window.setTimeout(() => { void check(); }, Math.max(250, delay));
  };

  const scheduleActivity = () => {
    window.clearTimeout(activityTimer);
    if (!running() || activityAt === null || document.visibilityState !== "visible") return;
    activityTimer = window.setTimeout(() => { void check(true); }, Math.max(0, nextActivityRequest - performance.now()));
  };

  async function check(activity = false) {
    if (!running()) return;
    if (checking) {
      if (!activity) checkAgain = true;
      return;
    }
    // Never replay old input after a sleeping/offline tab resumes.
    const sentActivity = activity && document.visibilityState === "visible"
      && activityAt !== null && performance.now() - activityAt <= ACTIVITY_INTERVAL_MS ? activityAt : null;
    if (activity && sentActivity === null) {
      activityAt = null;
      return;
    }
    checking = true;
    window.clearTimeout(checkTimer);
    window.clearTimeout(activityTimer);
    abortController = new AbortController();
    timeoutTimer = window.setTimeout(() => abortController?.abort(), 10_000);
    const requestStarted = performance.now();
    if (sentActivity !== null) nextActivityRequest = requestStarted + ACTIVITY_INTERVAL_MS;
    let nextCheck = RETRY_INTERVAL_MS;
    try {
      const response = await fetch("/api/admin/session", {
        method: sentActivity === null ? "GET" : "PATCH",
        credentials: "same-origin",
        cache: "no-store",
        signal: abortController.signal,
      });
      if (!running()) return;
      if (response.status === 401) {
        expireAdminSession();
        return;
      }
      if (response.ok) {
        const status: unknown = await response.json();
        if (!running()) return;
        if (isSessionStatus(status)) {
          // Use server-relative TTL, so a wrong computer clock cannot change expiry.
          const ttl = Math.min(status.idleExpiresAt, status.expiresAt) - status.serverNow;
          nextCheck = Math.min(CHECK_INTERVAL_MS, Math.max(250, ttl - (performance.now() - requestStarted)));
          if (sentActivity !== null && activityAt === sentActivity) activityAt = null;
        }
      }
    } catch {
      // Offline / temporary service failure is not evidence of an expired session.
    } finally {
      window.clearTimeout(timeoutTimer);
      checking = false;
      abortController = undefined;
      if (running()) {
        // Do not retry a failed heartbeat in a tight loop.
        if (activityAt !== null) nextActivityRequest = Math.max(nextActivityRequest, performance.now() + 1_000);
        scheduleActivity();
        scheduleCheck(checkAgain ? 250 : nextCheck);
        checkAgain = false;
      }
    }
  }

  const onActivity = (event: Event) => {
    if (!event.isTrusted || document.visibilityState !== "visible" || !running()) return;
    activityAt = performance.now();
    if (!checking) scheduleActivity();
  };
  const onResume = () => {
    if (document.visibilityState !== "visible") return;
    void check();
  };
  const onPageShow = () => {
    // An older admin history entry can restore this document from BFCache.
    if (isAdminSessionExpiring()) redirectToLogin();
    else onResume();
  };
  const activityEvents = ["pointerdown", "pointermove", "keydown", "wheel", "touchmove"] as const;
  for (const name of activityEvents) window.addEventListener(name, onActivity, { passive: true });
  window.addEventListener("focus", onResume);
  window.addEventListener("pageshow", onPageShow);
  window.addEventListener("online", onResume);
  document.addEventListener("visibilitychange", onResume);
  void check();

  return () => {
    stopped = true;
    abortController?.abort();
    window.clearTimeout(timeoutTimer);
    window.clearTimeout(checkTimer);
    window.clearTimeout(activityTimer);
    for (const name of activityEvents) window.removeEventListener(name, onActivity);
    window.removeEventListener("focus", onResume);
    window.removeEventListener("pageshow", onPageShow);
    window.removeEventListener("online", onResume);
    document.removeEventListener("visibilitychange", onResume);
  };
}

