import assert from "node:assert/strict";
import { randomFillSync } from "node:crypto";
import test from "node:test";
import sharp from "sharp";

import { ImageOptimizationError, optimizeUploadedImage } from "../lib/optimizedUpload.ts";
import { readSafeRasterImage } from "../lib/safeImage.ts";

const UPLOAD_LIMIT = 8 * 1024 * 1024;

async function safeImage(bytes, maximumBytes = UPLOAD_LIMIT) {
  const image = await readSafeRasterImage(new File([bytes], "upload.bin"), maximumBytes);
  assert.ok(image);
  return image;
}

function outputBuffer(image) {
  return Buffer.from(image.bytes);
}

function pngChunk(type, data) {
  const chunk = Buffer.alloc(data.length + 12);
  chunk.writeUInt32BE(data.length, 0);
  chunk.write(type, 4, "ascii");
  data.copy(chunk, 8);
  let crc = 0xffffffff;
  for (const byte of chunk.subarray(4, chunk.length - 4)) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit++) crc = (crc >>> 1) ^ ((crc & 1) ? 0xedb88320 : 0);
  }
  chunk.writeUInt32BE((crc ^ 0xffffffff) >>> 0, chunk.length - 4);
  return chunk;
}

test("large noisy uploads become smaller WebP images within the requested dimensions", async () => {
  const pixels = randomFillSync(Buffer.alloc(1800 * 1200 * 3));
  const original = await sharp(pixels, { raw: { width: 1800, height: 1200, channels: 3 } }).png().toBuffer();
  const output = await optimizeUploadedImage(await safeImage(original), { maximumBytes: UPLOAD_LIMIT, maxDimension: 1200 });
  const metadata = await sharp(outputBuffer(output)).metadata();
  assert.equal(output.contentType, "image/webp");
  assert.equal(output.extension, "webp");
  assert.equal(metadata.format, "webp");
  assert.equal(metadata.width, 1200);
  assert.equal(metadata.height, 800);
  assert.ok(output.bytes.byteLength < original.byteLength / 2);
});

test("transparent and translucent pixels survive conversion", async () => {
  const width = 96;
  const pixels = Buffer.alloc(width * 32 * 4);
  for (let y = 0; y < 32; y++) {
    for (let x = 0; x < width; x++) {
      const offset = (y * width + x) * 4;
      pixels.set([40, 130, 190, x < 32 ? 0 : x < 64 ? 128 : 255], offset);
    }
  }
  const original = await sharp(pixels, { raw: { width, height: 32, channels: 4 } }).png().toBuffer();
  const output = await optimizeUploadedImage(await safeImage(original), { maximumBytes: UPLOAD_LIMIT, maxDimension: 48 });
  const { data, info } = await sharp(outputBuffer(output)).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const alphaAt = (x) => data[(8 * info.width + x) * info.channels + 3];
  assert.equal(info.channels, 4);
  assert.equal(alphaAt(8), 0);
  assert.equal(alphaAt(24), 128);
  assert.equal(alphaAt(40), 255);
});

test("EXIF rotation is applied to pixels before metadata is removed", async () => {
  const original = await sharp({ create: { width: 80, height: 40, channels: 3, background: "#087f82" } })
    .jpeg().withMetadata({ orientation: 6 }).toBuffer();
  const output = await optimizeUploadedImage(await safeImage(original), { maximumBytes: UPLOAD_LIMIT });
  const metadata = await sharp(outputBuffer(output)).metadata();
  assert.equal(metadata.width, 40);
  assert.equal(metadata.height, 80);
  assert.equal(metadata.orientation, undefined);
  assert.equal(metadata.exif, undefined);
});

test("a small efficient original is kept byte for byte and never enlarged", async () => {
  const original = await sharp({ create: { width: 16, height: 12, channels: 3, background: "#ff0000" } })
    .webp({ lossless: true }).toBuffer();
  const output = await optimizeUploadedImage(await safeImage(original), { maximumBytes: UPLOAD_LIMIT });
  assert.deepEqual(outputBuffer(output), original);
  const metadata = await sharp(outputBuffer(output)).metadata();
  assert.equal(metadata.width, 16);
  assert.equal(metadata.height, 12);
});

test("the default dimension cap applies even when the original uses fewer bytes", async () => {
  const original = await sharp({ create: { width: 3000, height: 100, channels: 3, background: "#ffffff" } })
    .webp({ lossless: true }).toBuffer();
  const output = await optimizeUploadedImage(await safeImage(original), { maximumBytes: UPLOAD_LIMIT });
  const metadata = await sharp(outputBuffer(output)).metadata();
  assert.equal(metadata.width, 2400);
  assert.equal(metadata.height, 80);
});

test("a raster signature without valid image data is rejected", async () => {
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  await assert.rejects(
    optimizeUploadedImage(await safeImage(signature), { maximumBytes: UPLOAD_LIMIT }),
    ImageOptimizationError,
  );
});

test("uploads retain their endpoint byte limit before decoding", async () => {
  const original = await sharp({ create: { width: 8, height: 8, channels: 3, background: "#ffffff" } }).png().toBuffer();
  assert.equal(await readSafeRasterImage(new File([original], "small.png"), original.length - 1), null);
  await assert.rejects(
    optimizeUploadedImage(await safeImage(original), { maximumBytes: original.length - 1 }),
    ImageOptimizationError,
  );
});

test("animated WebP is rejected instead of silently keeping only its first frame", async () => {
  const pixels = Buffer.alloc(8 * 16 * 3);
  for (let pixel = 0; pixel < 8 * 16; pixel++) pixels.set(pixel < 64 ? [255, 0, 0] : [0, 0, 255], pixel * 3);
  const original = await sharp(pixels, { raw: { width: 8, height: 16, pageHeight: 8, channels: 3 } })
    .webp({ loop: 0, delay: [100, 100] }).toBuffer();
  assert.equal((await sharp(original).metadata()).pages, 2);
  await assert.rejects(
    optimizeUploadedImage(await safeImage(original), { maximumBytes: UPLOAD_LIMIT }),
    (error) => error instanceof ImageOptimizationError && error.message.includes("Анімовані"),
  );
});

test("a tiny compressed PNG declaring more than 40 megapixels is refused", async () => {
  const original = await sharp({ create: { width: 1, height: 1, channels: 3, background: "#ffffff" } }).png().toBuffer();
  const header = Buffer.from(original.subarray(16, 29));
  header.writeUInt32BE(10_000, 0);
  header.writeUInt32BE(5_000, 4);
  const oversized = Buffer.concat([original.subarray(0, 8), pngChunk("IHDR", header), original.subarray(33)]);
  assert.equal((await sharp(oversized, { limitInputPixels: false }).metadata()).width, 10_000);
  await assert.rejects(
    optimizeUploadedImage(await safeImage(oversized), { maximumBytes: UPLOAD_LIMIT }),
    ImageOptimizationError,
  );
});

test("APNG is refused even when the decoder only exposes the first frame", async () => {
  const frames = await Promise.all(["#ff0000", "#0000ff"].map((background) =>
    sharp({ create: { width: 1, height: 1, channels: 4, background } }).png().toBuffer()));
  const idat = (png) => {
    const parts = [];
    for (let offset = 8; offset + 12 <= png.length;) {
      const length = png.readUInt32BE(offset);
      if (png.toString("ascii", offset + 4, offset + 8) === "IDAT") parts.push(png.subarray(offset + 8, offset + 8 + length));
      offset += length + 12;
    }
    return Buffer.concat(parts);
  };
  const animation = Buffer.alloc(8);
  animation.writeUInt32BE(2, 0);
  const control = (sequence) => {
    const data = Buffer.alloc(26);
    data.writeUInt32BE(sequence, 0);
    data.writeUInt32BE(1, 4);
    data.writeUInt32BE(1, 8);
    data.writeUInt16BE(1, 20);
    data.writeUInt16BE(10, 22);
    return pngChunk("fcTL", data);
  };
  const secondSequence = Buffer.alloc(4);
  secondSequence.writeUInt32BE(2);
  const apng = Buffer.concat([
    frames[0].subarray(0, 33), pngChunk("acTL", animation), control(0),
    pngChunk("IDAT", idat(frames[0])), control(1),
    pngChunk("fdAT", Buffer.concat([secondSequence, idat(frames[1])])), pngChunk("IEND", Buffer.alloc(0)),
  ]);
  await assert.rejects(
    optimizeUploadedImage(await safeImage(apng), { maximumBytes: UPLOAD_LIMIT }),
    (error) => error instanceof ImageOptimizationError && error.message.includes("Анімовані"),
  );
});
