import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import fs from "fs-extra";

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const repoRoot = path.resolve(packageRoot, "../..");

const assetDirs = ["skills", "packs", "generated"] as const;

export async function copyPackageAssets(): Promise<void> {
  for (const dir of assetDirs) {
    const source = path.join(repoRoot, dir);
    const destination = path.join(packageRoot, dir);
    if (!(await fs.pathExists(source))) {
      throw new Error("Missing package asset source: " + source);
    }
    await fs.remove(destination);
    await fs.copy(source, destination, {
      filter: (sourcePath) => !sourcePath.includes(`${path.sep}.gitkeep`)
    });
  }

  console.log("Copied CLI package assets: " + assetDirs.join(", "));
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await copyPackageAssets();
}
