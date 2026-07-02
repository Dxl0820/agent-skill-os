import fs from "node:fs/promises";
import path from "node:path";

const demoPath = path.resolve("assets/demo.gif");
const bytes = await fs.readFile(demoPath);
const header = bytes.subarray(0, 6).toString("ascii");
const width = bytes.readUInt16LE(6);
const height = bytes.readUInt16LE(8);
const ascii = bytes.toString("ascii");

const errors: string[] = [];
if (header !== "GIF89a" && header !== "GIF87a") {
  errors.push("assets/demo.gif must be a GIF file");
}
if (width !== 960 || height !== 520) {
  errors.push(`assets/demo.gif must be 960x520, got ${width}x${height}`);
}
if (bytes.length < 10_000) {
  errors.push("assets/demo.gif is unexpectedly small and may be a placeholder");
}
if (bytes.length > 5_000_000) {
  errors.push("assets/demo.gif should stay under 5MB for README loading");
}
if (ascii.includes("[32m") || ascii.includes("[39m") || ascii.includes("\\x1b") || bytes.includes(Buffer.from([0x1b, 0x5b]))) {
  errors.push("assets/demo.gif appears to contain visible ANSI control artifacts");
}

if (errors.length > 0) {
  for (const error of errors) {
    console.error("- " + error);
  }
  process.exit(1);
}

console.log(`Demo GIF OK: ${width}x${height}, ${bytes.length} bytes.`);
