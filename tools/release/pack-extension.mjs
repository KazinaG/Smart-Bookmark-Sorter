#!/usr/bin/env node

import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";
import { spawnSync } from "node:child_process";

const ROOT_DIR = process.cwd();

function fail(message) {
  console.error(`[pack-extension] ${message}`);
  process.exit(1);
}

function toPosixPath(value) {
  return value.split(path.sep).join("/");
}

function normalizeRelativePath(value) {
  return path.posix.normalize(String(value).replace(/\\/g, "/"));
}

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

function* walkFiles(baseDirAbsolute) {
  const stack = [baseDirAbsolute];
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
      yield toPosixPath(path.relative(baseDirAbsolute, entryPath));
    }
  }
}

function parseArgs(argv) {
  const options = {
    inputDir: "build/extension",
    outDir: "dist/release",
    skipVerify: false,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (token === "--input-dir") {
      const next = argv[i + 1];
      if (!next) {
        fail("--input-dir には値が必要です。");
      }
      options.inputDir = next;
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
    if (token === "--skip-verify") {
      options.skipVerify = true;
      continue;
    }
    if (token === "--help" || token === "-h") {
      console.log("Usage: node tools/release/pack-extension.mjs [options]");
      console.log("");
      console.log("Options:");
      console.log("  --input-dir <path>   zip 化対象 (default: build/extension)");
      console.log("  --out-dir <path>     出力先 (default: dist/release)");
      console.log("  --skip-verify        事前 verify を省略する");
      process.exit(0);
    }
    fail(`不明な引数です: ${token}`);
  }

  return options;
}

function runVerify(relativeInputDir) {
  const verifyScript = path.join(ROOT_DIR, "tools/release/verify-extension-layout.mjs");
  const verifyResult = spawnSync(process.execPath, [verifyScript, "--dir", relativeInputDir], {
    cwd: ROOT_DIR,
    stdio: "inherit",
  });
  if (verifyResult.error) {
    fail(`verify 実行に失敗しました: ${verifyResult.error.message}`);
  }
  if (verifyResult.status !== 0) {
    fail(`verify が失敗しました (exit: ${verifyResult.status})`);
  }
}

function runZip(inputAbsolute, zipAbsolute) {
  const zipResult = spawnSync("zip", ["-q", "-r", zipAbsolute, "."], {
    cwd: inputAbsolute,
    stdio: "inherit",
  });
  if (zipResult.error && zipResult.error.code === "ENOENT") {
    const pythonResult = spawnSync("python3", ["-m", "zipfile", "-c", zipAbsolute, "."], {
      cwd: inputAbsolute,
      stdio: "inherit",
    });
    if (pythonResult.error) {
      if (pythonResult.error.code === "ENOENT") {
        fail("zip と python3 の両方が見つかりません。");
      }
      fail(`python3 zip 実行に失敗しました: ${pythonResult.error.message}`);
    }
    if (pythonResult.status !== 0) {
      fail(`python3 zip 実行に失敗しました (exit: ${pythonResult.status})`);
    }
    return;
  }
  if (zipResult.error) {
    fail(`zip 実行に失敗しました: ${zipResult.error.message}`);
  }
  if (zipResult.status !== 0) {
    fail(`zip 実行に失敗しました (exit: ${zipResult.status})`);
  }
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const inputRelative = normalizeRelativePath(options.inputDir);
  const outRelative = normalizeRelativePath(options.outDir);

  const inputAbsolute = path.resolve(ROOT_DIR, inputRelative);
  const outAbsolute = path.resolve(ROOT_DIR, outRelative);
  const manifestPath = path.join(inputAbsolute, "manifest.json");

  if (!fs.existsSync(inputAbsolute) || !fs.statSync(inputAbsolute).isDirectory()) {
    fail(`input-dir が見つかりません: ${inputRelative}`);
  }
  if (!fs.existsSync(manifestPath) || !fs.statSync(manifestPath).isFile()) {
    fail(`manifest が見つかりません: ${toPosixPath(path.relative(ROOT_DIR, manifestPath))}`);
  }

  if (!options.skipVerify) {
    runVerify(inputRelative);
  }

  let manifest;
  try {
    manifest = JSON.parse(await fsp.readFile(manifestPath, "utf8"));
  } catch (error) {
    fail(`manifest の読み込みに失敗しました: ${error.message}`);
  }

  await fsp.mkdir(outAbsolute, { recursive: true });
  const baseName = `${slugify(manifest.name || "extension")}-v${manifest.version || "0.0.0"}-extension`;
  const zipAbsolute = path.join(outAbsolute, `${baseName}.zip`);
  const listAbsolute = path.join(outAbsolute, `${baseName}.files.txt`);

  if (fs.existsSync(zipAbsolute)) {
    await fsp.rm(zipAbsolute, { force: true });
  }

  const files = [...walkFiles(inputAbsolute)].sort();
  await fsp.writeFile(listAbsolute, `${files.join("\n")}\n`, "utf8");
  runZip(inputAbsolute, zipAbsolute);

  console.log(`[pack-extension] zip: ${toPosixPath(path.relative(ROOT_DIR, zipAbsolute))}`);
  console.log(`[pack-extension] list: ${toPosixPath(path.relative(ROOT_DIR, listAbsolute))}`);
  console.log(`[pack-extension] files: ${files.length}`);
}

main().catch((error) => {
  fail(error.stack || error.message);
});
