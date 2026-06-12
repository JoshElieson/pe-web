/**
 * Copy release installers from the FORGE desktop repo into public/downloads/.
 * Usage: node scripts/sync-downloads.mjs [path-to-release-version-dir] [publish-version]
 *
 * Default source: ../PROMPT ENG v2.0/release/1.1.1
 * Default publish version: 1.1.2 (renames FORGE_1.1.1_* installers on copy)
 */
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, "..");
const defaultReleaseDir = resolve(repoRoot, "..", "PROMPT ENG v2.0", "release", "1.1.1");
const releaseDir = resolve(process.argv[2] ?? defaultReleaseDir);
const publishVersion = process.argv[3] ?? "1.1.2";
const sourceVersion = basename(releaseDir);
const publicDownloads = join(repoRoot, "public", "downloads");
const rootDownloads = join(repoRoot, "downloads");

function mapFilename(name) {
  if (sourceVersion === publishVersion) return name;
  return name.replace(`_${sourceVersion}_`, `_${publishVersion}_`);
}

function copyRelease(src, dest) {
  if (!existsSync(src)) {
    throw new Error(`Missing source directory: ${src}`);
  }
  mkdirSync(dest, { recursive: true });
  for (const entry of readdirSync(src)) {
    const from = join(src, entry);
    if (statSync(from).isDirectory()) continue;

    const mappedName = mapFilename(entry);
    const to = join(dest, mappedName);

    if (entry === "SHA256SUMS.txt") {
      const sums = readFileSync(from, "utf8").replaceAll(`_${sourceVersion}_`, `_${publishVersion}_`);
      writeFileSync(to, sums, "utf8");
    } else {
      cpSync(from, to);
    }
  }
}

function copyTree(src, dest) {
  if (!existsSync(src)) {
    throw new Error(`Missing source directory: ${src}`);
  }
  mkdirSync(dest, { recursive: true });
  for (const entry of readdirSync(src)) {
    const from = join(src, entry);
    const to = join(dest, entry);
    if (statSync(from).isDirectory()) {
      copyTree(from, to);
    } else {
      cpSync(from, to);
    }
  }
}

if (!existsSync(releaseDir)) {
  console.error(`Release directory not found: ${releaseDir}`);
  process.exit(1);
}

copyRelease(releaseDir, publicDownloads);
copyRelease(releaseDir, rootDownloads);

const previousSrc = join(rootDownloads, "previous-releases");
const previousDest = join(publicDownloads, "previous-releases");
if (existsSync(previousSrc)) {
  copyTree(previousSrc, previousDest);
}

console.log(`Synced ${sourceVersion} installers as v${publishVersion} to ${publicDownloads}`);
