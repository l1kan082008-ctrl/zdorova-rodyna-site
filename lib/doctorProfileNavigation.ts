const siteOrigin = "https://zdorovarodynaplus.com.ua";
const storageKey = "zr:doctor-profile-navigation";
const historyKey = "__zrDoctorProfileReturn";
const pendingLifetime = 15 * 60 * 1000;

type ProfileNavigation = {
  doctorId: string;
  returnTo: string | null;
  source: string;
  createdAt: number;
};

let pendingNavigation: ProfileNavigation | undefined;

/** Only existing doctor-selection destinations are valid return links. */
export function safeDoctorReturnTo(value: unknown): string | undefined {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//")
    || /[\\\u0000-\u0020\u007f]/u.test(value)) return undefined;
  try {
    const url = new URL(value, siteOrigin);
    if (url.origin !== siteOrigin) return undefined;
    if (url.pathname === "/doctors") {
      if (url.hash && !/^#doctor-card-[\w%-]+$/u.test(url.hash)) return undefined;
      return `${url.pathname}${url.search}${url.hash}`;
    }
    if (url.search) return undefined;
    if (url.pathname === "/services/family" && (!url.hash || url.hash === "#family-declaration")) {
      return `${url.pathname}${url.hash}`;
    }
    if (url.pathname === "/services/screening-40" && (!url.hash || url.hash === "#screening-doctors")) {
      return `${url.pathname}${url.hash}`;
    }
  } catch {
    // Malformed legacy links fall back to the public doctor directory.
  }
  return undefined;
}

export function doctorProfileHref(doctorId: string): string {
  return `/doctors/${encodeURIComponent(doctorId)}`;
}

export function rememberDoctorProfileNavigation(doctorId: string, returnTo?: string): void {
  if (typeof window === "undefined") return;
  const context: ProfileNavigation = {
    doctorId,
    returnTo: safeDoctorReturnTo(returnTo) ?? null,
    source: `${window.location.pathname}${window.location.search}`,
    createdAt: Date.now(),
  };
  pendingNavigation = context;
  try {
    window.sessionStorage.setItem(storageKey, JSON.stringify(context));
  } catch {
    // In-memory context still supports client navigation when storage is blocked.
  }
}

function isFreshContext(value: unknown, doctorId: string): value is ProfileNavigation {
  if (!value || typeof value !== "object") return false;
  const context = value as ProfileNavigation;
  const age = Date.now() - context.createdAt;
  return context.doctorId === doctorId && typeof context.source === "string"
    && Number.isFinite(age) && age >= 0 && age <= pendingLifetime
    && (context.returnTo === null || safeDoctorReturnTo(context.returnTo) !== undefined);
}

function sameOriginReferrer(): URL | undefined {
  try {
    const referrer = new URL(document.referrer);
    return referrer.origin === window.location.origin ? referrer : undefined;
  } catch {
    return undefined;
  }
}

/** Store the return target on this history entry, rather than on every future visit. */
export function resolveDoctorProfileReturnTo(doctorId: string, legacyReturnTo?: string): string | undefined {
  if (typeof window === "undefined") return safeDoctorReturnTo(legacyReturnTo);
  const legacy = safeDoctorReturnTo(legacyReturnTo);
  const saved = window.history.state?.[historyKey];
  let context = isFreshContext(pendingNavigation, doctorId) ? pendingNavigation : undefined;
  const referrer = sameOriginReferrer();
  if (!context) {
    try {
      const stored: unknown = JSON.parse(window.sessionStorage.getItem(storageKey) ?? "null");
      if (isFreshContext(stored, doctorId) && referrer
        && stored.source === `${referrer.pathname}${referrer.search}`) context = stored;
    } catch {
      // Private browsing and invalid stored data must not break a profile.
    }
  }

  // App Router may copy custom history fields to the next entry. A new link
  // activation always wins, including a generic link that intentionally clears it.
  if (!legacy && !context && saved?.doctorId === doctorId && saved?.profile === window.location.pathname) {
    return safeDoctorReturnTo(saved.returnTo);
  }

  let returnTo = legacy ?? safeDoctorReturnTo(context?.returnTo);
  if (!legacy && !context && referrer) {
    // Native/new-tab navigation can still return correctly without web storage.
    const navigation = performance.getEntriesByType("navigation")[0];
    const isDocumentNavigation = navigation && new URL(navigation.name).pathname === window.location.pathname;
    if (isDocumentNavigation) {
      if (referrer.pathname === "/doctors") {
        returnTo = safeDoctorReturnTo(`/doctors${referrer.search}#doctor-card-${encodeURIComponent(doctorId)}`);
      } else if (referrer.pathname === "/services/family") {
        returnTo = "/services/family#family-declaration";
      } else if (referrer.pathname === "/services/screening-40") {
        returnTo = "/services/screening-40#screening-doctors";
      }
    }
  }

  pendingNavigation = undefined;
  try {
    window.sessionStorage.removeItem(storageKey);
  } catch {}
  try {
    window.history.replaceState({
      ...window.history.state,
      [historyKey]: { doctorId, profile: window.location.pathname, returnTo: returnTo ?? null },
    }, "");
  } catch {
    // A back link remains usable even when a browser disallows history state.
  }
  return returnTo;
}
