import { cpSync, existsSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const src = join(repoRoot, "public", "downloads");
const dest = join(repoRoot, "dist", "downloads");

if (!existsSync(src)) {
  console.error(`Missing installer source directory: ${src}`);
  process.exit(1);
}

const srcInstallers = readdirSync(src).filter((name) => name.endsWith(".exe") || name.endsWith(".msi"));
if (srcInstallers.length === 0) {
  console.error("No Windows installers found in public/downloads");
  process.exit(1);
}

const destHasInstallers =
  existsSync(dest) &&
  readdirSync(dest).some((name) => name.endsWith(".exe") || name.endsWith(".msi"));

if (!destHasInstallers) {
  cpSync(src, dest, { recursive: true });
}

const copiedInstallers = readdirSync(dest).filter((name) => name.endsWith(".exe") || name.endsWith(".msi"));
if (copiedInstallers.length === 0) {
  console.error(`Installers missing from build output: ${dest}`);
  process.exit(1);
}

console.log(`Verified ${copiedInstallers.length} current-release installer(s) in dist/downloads`);
