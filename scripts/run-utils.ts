import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

export function binPath(command: string, cwd = repoRoot): string {
  const suffix = process.platform === "win32" ? ".CMD" : "";
  return path.join(cwd, "node_modules", ".bin", command + suffix);
}

export function run(command: string, args: string[], options: { cwd?: string } = {}): void {
  const cwd = options.cwd || repoRoot;
  const result =
    process.platform === "win32"
      ? spawnSync("cmd.exe", ["/d", "/c", "call " + [command, ...args].map(quoteWindowsArg).join(" ")], {
          cwd,
          stdio: "inherit",
          windowsVerbatimArguments: true
        })
      : spawnSync(command, args, {
          cwd,
          stdio: "inherit"
        });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

function quoteWindowsArg(value: string): string {
  return `"${value.replace(/"/g, '""')}"`;
}
