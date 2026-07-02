import path from "node:path";
import { binPath, repoRoot, run } from "./run-utils";

run(binPath("tsc"), ["-p", "packages/core/tsconfig.json"], { cwd: repoRoot });
run(binPath("tsx"), ["scripts/build-registry.ts"], { cwd: repoRoot });
run(binPath("tsx"), ["packages/cli/scripts/build.ts"], { cwd: repoRoot });
run(path.join(repoRoot, "apps/web/node_modules/.bin", process.platform === "win32" ? "next.CMD" : "next"), ["build"], {
  cwd: path.join(repoRoot, "apps/web")
});
