import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { copyPackageAssets } from "./copy-assets";

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const tsupBin = path.join(packageRoot, "node_modules", ".bin", process.platform === "win32" ? "tsup.CMD" : "tsup");

const result = spawnSync(tsupBin, {
  cwd: packageRoot,
  stdio: "inherit",
  shell: process.platform === "win32"
});

if (result.status !== 0) {
  process.exit(result.status ?? 1);
}

await copyPackageAssets();
