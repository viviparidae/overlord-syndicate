// scripts/lib/unzip.mjs
// 依存パッケージ不要の ZIP 展開（node:zlib の inflateRaw を使用）
// 用途: scripts/fetch-assets.mjs が取得した zip を public/assets/_vendor/ に展開する

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { inflateRawSync } from "node:zlib";

// --- バイナリユーティリティ ---

function readU32(buf, off) {
  return buf.readUInt32LE(off);
}

function readU16(buf, off) {
  return buf.readUInt16LE(off);
}

// --- ZIP パーサ ---

const SIG_LFH = 0x04034b50;
const SIG_CDH = 0x02014b50;
const SIG_EOCD = 0x06054b50;

/**
 * End of Central Directory レコードを末尾から検索してオフセットを返す。
 * zip に末尾のコメントが無くとも末尾から逆探索で見つける。
 */
function findEOCD(buf) {
  const maxSearch = Math.min(buf.length, 65557);
  const start = Math.max(buf.length - maxSearch, 0);
  for (let i = buf.length - 22; i >= start; i--) {
    if (buf.readUInt32LE(i) === SIG_EOCD) {
      return i;
    }
  }
  return -1;
}

/**
 * 1 エントリの展開結果
 * @typedef {{ name: string, data: Buffer, isDirectory: boolean }} UnzipEntry
 */

/**
 * zip バイナリを解析し、全エントリを展開して配列で返す。
 * @param {Buffer} buf - zip ファイルの内容
 * @returns {UnzipEntry[]}
 */
export function unzipEntries(buf) {
  const eocdOff = findEOCD(buf);
  if (eocdOff === -1) {
    throw new Error("EOCD レコードが見つかりません（有効な zip ではありません）");
  }

  const cdOffset = readU32(buf, eocdOff + 16);
  const cdEntries = readU16(buf, eocdOff + 10);

  const entries = [];
  let pos = cdOffset;
  for (let i = 0; i < cdEntries; i++) {
    if (buf.readUInt32LE(pos) !== SIG_CDH) {
      throw new Error(`Central Directory エントリ ${i} のシグネチャ不一致`);
    }

    const method = readU16(buf, pos + 10);
    const compSize = readU32(buf, pos + 20);
    const uncompSize = readU32(buf, pos + 24);
    const nameLen = readU16(buf, pos + 28);
    const extraLen = readU16(buf, pos + 30);
    const commentLen = readU16(buf, pos + 32);
    const lfhOffset = readU32(buf, pos + 42);

    const name = buf.toString("utf8", pos + 46, pos + 46 + nameLen);
    const isDirectory = name.endsWith("/");

    // Local File Header へ移動して実データのオフセットを求める
    if (buf.readUInt32LE(lfhOffset) !== SIG_LFH) {
      throw new LFHError(name);
    }
    const lfhNameLen = readU16(buf, lfhOffset + 26);
    const lfhExtraLen = readU16(buf, lfhOffset + 28);
    const dataStart = lfhOffset + 30 + lfhNameLen + lfhExtraLen;

    let data;
    if (method === 0) {
      // ストア（無圧縮）
      data = Buffer.from(buf.subarray(dataStart, dataStart + compSize));
    } else if (method === 8) {
      // DEFLATE
      const raw = Buffer.from(buf.subarray(dataStart, dataStart + compSize));
      try {
        data = inflateRawSync(raw);
      } catch (e) {
        throw new Error(`${name}: 展開失敗 (${e.message})`);
      }
      if (data.length !== uncompSize) {
        throw new Error(`${name}: 展開サイズ不一致 (expected ${uncompSize}, got ${data.length})`);
      }
    } else {
      throw new Error(`${name}: サポート外の圧縮方式 method=${method}`);
    }

    entries.push({ name, data, isDirectory });

    pos += 46 + nameLen + extraLen + commentLen;
  }

  return entries;
}

/**
 * zip ファイルを指定ディレクトリに展開する。
 * @param {string} zipPath - zip ファイルパス
 * @param {string} outDir - 展開先ディレクトリ
 * @returns {UnzipEntry[]}
 */
export function unzipFile(zipPath, outDir) {
  const buf = readFileSync(zipPath);
  const entries = unzipEntries(buf);
  for (const entry of entries) {
    if (entry.isDirectory) {
      const dir = join(outDir, entry.name);
      if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    } else {
      const target = join(outDir, entry.name);
      mkdirSync(dirname(target), { recursive: true });
      writeFileSync(target, entry.data);
    }
  }
  return entries;
}

// Local File Header が不正だった場合の専用エラー
class LFHError extends Error {
  constructor(name) {
    super(`${name}: Local File Header のシグネチャ不一致`);
    this.name = "LFHError";
  }
}
