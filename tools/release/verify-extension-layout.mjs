#!/usr/bin/env node

import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";

const ROOT_DIR = process.cwd();

function fail(message) {
  console.error(`[verify-extension-layout] ${message}`);
  process.exit(1);
}

function toPosixPath(value) {
  return value.split(path.sep).join("/");
}

function normalizeRelativePath(value) {
  return path.posix.normalize(String(value).replace(/\\/g, "/"));
}

function isExternalRef(ref) {
  return /^(?:[a-zA-Z][a-zA-Z0-9+.-]*:|\/\/)/.test(ref);
}

function removeQueryAndHash(ref) {
  const index = ref.search(/[?#]/);
  return index === -1 ? ref : ref.slice(0, index);
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

function parseArgs(argv) {
  const options = {
    extensionDir: "build/extension",
    manifestPath: "manifest.json",
  };

  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (token === "--dir") {
      const next = argv[i + 1];
      if (!next) {
        fail("--dir には値が必要です。");
      }
      options.extensionDir = next;
      i += 1;
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
    if (token === "--help" || token === "-h") {
      console.log("Usage: node tools/release/verify-extension-layout.mjs [options]");
      console.log("");
      console.log("Options:");
      console.log("  --dir <path>         検証対象ディレクトリ (default: build/extension)");
      console.log("  --manifest <path>    manifest パス（--dir からの相対）(default: manifest.json)");
      process.exit(0);
    }
    fail(`不明な引数です: ${token}`);
  }

  return options;
}

function* walkFiles(baseDirAbsolute, relativeDir) {
  const absoluteDir = path.join(baseDirAbsolute, relativeDir);
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
      const rel = toPosixPath(path.relative(baseDirAbsolute, entryPath));
      yield rel;
    }
  }
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
  if (normalized.startsWith("../") || normalized === "..") {
    return null;
  }
  return normalized;
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
  const extensionDir = path.resolve(ROOT_DIR, normalizeRelativePath(options.extensionDir));
  const manifestRelative = normalizeRelativePath(options.manifestPath);
  const manifestAbsolute = path.join(extensionDir, manifestRelative);

  if (!fs.existsSync(extensionDir) || !fs.statSync(extensionDir).isDirectory()) {
    fail(`検証対象ディレクトリが見つかりません: ${toPosixPath(path.relative(ROOT_DIR, extensionDir))}`);
  }
  if (!fs.existsSync(manifestAbsolute) || !fs.statSync(manifestAbsolute).isFile()) {
    fail(`manifest が見つかりません: ${toPosixPath(path.relative(ROOT_DIR, manifestAbsolute))}`);
  }

  let manifest;
  try {
    manifest = JSON.parse(await fsp.readFile(manifestAbsolute, "utf8"));
  } catch (error) {
    fail(`manifest の読み込みに失敗しました: ${error.message}`);
  }

  const collectedFiles = new Set();
  const parseQueue = [];
  const missing = [];

  function addFile(relativePath, reason) {
    if (!relativePath) {
      return;
    }
    if (collectedFiles.has(relativePath)) {
      return;
    }
    const absolutePath = path.join(extensionDir, relativePath);
    if (!fs.existsSync(absolutePath) || !fs.statSync(absolutePath).isFile()) {
      missing.push({ path: relativePath, reason });
      return;
    }
    collectedFiles.add(relativePath);
    parseQueue.push(relativePath);
  }

  function addGlob(pattern, reason) {
    const matcher = globToRegExp(normalizeRelativePath(pattern));
    let matched = 0;
    for (const file of walkFiles(extensionDir, "")) {
      if (matcher.test(file)) {
        addFile(file, reason);
        matched += 1;
      }
    }
    if (matched === 0) {
      missing.push({ path: normalizeRelativePath(pattern), reason });
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
    const defaultLocaleFile = path.posix.join("_locales", manifest.default_locale, "messages.json");
    addFile(defaultLocaleFile, "manifest.default_locale");
  }

  while (parseQueue.length > 0) {
    const relativePath = parseQueue.pop();
    const extension = path.posix.extname(relativePath).toLowerCase();
    if (![".html", ".js", ".mjs", ".cjs", ".css"].includes(extension)) {
      continue;
    }
    const absolutePath = path.join(extensionDir, relativePath);
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

  if (missing.length > 0) {
    console.error("[verify-extension-layout] 欠落ファイルがあります。");
    for (const item of missing) {
      console.error(`  - ${item.path} (${item.reason})`);
    }
    process.exit(1);
  }

  console.log(
    `[verify-extension-layout] pass: ${toPosixPath(path.relative(ROOT_DIR, extensionDir))} (${collectedFiles.size} files checked)`
  );
}

main().catch((error) => {
  fail(error.stack || error.message);
});
