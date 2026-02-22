#!/usr/bin/env node

import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";

const ROOT_DIR = process.cwd();

function fail(message) {
  console.error(`[build-extension] ${message}`);
  process.exit(1);
}

function toPosixPath(value) {
  return value.split(path.sep).join("/");
}

function normalizeRelativePath(value) {
  return path.posix.normalize(String(value).replace(/\\/g, "/"));
}

function parseArgs(argv) {
  const options = {
    sourceDir: "src/extension",
    manifestPath: "manifest.json",
    localesDir: "_locales",
    outDir: "build/extension",
    clean: true,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (token === "--source-dir") {
      const next = argv[i + 1];
      if (!next) {
        fail("--source-dir には値が必要です。");
      }
      options.sourceDir = next;
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
    if (token === "--locales-dir") {
      const next = argv[i + 1];
      if (!next) {
        fail("--locales-dir には値が必要です。");
      }
      options.localesDir = next;
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
    if (token === "--no-clean") {
      options.clean = false;
      continue;
    }
    if (token === "--help" || token === "-h") {
      console.log("Usage: node tools/release/build-extension.mjs [options]");
      console.log("");
      console.log("Options:");
      console.log("  --source-dir <path>   開発構造のルート (default: src/extension)");
      console.log("  --manifest <path>     入力 manifest (default: manifest.json)");
      console.log("  --locales-dir <path>  ルート locales (default: _locales)");
      console.log("  --out-dir <path>      出力先 (default: build/extension)");
      console.log("  --no-clean            出力先を事前削除しない");
      process.exit(0);
    }
    fail(`不明な引数です: ${token}`);
  }

  return options;
}

function ensureDirectoryExists(absolutePath, label) {
  if (!fs.existsSync(absolutePath)) {
    fail(`${label} が見つかりません: ${toPosixPath(path.relative(ROOT_DIR, absolutePath))}`);
  }
  const stat = fs.statSync(absolutePath);
  if (!stat.isDirectory()) {
    fail(`${label} がディレクトリではありません: ${toPosixPath(path.relative(ROOT_DIR, absolutePath))}`);
  }
}

function rewriteManifestPath(rawValue) {
  if (typeof rawValue !== "string") {
    return rawValue;
  }
  const value = normalizeRelativePath(rawValue);
  const map = [
    ["src/extension/ui/options/", "options/"],
    ["src/extension/ui/delete-suggestion/", "delete-suggestion/"],
    ["src/extension/background/", "background/"],
    ["src/extension/vendor/", "vendor/"],
    ["src/extension/assets/", "assets/"],
    ["src/extension/", ""],
  ];
  for (const [from, to] of map) {
    if (value === from.slice(0, -1)) {
      return to.slice(0, -1);
    }
    if (value.startsWith(from)) {
      return `${to}${value.slice(from.length)}`;
    }
  }
  return value;
}

function rewriteManifestField(value) {
  if (typeof value === "string") {
    return rewriteManifestPath(value);
  }
  if (Array.isArray(value)) {
    return value.map((item) => rewriteManifestField(item));
  }
  if (value && typeof value === "object") {
    const out = {};
    for (const [key, nested] of Object.entries(value)) {
      out[key] = rewriteManifestField(nested);
    }
    return out;
  }
  return value;
}

function rewriteManifest(manifest) {
  const next = structuredClone(manifest);

  if (next.icons && typeof next.icons === "object") {
    next.icons = rewriteManifestField(next.icons);
  }
  if (next.action?.default_icon) {
    next.action.default_icon = rewriteManifestPath(next.action.default_icon);
  }
  if (next.action?.default_popup) {
    next.action.default_popup = rewriteManifestPath(next.action.default_popup);
  }
  if (next.background?.service_worker) {
    next.background.service_worker = rewriteManifestPath(next.background.service_worker);
  }
  if (Array.isArray(next.background?.scripts)) {
    next.background.scripts = next.background.scripts.map((item) => rewriteManifestPath(item));
  }
  if (next.options_page) {
    next.options_page = rewriteManifestPath(next.options_page);
  }
  if (next.options_ui?.page) {
    next.options_ui.page = rewriteManifestPath(next.options_ui.page);
  }
  if (next.devtools_page) {
    next.devtools_page = rewriteManifestPath(next.devtools_page);
  }
  if (next.side_panel?.default_path) {
    next.side_panel.default_path = rewriteManifestPath(next.side_panel.default_path);
  }
  if (next.chrome_url_overrides && typeof next.chrome_url_overrides === "object") {
    next.chrome_url_overrides = rewriteManifestField(next.chrome_url_overrides);
  }
  if (next.sandbox?.pages) {
    next.sandbox.pages = rewriteManifestField(next.sandbox.pages);
  }
  if (Array.isArray(next.content_scripts)) {
    next.content_scripts = next.content_scripts.map((entry) => ({
      ...entry,
      js: Array.isArray(entry.js) ? entry.js.map((item) => rewriteManifestPath(item)) : entry.js,
      css: Array.isArray(entry.css) ? entry.css.map((item) => rewriteManifestPath(item)) : entry.css,
    }));
  }
  if (Array.isArray(next.web_accessible_resources)) {
    next.web_accessible_resources = next.web_accessible_resources.map((entry) => ({
      ...entry,
      resources: Array.isArray(entry.resources)
        ? entry.resources.map((item) => rewriteManifestPath(item))
        : entry.resources,
    }));
  }

  return next;
}

async function copyDirectory(rootSource, rootTarget, relativeSource, relativeTarget) {
  const source = path.join(rootSource, relativeSource);
  const target = path.join(rootTarget, relativeTarget);
  ensureDirectoryExists(source, "ソースディレクトリ");
  await fsp.mkdir(path.dirname(target), { recursive: true });
  await fsp.cp(source, target, { recursive: true });
}

async function main() {
  const options = parseArgs(process.argv.slice(2));

  const sourceDir = path.resolve(ROOT_DIR, normalizeRelativePath(options.sourceDir));
  const manifestPath = path.resolve(ROOT_DIR, normalizeRelativePath(options.manifestPath));
  const localesDir = path.resolve(ROOT_DIR, normalizeRelativePath(options.localesDir));
  const outDir = path.resolve(ROOT_DIR, normalizeRelativePath(options.outDir));

  ensureDirectoryExists(sourceDir, "source-dir");
  ensureDirectoryExists(localesDir, "locales-dir");
  if (!fs.existsSync(manifestPath)) {
    fail(`manifest が見つかりません: ${toPosixPath(path.relative(ROOT_DIR, manifestPath))}`);
  }

  if (options.clean && fs.existsSync(outDir)) {
    await fsp.rm(outDir, { recursive: true, force: true });
  }
  await fsp.mkdir(outDir, { recursive: true });

  const copySpecs = [
    { from: "background", to: "background" },
    { from: "ui/options", to: "options" },
    { from: "ui/delete-suggestion", to: "delete-suggestion" },
    { from: "vendor", to: "vendor" },
    { from: "assets/icons", to: "assets/icons" },
  ];

  for (const spec of copySpecs) {
    await copyDirectory(sourceDir, outDir, spec.from, spec.to);
  }
  await fsp.cp(localesDir, path.join(outDir, "_locales"), { recursive: true });

  let manifest;
  try {
    manifest = JSON.parse(await fsp.readFile(manifestPath, "utf8"));
  } catch (error) {
    fail(`manifest の読み込みに失敗しました: ${error.message}`);
  }
  const rewrittenManifest = rewriteManifest(manifest);
  await fsp.writeFile(
    path.join(outDir, "manifest.json"),
    `${JSON.stringify(rewrittenManifest, null, "\t")}\n`,
    "utf8"
  );

  console.log(`[build-extension] output: ${toPosixPath(path.relative(ROOT_DIR, outDir))}`);
  console.log("[build-extension] copied: background, options, delete-suggestion, vendor, assets/icons, _locales");
}

main().catch((error) => {
  fail(error.stack || error.message);
});
