import { binPath, repoRoot, run } from "./run-utils";

run(binPath("tsc"), ["-p", "packages/core/tsconfig.json"], { cwd: repoRoot });
