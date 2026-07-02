import path from "node:path";
import { binPath, repoRoot, run } from "./run-utils";

const coreRoot = path.join(repoRoot, "packages/core");
const cliRoot = path.join(repoRoot, "packages/cli");
const vitestBin = path.join(repoRoot, "node_modules/.bin", process.platform === "win32" ? "vitest.CMD" : "vitest");

run(binPath("tsc"), ["-p", "packages/core/tsconfig.json"], { cwd: repoRoot });
run(vitestBin, ["run"], { cwd: coreRoot });
run(vitestBin, ["run"], { cwd: cliRoot });
