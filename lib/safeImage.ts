export type SafeRasterImage = {
  bytes: ArrayBuffer;
  contentType: "image/jpeg" | "image/png" | "image/webp" | "image/avif";
  extension: "jpg" | "png" | "webp" | "avif";
};

function startsWith(bytes: Uint8Array, signature: number[]) {
  return signature.every((value, index) => bytes[index] === value);
}

function ascii(bytes: Uint8Array, start: number, end: number) {
  return String.fromCharCode(...bytes.slice(start, end));
}

export async function readSafeRasterImage(
  file: File,
  maximumBytes: number,
): Promise<SafeRasterImage | null> {
  if (file.size <= 0 || file.size > maximumBytes) return null;
  const bytes = await file.arrayBuffer();
  const view = new Uint8Array(bytes);

  if (view.length >= 3 && startsWith(view, [0xff, 0xd8, 0xff])) {
    return { bytes, contentType: "image/jpeg", extension: "jpg" };
  }
  if (
    view.length >= 8
    && startsWith(view, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
  ) {
    return { bytes, contentType: "image/png", extension: "png" };
  }
  if (
    view.length >= 12
    && ascii(view, 0, 4) === "RIFF"
    && ascii(view, 8, 12) === "WEBP"
  ) {
    return { bytes, contentType: "image/webp", extension: "webp" };
  }
  if (
    view.length >= 12
    && ascii(view, 4, 8) === "ftyp"
    && ["avif", "avis"].includes(ascii(view, 8, 12))
  ) {
    return { bytes, contentType: "image/avif", extension: "avif" };
  }
  return null;
}

export function secureImageHeaders(headers: Headers, cacheControl: string) {
  headers.set("cache-control", cacheControl);
  headers.set("content-security-policy", "default-src 'none'; sandbox");
  headers.set("content-disposition", "inline");
  headers.set("x-content-type-options", "nosniff");
  headers.set("cross-origin-resource-policy", "same-site");
  return headers;
}
