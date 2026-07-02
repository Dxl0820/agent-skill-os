import { binPath, repoRoot, run } from "./run-utils";

run(binPath("tsc"), ["-p", "packages/core/tsconfig.json"], { cwd: repoRoot });
run(binPath("tsx"), ["scripts/validate-skills.ts"], { cwd: repoRoot });
run(binPath("tsx"), ["scripts/check-demo.ts"], { cwd: repoRoot });
