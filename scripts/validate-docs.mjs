#!/usr/bin/env node
/**
 * docs/ 配下のMarkdownを検証する。
 *  - frontmatter に必須9項目があるか
 *  - [[wiki-link]] が実在するファイルに解決するか
 *  - frontmatter の traces_to のパスが実在するか
 * 使用法: node scripts/validate-docs.mjs
 */
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const ROOT = "docs";
const REQUIRED = [
  "title",
  "description",
  "status",
  "version",
  "category",
  "tags",
  "traces_to",
  "implemented_by",
  "verified_by",
];

function walk(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...walk(p));
    else if (name.endsWith(".md")) out.push(p);
  }
  return out;
}

const files = walk(ROOT);
const errors = [];

for (const file of files) {
  const raw = readFileSync(file, "utf8");
  const fm = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/);
  if (!fm) {
    errors.push(`${file}: frontmatter なし`);
    continue;
  }
  const head = fm[1];
  for (const key of REQUIRED) {
    if (!new RegExp(`^${key}:`, "m").test(head)) {
      errors.push(`${file}: frontmatter に ${key} がない`);
    }
  }
  for (const link of raw.matchAll(/\[\[([^\]]+)\]\]/g)) {
    const target = link[1].trim();
    if (!existsSync(target) && !existsSync(`${target}.md`)) {
      errors.push(`${file}: リンク切れ [[${target}]]`);
    }
  }
  const traces = head.match(/^traces_to:((?:\r?\n\s*-.*)*)/m);
  if (traces) {
    for (const line of traces[1].split(/\r?\n/)) {
      const m = line.match(/^\s*-\s*(.+)$/);
      if (!m) continue;
      const p = m[1].trim();
      if (!existsSync(p)) errors.push(`${file}: traces_to の ${p} が存在しない`);
    }
  }
}

if (errors.length > 0) {
  console.error(`${errors.length} 件のエラー:`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}
console.log(`docs: ${files.length} ファイル、検証OK`);
