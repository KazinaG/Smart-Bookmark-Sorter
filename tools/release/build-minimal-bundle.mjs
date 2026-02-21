#!/usr/bin/env node

import fs from "node:fs";
import fsp from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";

const ROOT_DIR = process.cwd();

function fail(message) {
  console.error(`[minimal-bundle] ${message}`);
  process.exit(1);
}

function toPosixPath(value) {
  return value.split(path.sep).join("/");
}

function normalizeRelativePath(value) {
  return path.posix.normalize(value.replace(/\\/g, "/"));
}

function isExternalRef(ref) {
  return /^(?:[a-zA-Z][a-zA-Z0-9+.-]*:|\/\/)/.test(ref);
}

function removeQueryAndHash(ref) {
  const index = ref.search(/[?#]/);
  if (index === -1) {
    return ref;
  }
  return ref.slice(0, index);
}

function hasGlob(value) {
  return /[*?[]/.test(value);
}

function escapeRegex(value) {
  return value.replace(/[|\\{}()[\]^$+?.]/g, "\\$&");
}

function globToRegExp(globPattern) {
  let regex = "^";
  for (let i = 0; i < globPattern.length; i += 1) {
    const char = globPattern[i];
    if (char === "*") {
      const isDouble = globPattern[i + 1] === "*";
      regex += isDouble ? ".*" : "[^/]*";
      if (isDouble) {
        i += 1;
      }
      continue;
    }
    if (char === "?") {
      regex += "[^/]";
      continue;
    }
    regex += escapeRegex(char);
  }
  regex += "$";
  return new RegExp(regex);
}

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

function parseArgs(argv) {
  const options = {
    manifestPath: "manifest.json",
    outDir: "dist/release",
    dryRun: false,
    includes: [],
  };

  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (token === "--dry-run") {
      options.dryRun = true;
      continue;
    }
    if (token === "--manifest") {
      const next = argv[i + 1];
      if (!next) {
        fail("--manifest には値が必要です。");
      }
      options.manifestPath = next;
      i += 1;
      continue;
    }
    if (token === "--out-dir") {
      const next = argv[i + 1];
      if (!next) {
        fail("--out-dir には値が必要です。");
      }
      options.outDir = next;
      i += 1;
      continue;
    }
    if (token === "--include") {
      const next = argv[i + 1];
      if (!next) {
        fail("--include には値が必要です。");
      }
      options.includes.push(next);
      i += 1;
      continue;
    }
    if (token === "--help" || token === "-h") {
      console.log("Usage: node tools/release/build-minimal-bundle.mjs [options]");
      console.log("");
      console.log("Options:");
      console.log("  --dry-run            zip を作らずに抽出対象のみ表示");
      console.log("  --manifest <path>    manifest パス (default: manifest.json)");
      console.log("  --out-dir <path>     出力先ディレクトリ (default: dist/release)");
      console.log("  --include <path>     自動検出に追加するファイル/パターン");
      process.exit(0);
    }
    fail(`不明な引数です: ${token}`);
  }

  return options;
}

function resolveCandidatePath(rawRef, baseDir) {
  const cleaned = removeQueryAndHash(String(rawRef).trim());
  if (!cleaned || cleaned === "#") {
    return null;
  }
  if (isExternalRef(cleaned)) {
    return null;
  }
  const relative = cleaned.startsWith("/")
    ? cleaned.slice(1)
    : path.posix.join(baseDir, cleaned);
  const normalized = normalizeRelativePath(relative);
  const absolute = path.resolve(ROOT_DIR, normalized);
  const relativeFromRoot = toPosixPath(path.relative(ROOT_DIR, absolute));

  if (
    relativeFromRoot.startsWith("../") ||
    relativeFromRoot === ".." ||
    path.isAbsolute(relativeFromRoot)
  ) {
    return null;
  }

  return relativeFromRoot;
}

function* walkFiles(relativeDir) {
  const absoluteDir = path.join(ROOT_DIR, relativeDir);
  if (!fs.existsSync(absoluteDir)) {
    return;
  }
  const stack = [absoluteDir];
  while (stack.length > 0) {
    const current = stack.pop();
    const entries = fs.readdirSync(current, { withFileTypes: true });
    for (const entry of entries) {
      const entryPath = path.join(current, entry.name);
      if (entry.isDirectory()) {
        stack.push(entryPath);
        continue;
      }
      if (!entry.isFile()) {
        continue;
      }
      const rel = toPosixPath(path.relative(ROOT_DIR, entryPath));
      yield rel;
    }
  }
}

function extractHtmlRefs(content) {
  const refs = [];
  const attrRegex = /\b(?:src|href)\s*=\s*["']([^"']+)["']/gi;
  let match = attrRegex.exec(content);
  while (match) {
    refs.push(match[1]);
    match = attrRegex.exec(content);
  }
  return refs;
}

function extractJsRefs(content) {
  const refs = [];
  const importScriptsRegex = /importScripts\s*\(([\s\S]*?)\)/g;
  let importScriptsMatch = importScriptsRegex.exec(content);
  while (importScriptsMatch) {
    const literalRegex = /["']([^"']+)["']/g;
    let literalMatch = literalRegex.exec(importScriptsMatch[1]);
    while (literalMatch) {
      refs.push(literalMatch[1]);
      literalMatch = literalRegex.exec(importScriptsMatch[1]);
    }
    importScriptsMatch = importScriptsRegex.exec(content);
  }

  const patterns = [
    /\bimport\s+(?:[^"']*?\sfrom\s*)?["']([^"']+)["']/g,
    /\bexport\s+[^"']*?\sfrom\s*["']([^"']+)["']/g,
    /\bimport\s*\(\s*["']([^"']+)["']\s*\)/g,
    /chrome\.runtime\.getURL\s*\(\s*["']([^"']+)["']\s*\)/g,
  ];

  for (const pattern of patterns) {
    let patternMatch = pattern.exec(content);
    while (patternMatch) {
      refs.push(patternMatch[1]);
      patternMatch = pattern.exec(content);
    }
  }

  return refs;
}

function extractCssRefs(content) {
  const refs = [];
  const urlRegex = /url\(\s*(['"]?)([^'"()]+)\1\s*\)/g;
  let urlMatch = urlRegex.exec(content);
  while (urlMatch) {
    refs.push(urlMatch[2]);
    urlMatch = urlRegex.exec(content);
  }
  const importRegex = /@import\s+["']([^"']+)["']/g;
  let importMatch = importRegex.exec(content);
  while (importMatch) {
    refs.push(importMatch[1]);
    importMatch = importRegex.exec(content);
  }
  return refs;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const manifestRelative = normalizeRelativePath(options.manifestPath);
  const manifestAbsolute = path.resolve(ROOT_DIR, manifestRelative);
  if (!fs.existsSync(manifestAbsolute)) {
    fail(`manifest が見つかりません: ${manifestRelative}`);
  }

  let manifest;
  try {
    manifest = JSON.parse(await fsp.readFile(manifestAbsolute, "utf8"));
  } catch (error) {
    fail(`manifest の読み込みに失敗しました: ${error.message}`);
  }

  const collectedFiles = new Set();
  const parseQueue = [];
  const missingRequired = [];

  function addFile(relativePath, reason) {
    if (!relativePath) {
      return;
    }
    if (collectedFiles.has(relativePath)) {
      return;
    }
    const absolutePath = path.join(ROOT_DIR, relativePath);
    if (!fs.existsSync(absolutePath)) {
      missingRequired.push({ path: relativePath, reason });
      return;
    }
    const stat = fs.statSync(absolutePath);
    if (!stat.isFile()) {
      missingRequired.push({ path: relativePath, reason });
      return;
    }
    collectedFiles.add(relativePath);
    parseQueue.push(relativePath);
  }

  function addDirectory(relativePath, reason) {
    const absolutePath = path.join(ROOT_DIR, relativePath);
    if (!fs.existsSync(absolutePath)) {
      missingRequired.push({ path: relativePath, reason });
      return;
    }
    const stat = fs.statSync(absolutePath);
    if (!stat.isDirectory()) {
      addFile(relativePath, reason);
      return;
    }
    for (const file of walkFiles(relativePath)) {
      addFile(file, reason);
    }
  }

  function addGlob(pattern, reason) {
    const normalizedPattern = normalizeRelativePath(pattern);
    const firstWildcard = normalizedPattern.search(/[*?[]/);
    const beforeWildcard = firstWildcard === -1 ? normalizedPattern : normalizedPattern.slice(0, firstWildcard);
    const baseDir = path.posix.dirname(beforeWildcard);
    const scanBase = baseDir === "." ? "" : baseDir;
    const matcher = globToRegExp(normalizedPattern);
    let matched = 0;
    for (const file of walkFiles(scanBase)) {
      if (matcher.test(file)) {
        addFile(file, reason);
        matched += 1;
      }
    }
    if (matched === 0) {
      missingRequired.push({ path: normalizedPattern, reason });
    }
  }

  function addRef(ref, baseDir, reason) {
    const candidate = resolveCandidatePath(ref, baseDir);
    if (!candidate) {
      return;
    }
    if (hasGlob(candidate)) {
      addGlob(candidate, reason);
      return;
    }
    addFile(candidate, reason);
  }

  function addManifestValue(value, reason) {
    if (!value) {
      return;
    }
    if (typeof value === "string") {
      addRef(value, ".", reason);
      return;
    }
    if (Array.isArray(value)) {
      for (const item of value) {
        addManifestValue(item, reason);
      }
      return;
    }
    if (typeof value === "object") {
      for (const nested of Object.values(value)) {
        addManifestValue(nested, reason);
      }
    }
  }

  addFile(manifestRelative, "manifest");

  addManifestValue(manifest.icons, "manifest.icons");
  addManifestValue(manifest.action?.default_icon, "manifest.action.default_icon");
  addManifestValue(manifest.action?.default_popup, "manifest.action.default_popup");
  addManifestValue(manifest.background?.service_worker, "manifest.background.service_worker");
  addManifestValue(manifest.background?.scripts, "manifest.background.scripts");
  addManifestValue(manifest.options_page, "manifest.options_page");
  addManifestValue(manifest.options_ui?.page, "manifest.options_ui.page");
  addManifestValue(manifest.devtools_page, "manifest.devtools_page");
  addManifestValue(manifest.side_panel?.default_path, "manifest.side_panel.default_path");
  addManifestValue(manifest.chrome_url_overrides, "manifest.chrome_url_overrides");
  addManifestValue(manifest.sandbox?.pages, "manifest.sandbox.pages");

  if (Array.isArray(manifest.content_scripts)) {
    for (const [index, entry] of manifest.content_scripts.entries()) {
      addManifestValue(entry.js, `manifest.content_scripts[${index}].js`);
      addManifestValue(entry.css, `manifest.content_scripts[${index}].css`);
    }
  }

  if (Array.isArray(manifest.web_accessible_resources)) {
    for (const [index, entry] of manifest.web_accessible_resources.entries()) {
      addManifestValue(entry.resources, `manifest.web_accessible_resources[${index}].resources`);
    }
  }

  if (manifest.default_locale) {
    addDirectory("_locales", "manifest.default_locale");
  }

  for (const includePath of options.includes) {
    addRef(includePath, ".", "cli.include");
  }

  while (parseQueue.length > 0) {
    const relativePath = parseQueue.pop();
    const extension = path.posix.extname(relativePath).toLowerCase();
    if (extension !== ".html" && extension !== ".js" && extension !== ".mjs" && extension !== ".cjs" && extension !== ".css") {
      continue;
    }

    const absolutePath = path.join(ROOT_DIR, relativePath);
    const baseDir = path.posix.dirname(relativePath);
    const content = await fsp.readFile(absolutePath, "utf8");

    if (extension === ".html") {
      for (const ref of extractHtmlRefs(content)) {
        addRef(ref, baseDir, `html:${relativePath}`);
      }
      continue;
    }
    if (extension === ".css") {
      for (const ref of extractCssRefs(content)) {
        addRef(ref, baseDir, `css:${relativePath}`);
      }
      continue;
    }
    for (const ref of extractJsRefs(content)) {
      addRef(ref, baseDir, `js:${relativePath}`);
    }
  }

  if (missingRequired.length > 0) {
    console.error("[minimal-bundle] 必須ファイルが見つかりません。");
    for (const item of missingRequired) {
      console.error(`  - ${item.path} (${item.reason})`);
    }
    process.exit(1);
  }

  const sortedFiles = [...collectedFiles].sort();

  if (options.dryRun) {
    console.log(`[minimal-bundle] dry-run: ${sortedFiles.length} files`);
    for (const file of sortedFiles) {
      console.log(file);
    }
    return;
  }

  const outDir = path.resolve(ROOT_DIR, options.outDir);
  await fsp.mkdir(outDir, { recursive: true });

  const extensionName = slugify(manifest.name || "extension");
  const extensionVersion = manifest.version || "0.0.0";
  const baseName = `${extensionName}-v${extensionVersion}-minimal`;
  const zipPath = path.join(outDir, `${baseName}.zip`);
  const filesListPath = path.join(outDir, `${baseName}.files.txt`);

  const stagingDir = await fsp.mkdtemp(path.join(os.tmpdir(), "minimal-bundle-"));
  try {
    for (const relativePath of sortedFiles) {
      const sourcePath = path.join(ROOT_DIR, relativePath);
      const destinationPath = path.join(stagingDir, relativePath);
      await fsp.mkdir(path.dirname(destinationPath), { recursive: true });
      await fsp.copyFile(sourcePath, destinationPath);
    }

    if (fs.existsSync(zipPath)) {
      await fsp.rm(zipPath);
    }

    const zipResult = spawnSync("zip", ["-q", "-r", zipPath, "."], {
      cwd: stagingDir,
      stdio: "inherit",
    });

    if (zipResult.error && zipResult.error.code === "ENOENT") {
      const pythonResult = spawnSync(
        "python3",
        ["-m", "zipfile", "-c", zipPath, "."],
        {
          cwd: stagingDir,
          stdio: "inherit",
        }
      );
      if (pythonResult.error) {
        if (pythonResult.error.code === "ENOENT") {
          fail("zip と python3 の両方が見つかりません。zip 生成手段を用意してください。");
        }
        fail(`python3 zip 実行に失敗しました: ${pythonResult.error.message}`);
      }
      if (pythonResult.status !== 0) {
        fail(`python3 zip 実行に失敗しました (exit: ${pythonResult.status})`);
      }
    } else {
      if (zipResult.error) {
        fail(`zip 実行に失敗しました: ${zipResult.error.message}`);
      }
      if (zipResult.status !== 0) {
        fail(`zip 実行に失敗しました (exit: ${zipResult.status})`);
      }
    }

    await fsp.writeFile(filesListPath, `${sortedFiles.join("\n")}\n`, "utf8");
  } finally {
    await fsp.rm(stagingDir, { recursive: true, force: true });
  }

  console.log(`[minimal-bundle] zip: ${toPosixPath(path.relative(ROOT_DIR, zipPath))}`);
  console.log(`[minimal-bundle] list: ${toPosixPath(path.relative(ROOT_DIR, filesListPath))}`);
  console.log(`[minimal-bundle] files: ${sortedFiles.length}`);
}

main().catch((error) => {
  fail(error.stack || error.message);
});
