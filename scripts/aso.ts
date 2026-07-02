import { binPath, repoRoot, run } from "./run-utils";

run(binPath("tsc"), ["-p", "packages/core/tsconfig.json"], { cwd: repoRoot });
run(binPath("tsx"), ["packages/cli/src/index.ts", ...process.argv.slice(2)], { cwd: repoRoot });
