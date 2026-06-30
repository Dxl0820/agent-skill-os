import path from "node:path";
import { fileURLToPath } from "node:url";
import fs from "node:fs/promises";
import { buildRegistry } from "@agent-skill-os/core";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const registry = await buildRegistry({ rootDir });
await fs.mkdir(path.join(rootDir, "generated"), { recursive: true });
await fs.writeFile(path.join(rootDir, "generated", "registry.generated.json"), JSON.stringify(registry, null, 2) + "\n", "utf8");
console.log("Generated registry with " + registry.skills.length + " skills and " + registry.packs.length + " packs.");
