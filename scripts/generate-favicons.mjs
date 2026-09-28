import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

// favicon.svg is the supplied brand artwork, framed tightly on a square canvas.
const publicFile = name => fileURLToPath(new URL(`../public/${name}`, import.meta.url));
const source = await readFile(publicFile("favicon.svg"));
for (const [name, size, background] of [["favicon-96x96.png", 96, false], ["apple-touch-icon.png", 180, true]]) {
  let image = sharp(source, { density: 288 }).resize(size, size);
  if (background) image = image.flatten({ background: "#ffffff" });
  await image.png({ compressionLevel: 9 }).toFile(publicFile(name));
}

// Classic 32-bit DIB frames work in ICO readers without requiring PNG-in-ICO support.
const sizes = [16, 32, 48];
const entries = [];
let offset = 6 + 16 * sizes.length;
for (const size of sizes) {
  const pixels = await sharp(source, { density: 288 }).resize(size, size).ensureAlpha().raw().toBuffer();
  const maskStride = Math.ceil(size / 32) * 4;
  const dib = Buffer.alloc(40 + size * size * 4 + maskStride * size);
  dib.writeUInt32LE(40, 0);
  dib.writeInt32LE(size, 4);
  dib.writeInt32LE(size * 2, 8);
  dib.writeUInt16LE(1, 12);
  dib.writeUInt16LE(32, 14);
  dib.writeUInt32LE(size * size * 4, 20);
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const sourceOffset = (y * size + x) * 4;
    const destinationOffset = 40 + ((size - y - 1) * size + x) * 4;
    dib[destinationOffset] = pixels[sourceOffset + 2];
    dib[destinationOffset + 1] = pixels[sourceOffset + 1];
    dib[destinationOffset + 2] = pixels[sourceOffset];
    dib[destinationOffset + 3] = pixels[sourceOffset + 3];
    if (pixels[sourceOffset + 3] === 0) dib[40 + size * size * 4 + (size - y - 1) * maskStride + Math.floor(x / 8)] |= 0x80 >> (x % 8);
  }
  const entry = Buffer.alloc(16);
  entry[0] = entry[1] = size;
  entry.writeUInt16LE(1, 4);
  entry.writeUInt16LE(32, 6);
  entry.writeUInt32LE(dib.length, 8);
  entry.writeUInt32LE(offset, 12);
  entries.push({ entry, dib });
  offset += dib.length;
}
const header = Buffer.alloc(6);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(sizes.length, 4);
await writeFile(publicFile("favicon.ico"), Buffer.concat([header, ...entries.map(item => item.entry), ...entries.map(item => item.dib)]));
console.log("Generated favicon.ico (16/32/48), favicon-96x96.png and apple-touch-icon.png (180).");
