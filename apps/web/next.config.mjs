import path from "node:path";
import { fileURLToPath } from "node:url";

const appDir = path.dirname(fileURLToPath(import.meta.url));

const nextConfig = {
  output: "export",
  transpilePackages: ["@agent-skill-os/core"],
  turbopack: {
    root: path.resolve(appDir, "../..")
  }
};

export default nextConfig;
