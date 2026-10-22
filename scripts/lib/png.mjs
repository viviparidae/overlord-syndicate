// scripts/lib/png.mjs
// PNG ヘッダの読み取りと、デコード（IDAT の展開 + フィルタ復元）
// 画像データは Phaser に任せるが、アトラス JSON のフレーム矩形を自動決定するため
// このスクリプトで透明ピクセルの境界を調べる。

import { inflateSync } from "node:zlib";

const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const IHDR_SIGNATURE = Buffer.from([0x49, 0x48, 0x44, 0x52]);
const _PLTE_SIGNATURE = Buffer.from([0x50, 0x4c, 0x54, 0x45]);
const _TRNS_SIGNATURE = Buffer.from([0x74, 0x52, 0x4e, 0x53]);

/**
 * PNG ヘッダから寸法を取得する。
 * @param {Buffer} buf - PNG ファイルの内容
 * @returns {{width: number, height: number} | null} PNG でなければ null
 */
export function readPngInfo(buf) {
  if (buf.length < 24) return null;
  if (!buf.subarray(0, 8).equals(PNG_SIGNATURE)) return null;
  if (!buf.subarray(12, 16).equals(IHDR_SIGNATURE)) return null;
  return {
    width: buf.readUInt32BE(16),
    height: buf.readUInt32BE(20),
  };
}

function paethPredictor(a, b, c) {
  const p = a + b - c;
  const pa = Math.abs(p - a);
  const pb = Math.abs(p - b);
  const pc = Math.abs(p - c);
  if (pa <= pb && pa <= pc) return a;
  if (pb <= pc) return b;
  return c;
}

/**
 * PNG をデコードし、RGBA8 のピクセル配列として返す。
 * @param {Buffer} buf - PNG ファイルの内容
 * @returns {{width: number, height: number, data: Buffer}} data は width*height*4 バイト
 */
export function decodePng(buf) {
  if (!readPngInfo(buf)) throw new Error("PNG として不正です");

  const width = buf.readUInt32BE(16);
  const height = buf.readUInt32BE(20);
  const bitDepth = buf[24];
  const colorType = buf[25];
  const interlace = buf[28];

  if (bitDepth !== 8) throw new Error(`bitDepth ${bitDepth} は未対応です`);
  if (interlace !== 0) throw new Error("interlace 画像は未対応です");

  const channels =
    colorType === 0 ? 1 : colorType === 2 ? 3 : colorType === 3 ? 1 : colorType === 4 ? 2 : 4;

  let palette = null;
  let transparency = null;
  const idat = [];

  let pos = 8;
  while (pos < buf.length) {
    const length = buf.readUInt32BE(pos);
    const type = buf.toString("ascii", pos + 4, pos + 8);
    const data = buf.subarray(pos + 8, pos + 8 + length);

    if (type === "PLTE") palette = Buffer.from(data);
    if (type === "tRNS") transparency = Buffer.from(data);
    if (type === "IDAT") idat.push(Buffer.from(data));
    if (type === "IEND") break;

    pos += 12 + length;
  }

  const raw = inflateSync(Buffer.concat(idat));
  const bpp = channels;
  const stride = width * bpp;
  const out = Buffer.alloc(height * stride);

  let src = 0;
  for (let y = 0; y < height; y++) {
    const filter = raw[src++];
    const line = raw.subarray(src, src + stride);
    src += stride;

    const cur = out.subarray(y * stride, (y + 1) * stride);
    const prev = y > 0 ? out.subarray((y - 1) * stride, y * stride) : null;

    for (let x = 0; x < stride; x++) {
      const a = x >= bpp ? cur[x - bpp] : 0;
      const b = prev ? prev[x] : 0;
      const c = prev && x >= bpp ? prev[x - bpp] : 0;
      const v = line[x];

      let value;
      switch (filter) {
        case 0:
          value = v;
          break;
        case 1:
          value = v + a;
          break;
        case 2:
          value = v + b;
          break;
        case 3:
          value = v + ((a + b) >> 1);
          break;
        case 4:
          value = v + paethPredictor(a, b, c);
          break;
        default:
          throw new Error(`未知のフィルタ ${filter}`);
      }
      cur[x] = value & 0xff;
    }
  }

  if (colorType === 3) {
    const rgba = Buffer.alloc(width * height * 4);
    for (let i = 0; i < width * height; i++) {
      const idx = out[i];
      rgba[i * 4] = palette ? palette[idx * 3] : 0;
      rgba[i * 4 + 1] = palette ? palette[idx * 3 + 1] : 0;
      rgba[i * 4 + 2] = palette ? palette[idx * 3 + 2] : 0;
      rgba[i * 4 + 3] = transparency && idx < transparency.length ? transparency[idx] : 255;
    }
    return { width, height, data: rgba };
  }

  if (colorType === 0) {
    const rgba = Buffer.alloc(width * height * 4);
    for (let i = 0; i < width * height; i++) {
      const v = out[i];
      rgba[i * 4] = v;
      rgba[i * 4 + 1] = v;
      rgba[i * 4 + 2] = v;
      rgba[i * 4 + 3] = 255;
    }
    return { width, height, data: rgba };
  }

  if (colorType === 4) {
    const rgba = Buffer.alloc(width * height * 4);
    for (let i = 0; i < width * height; i++) {
      rgba[i * 4] = out[i * 2];
      rgba[i * 4 + 1] = out[i * 2];
      rgba[i * 4 + 2] = out[i * 2];
      rgba[i * 4 + 3] = out[i * 2 + 1];
    }
    return { width, height, data: rgba };
  }

  if (colorType === 2) {
    const rgba = Buffer.alloc(width * height * 4);
    for (let i = 0; i < width * height; i++) {
      rgba[i * 4] = out[i * 3];
      rgba[i * 4 + 1] = out[i * 3 + 1];
      rgba[i * 4 + 2] = out[i * 3 + 2];
      rgba[i * 4 + 3] = 255;
    }
    return { width, height, data: rgba };
  }

  return { width, height, data: out };
}

/**
 * 指定した矩形内の不透明ピクセルを走査し、境界を求める。
 * @param {{width: number, height: number, data: Buffer}} image
 * @param {number} x0 - 領域の左端
 * @param {number} y0 - 領域の上端
 * @param {number} x1 - 領域の右端（排他）
 * @param {number} y1 - 領域の下端（排他）
 * @returns {{minX: number, minY: number, maxX: number, maxY: number, count: number} | null}
 */
export function findOpaqueBounds(image, x0, y0, x1, y1) {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  let count = 0;

  for (let y = y0; y < y1; y++) {
    for (let x = x0; x < x1; x++) {
      const alpha = image.data[(y * image.width + x) * 4 + 3];
      if (alpha > 0) {
        count++;
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  if (count === 0) return null;
  return { minX, minY, maxX, maxY, count };
}
