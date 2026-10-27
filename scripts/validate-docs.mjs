// ドキュメント検証スクリプト（Node.js ビルトインのみ）
// docs/ 配下のすべての .md ファイルがトレーサビリティ用 frontmatter を持つことを確認
import fs from "node:fs";
import path from "node:path";

const REPO_ROOT = process.cwd();
const DOCS_DIR = path.join(REPO_ROOT, "docs");

const REQUIRED_FIELDS = [
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

const ALLOWED_STATUSES = ["draft", "review", "approved", "deprecated"];
const ALLOWED_CATEGORIES = [
  "design",
  "architecture",
  "balance",
  "localization",
  "qa",
  "project-management",
  "rules",
];

const FRONTMATTTER_RE = /^---\n([\s\S]*?)\n---\n/;

// --- YAML の簡易パッサ（このプロジェクトの frontmatter 形式に特化）---
function parseFrontmatterYaml(raw) {
  const obj = {};
  const lines = raw.split("\n");
  let i = 0;
  let currentKey = null;
  let currentList = null;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#")) {
      i++;
      continue;
    }

    if (trimmed.startsWith("- ") && currentList !== null) {
      currentList.push(
        trimmed
          .slice(2)
          .trim()
          .replace(/^["']|["']$/g, ""),
      );
      i++;
      continue;
    }

    const match = trimmed.match(/^([\w._]+):(.*)$/);
    if (match) {
      currentKey = match[1];
      const value = match[2].trim();

      if (value === "") {
        currentList = [];
        obj[currentKey] = currentList;
      } else if (value.startsWith("[") && value.endsWith("]")) {
        // インラインリスト: [a, b]
        const items = value
          .slice(1, -1)
          .split(",")
          .map((s) => s.trim().replace(/^["']|["']$/g, ""))
          .filter(Boolean);
        obj[currentKey] = items;
        currentKey = null;
        currentList = null;
      } else if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        obj[currentKey] = value.slice(1, -1);
        currentKey = null;
        currentList = null;
      } else {
        obj[currentKey] = value;
        currentKey = null;
        currentList = null;
      }
    }

    i++;
  }

  return obj;
}

function extractFrontmatter(content) {
  const match = FRONTMATTTER_RE.exec(content);
  if (!match) return null;
  return match[1];
}

function validateFile(filePath, errors) {
  const content = fs.readFileSync(filePath, "utf-8");
  const raw = extractFrontmatter(content);

  if (!raw) {
    errors.push({ file: filePath, issue: "frontmatter が見つかりません" });
    return;
  }

  const parsed = parseFrontmatterYaml(raw);

  for (const field of REQUIRED_FIELDS) {
    if (!(field in parsed)) {
      errors.push({ file: filePath, issue: `frontmatter に必須フィールド '${field}' が欠落` });
    }
  }

  if (parsed.status && !ALLOWED_STATUSES.includes(parsed.status)) {
    errors.push({
      file: filePath,
      issue: `status '${parsed.status}' は許容外（許容: ${ALLOWED_STATUSES.join(", ")})`,
    });
  }

  if (parsed.category && !ALLOWED_CATEGORIES.includes(parsed.category)) {
    errors.push({
      file: filePath,
      issue: `category '${parsed.category}' は許容外（許容: ${ALLOWED_CATEGORIES.join(", ")})`,
    });
  }

  if (parsed.traces_to) {
    for (const trace of parsed.traces_to) {
      if (!fs.existsSync(path.join(REPO_ROOT, trace))) {
        errors.push({ file: filePath, issue: `traces_to のリンク先が存在しません: ${trace}` });
      }
    }
  }

  if (parsed.implemented_by) {
    for (const impl of parsed.implemented_by) {
      // ワイルドカードパターン（*）は許容
      if (impl.includes("*")) continue;
      const clean = impl.replace(/\s*[(（].*?[)）]/g, "").trim();
      const p = path.join(REPO_ROOT, clean);
      if (!fs.existsSync(p) && !fs.existsSync(p.replace("/*", ""))) {
        errors.push({ file: filePath, issue: `implemented_by のリンク先が存在しません: ${impl}` });
      }
    }
  }

  if (parsed.verified_by) {
    for (const v of parsed.verified_by) {
      if (v.includes("（") || v.includes("(") || v.includes("レビュー") || v.includes("手動"))
        continue; // 手動検証の兆候
      const p = path.join(REPO_ROOT, v);
      if (!fs.existsSync(p)) {
        errors.push({ file: filePath, issue: `verified_by のリンク先が存在しません: ${v}` });
      }
    }
  }

  // wiki-link の切れリンクチェック（インラインコード内の `[[...]]` は除外）
  const contentWithoutCode = content.replace(/`[^`]*`/g, "");
  const wikiLinks = [...contentWithoutCode.matchAll(/\[\[([^\]]+)\]\]/g)];
  for (const [, link] of wikiLinks) {
    const target = link.includes("|") ? link.split("|")[0] : link;
    const targetPath = path.join(REPO_ROOT, target);
    if (!fs.existsSync(targetPath) && !fs.existsSync(`${targetPath}.md`)) {
      errors.push({ file: filePath, issue: `wiki-link のリンク先が存在しません: ${target}` });
    }
  }

  return errors;
}

function main() {
  if (!fs.existsSync(DOCS_DIR)) {
    console.error(`ERROR: docs/ ディレクトリが見つかりません: ${DOCS_DIR}`);
    process.exit(1);
  }

  const mdFiles = [];
  function collect(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) collect(full);
      else if (entry.name.endsWith(".md")) mdFiles.push(full);
    }
  }
  collect(DOCS_DIR);

  const errors = [];
  for (const file of mdFiles) {
    validateFile(path.relative(REPO_ROOT, file), errors);
  }

  if (errors.length > 0) {
    console.error(`\n❌ ドキュメント検証エラー (${errors.length}件):`);
    for (const e of errors) {
      console.error(`  - ${e.file}: ${e.issue}`);
    }
    process.exit(1);
  }

  console.log(`✅ ドキュメント検証完了 (${mdFiles.length}ファイル OK)`);
}

main();
