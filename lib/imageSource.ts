const imageRedirectPaths = new Set([
  "/api/doctors/photo",
  "/api/services/image",
  "/api/banners/image",
]);

const optimizedBlobFolders = ["doctors", "locations", "services", "banners"];

function trustedBlobUrl(src: string): URL | null {
  // Check the authority before URL normalization removes an explicit :443.
  if (!/^https:\/\/[a-z0-9-]+\.public\.blob\.vercel-storage\.com(?:[/?#]|$)/i.test(src)) return null;
  try {
    const url = new URL(src);
    return url.protocol === "https:" && !url.username && !url.password && !url.port ? url : null;
  } catch {
    return null;
  }
}

// Client-safe: avoid the server-only storage SDK when resolving public media.
export function resolveImageSource(src: string): string {
  const path = src.split(/[?#]/, 1)[0];
  if (!imageRedirectPaths.has(path)) return src;

  const queryIndex = src.indexOf("?");
  const fragmentIndex = src.indexOf("#");
  if (queryIndex === -1 || (fragmentIndex !== -1 && queryIndex > fragmentIndex)) return src;
  const query = src.slice(queryIndex + 1).split("#", 1)[0];
  const key = new URLSearchParams(query).get("key")?.trim();
  return key ? trustedBlobUrl(key)?.href ?? src : src;
}

export function canOptimizeImage(src: string): boolean {
  const resolved = resolveImageSource(src);
  if (resolved.startsWith("/") && !resolved.startsWith("//")) {
    try {
      const url = new URL(resolved, "https://local.invalid");
      const path = decodeURIComponent(url.pathname);
      // Current media API endpoints only redirect; unresolved wrappers have no image body.
      return url.origin === "https://local.invalid" && path !== "/api" && !path.startsWith("/api/");
    } catch {
      return false;
    }
  }

  const url = trustedBlobUrl(resolved);
  // Mirror next.config.ts remotePatterns without broadening the optimizer allowlist.
  return Boolean(url && !url.search && optimizedBlobFolders.some((folder) => url.pathname.startsWith(`/${folder}/`)));
}
