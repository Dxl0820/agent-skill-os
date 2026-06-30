import path from "node:path";
import { fileURLToPath } from "node:url";
import fs from "fs-extra";

export function toPosixPath(value: string): string {
  return value.split(path.sep).join("/");
}

export function findWorkspaceRoot(startDir = process.cwd()): string {
  const candidates: string[] = [];
  let current = path.resolve(startDir);
  while (true) {
    candidates.push(current);
    const parent = path.dirname(current);
    if (parent === current) {
      break;
    }
    current = parent;
  }
  const moduleDir = path.dirname(fileURLToPath(import.meta.url));
  candidates.push(path.resolve(moduleDir, "../../.."));
  candidates.push(path.resolve(moduleDir, "../../../.."));
  for (const candidate of candidates) {
    if (fs.existsSync(path.join(candidate, "skills")) && fs.existsSync(path.join(candidate, "packs"))) {
      return candidate;
    }
  }
  return process.cwd();
}
