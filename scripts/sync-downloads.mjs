/**
 * Copy release installers from the FORGE desktop repo into public/downloads/.
 * Usage: node scripts/sync-downloads.mjs [path-to-release-version-dir]
 *
 * Default source: ../PROMPT ENG v2.0/release/1.1.1
 */
import { cpSync, existsSync, mkdirSync, readdirSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, "..");
const defaultReleaseDir = resolve(repoRoot, "..", "PROMPT ENG v2.0", "release", "1.1.1");
const releaseDir = resolve(process.argv[2] ?? defaultReleaseDir);
const publicDownloads = join(repoRoot, "public", "downloads");
const rootDownloads = join(repoRoot, "downloads");

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

copyTree(releaseDir, publicDownloads);

const previousSrc = join(rootDownloads, "previous-releases");
const previousDest = join(publicDownloads, "previous-releases");
if (existsSync(previousSrc)) {
  copyTree(previousSrc, previousDest);
}

console.log(`Synced installers to ${publicDownloads}`);
