// scripts/fetch-assets.mjs
// オーガニックなアセットを remote から取得して public/assets/_vendor/ へ展開する。
// 依存パッケージは使わず Node 標準ライブラリ（fetch + zlib）のみで動作する。

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { unzipFile } from "./lib/unzip.mjs";

const VENDOR_ROOT = "/workspaces/overlord-syndicate/public/assets/_vendor";
const WORK_ROOT = "/workspaces/overlord-syndicate/tmp/fetch-assets";

const PACKS = [
  {
    id: "kenney_tiny_city",
    url: "https://kenney.nl/assets/download/tiny-city.zip",
    author: "Kenney",
    license: "CC0-1.0",
    target: "kenney/tiny-city",
  },
  {
    id: "tiny_rpg_characters",
    url: "https://opengameart.org/download/tiny-rpg-cc0-characters-and-portraits.zip",
    author: "tiopalada",
    license: "CC0-1.0",
    target: "opengameart/tiny-rpg-cc0-characters-and-portraits",
  },
];

async function fetchZip(url, zipPath) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url}: 取得失敗 (${res.status})`);
  const buf = Buffer.from(await res.arrayBuffer());
  writeFileSync(zipPath, buf);
  return buf;
}

async function main() {
  mkdirSync(WORK_ROOT, { recursive: true });

  for (const pack of PACKS) {
    const zipPath = join(WORK_ROOT, `${pack.id}.zip`);
    await fetchZip(pack.url, zipPath);

    const outDir = join(VENDOR_ROOT, pack.target);
    mkdirSync(outDir, { recursive: true });
    const entries = unzipFile(zipPath, outDir);

    const pngs = entries.filter((e) => !e.isDirectory && e.name.endsWith(".png"));
    console.log(`${pack.id}: ${pngs.length} PNG / ${entries.length} entries`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
