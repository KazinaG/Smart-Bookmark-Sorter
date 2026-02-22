#!/usr/bin/env node

import path from "node:path";
import { spawnSync } from "node:child_process";

const ROOT_DIR = process.cwd();

function fail(message) {
  console.error(`[release-prepare] ${message}`);
  process.exit(1);
}

function normalizeRelativePath(value) {
  return path.posix.normalize(String(value).replace(/\\/g, "/"));
}

function parseArgs(argv) {
  const options = {
    tag: null,
    buildOutDir: "build/extension",
    releaseOutDir: "dist/release",
    keepOld: false,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (token === "--tag") {
      const next = argv[i + 1];
      if (!next) {
        fail("--tag には値が必要です。");
      }
      options.tag = String(next).trim();
      i += 1;
      continue;
    }
    if (token === "--build-out-dir") {
      const next = argv[i + 1];
      if (!next) {
        fail("--build-out-dir には値が必要です。");
      }
      options.buildOutDir = next;
      i += 1;
      continue;
    }
    if (token === "--release-out-dir") {
      const next = argv[i + 1];
      if (!next) {
        fail("--release-out-dir には値が必要です。");
      }
      options.releaseOutDir = next;
      i += 1;
      continue;
    }
    if (token === "--keep-old") {
      options.keepOld = true;
      continue;
    }
    if (token === "--help" || token === "-h") {
      console.log("Usage: node tools/release/release-prepare.mjs --tag vX.Y.Z [options]");
      console.log("");
      console.log("Options:");
      console.log("  --tag <tag>              期待するタグ (例: v2.4.5)");
      console.log("  --build-out-dir <path>   build 出力先 (default: build/extension)");
      console.log("  --release-out-dir <path> release 出力先 (default: dist/release)");
      console.log("  --keep-old               既存の release 成果物を保持する");
      process.exit(0);
    }
    fail(`不明な引数です: ${token}`);
  }

  if (!options.tag) {
    fail("--tag は必須です。");
  }
  if (!options.tag.startsWith("v")) {
    fail(`--tag は v で始めてください: ${options.tag}`);
  }

  options.buildOutDir = normalizeRelativePath(options.buildOutDir);
  options.releaseOutDir = normalizeRelativePath(options.releaseOutDir);
  return options;
}

function runNodeScript(label, scriptRelativePath, args) {
  const scriptAbsolutePath = path.join(ROOT_DIR, scriptRelativePath);
  const result = spawnSync(process.execPath, [scriptAbsolutePath, ...args], {
    cwd: ROOT_DIR,
    stdio: "inherit",
  });

  if (result.error) {
    fail(`${label} 実行に失敗しました: ${result.error.message}`);
  }
  if (result.status !== 0) {
    fail(`${label} が失敗しました (exit: ${result.status})`);
  }
}

function main() {
  const options = parseArgs(process.argv.slice(2));

  runNodeScript("build-extension", "tools/release/build-extension.mjs", ["--out-dir", options.buildOutDir]);
  runNodeScript("verify-extension-layout", "tools/release/verify-extension-layout.mjs", ["--dir", options.buildOutDir]);

  const packArgs = [
    "--input-dir",
    options.buildOutDir,
    "--out-dir",
    options.releaseOutDir,
    "--expected-tag",
    options.tag,
    "--skip-verify",
  ];
  if (options.keepOld) {
    packArgs.push("--keep-old");
  }

  runNodeScript("pack-extension", "tools/release/pack-extension.mjs", packArgs);

  console.log(`[release-prepare] done: ${options.tag}`);
  console.log(`[release-prepare] build-dir: ${options.buildOutDir}`);
  console.log(`[release-prepare] release-dir: ${options.releaseOutDir}`);
}

main();
