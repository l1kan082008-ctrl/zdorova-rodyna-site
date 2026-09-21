import sharp from "sharp";
import type { SafeRasterImage } from "./safeImage.ts";

const MAX_INPUT_PIXELS = 40_000_000;

export class ImageOptimizationError extends Error {}

type UploadImageOptions = {
  maximumBytes: number;
  maxDimension?: number;
};

function declaresAnimation(input: Buffer, contentType: SafeRasterImage["contentType"]) {
  // libvips may decode APNG as a single PNG frame, so inspect its animation control chunk.
  if (contentType === "image/png") {
    for (let offset = 8; offset + 12 <= input.length;) {
      const next = offset + 12 + input.readUInt32BE(offset);
      if (next > input.length) break;
      const type = input.toString("ascii", offset + 4, offset + 8);
      if (type === "acTL") return true;
      if (type === "IDAT" || type === "IEND") break;
      offset = next;
    }
  }
  if (contentType === "image/avif" && input.length >= 16) {
    if (input.toString("ascii", 8, 12) === "avis") return true;
    const end = Math.min(input.readUInt32BE(0), input.length);
    for (let offset = 16; offset + 4 <= end; offset += 4) {
      if (input.toString("ascii", offset, offset + 4) === "avis") return true;
    }
  }
  return false;
}

export async function optimizeUploadedImage(
  image: SafeRasterImage,
  { maximumBytes, maxDimension = 2400 }: UploadImageOptions,
): Promise<SafeRasterImage> {
  if (image.bytes.byteLength === 0 || image.bytes.byteLength > maximumBytes) {
    throw new ImageOptimizationError("Розмір зображення перевищує дозволений ліміт.");
  }

  try {
    const input = Buffer.from(image.bytes);
    if (declaresAnimation(input, image.contentType)) {
      throw new ImageOptimizationError("Анімовані зображення не підтримуються. Оберіть статичне фото.");
    }
    const decoderOptions = { limitInputPixels: MAX_INPUT_PIXELS, failOn: "warning" as const };
    const metadata = await sharp(input, decoderOptions).metadata();
    if (!metadata.width || !metadata.height) {
      throw new ImageOptimizationError("Не вдалося визначити розмір зображення.");
    }
    if ((metadata.pages ?? 1) > 1) {
      throw new ImageOptimizationError("Анімовані зображення не підтримуються. Оберіть статичне фото.");
    }

    const needsResize = Math.max(metadata.width, metadata.height) > maxDimension;
    const needsOrientation = metadata.orientation !== undefined && metadata.orientation !== 1;
    const output = await sharp(input, decoderOptions)
      .autoOrient()
      .resize({ width: maxDimension, height: maxDimension, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 88, alphaQuality: 100, effort: 4 })
      .timeout({ seconds: 10 })
      .toBuffer();

    // Decode before falling back so a small but damaged file cannot bypass validation.
    if (!needsResize && !needsOrientation && output.byteLength >= input.byteLength) {
      return image;
    }
    if (output.byteLength > maximumBytes) {
      throw new ImageOptimizationError("Зображення завелике після обробки. Оберіть менше фото.");
    }
    return {
      bytes: new Uint8Array(output).buffer,
      contentType: "image/webp",
      extension: "webp",
    };
  } catch (error) {
    if (error instanceof ImageOptimizationError) throw error;
    throw new ImageOptimizationError("Не вдалося обробити зображення. Оберіть справжній JPG, PNG, WEBP або AVIF до 40 мегапікселів.");
  }
}
