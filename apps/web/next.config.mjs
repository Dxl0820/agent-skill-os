import path from "node:path";
import { fileURLToPath } from "node:url";
import createNextIntlPlugin from "next-intl/plugin";

const appDir = path.dirname(fileURLToPath(import.meta.url));
const withNextIntl = createNextIntlPlugin();

const nextConfig = {
  transpilePackages: ["@agent-skill-os/core"],
  turbopack: {
    root: path.resolve(appDir, "../..")
  }
};

export default withNextIntl(nextConfig);
