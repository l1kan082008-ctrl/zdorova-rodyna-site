import vinext from "vinext";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { defineConfig } from "vite";
import { sites } from "./build/sites-vite-plugin.ts";

// macOS Seatbelt blocks FSEvents, so Codex previews need polling for HMR.
const isCodexSeatbeltSandbox = process.env.CODEX_SANDBOX === "seatbelt";

function readLocalAdminVars(): Record<string, string> {
  try {
    const values = Object.fromEntries(
      readFileSync(resolve(process.cwd(), ".dev.vars"), "utf8")
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter((line) => line && !line.startsWith("#"))
        .map((line) => {
          const separator = line.indexOf("=");
          const key = line.slice(0, separator).trim();
          const value = line
            .slice(separator + 1)
            .trim()
            .replace(/^(["'])(.*)\1$/, "$2");

          return [key, value];
        }),
    );

    const localVars: Record<string, string> = {};
    if (values.ADMIN_PASSWORD_HASH) localVars.ADMIN_PASSWORD_HASH = values.ADMIN_PASSWORD_HASH;
    if (values.ADMIN_SESSION_SECRET) localVars.ADMIN_SESSION_SECRET = values.ADMIN_SESSION_SECRET;
    return localVars;
  } catch {
    return {};
  }
}

export default defineConfig(async ({ command }) => {
  // Keep Wrangler and Miniflare state project-local. These are non-secret tool
  // settings; application environment belongs in ignored `.env*` files.
  process.env.WRANGLER_WRITE_LOGS ??= "false";
  process.env.WRANGLER_LOG_PATH ??= ".wrangler/logs";
  process.env.MINIFLARE_REGISTRY_PATH ??= ".wrangler/registry";

  // Wrangler snapshots its log path while the Cloudflare plugin is imported.
  const { cloudflare } = await import("@cloudflare/vite-plugin");
  const localBindingConfig = {
    // `.dev.vars` is ignored by Git and is only injected into the local dev
    // worker. Production secrets remain managed by Cloudflare.
    ...(command === "serve" ? { vars: readLocalAdminVars() } : {}),
  };

  return {
    server: {
      allowedHosts: [".lhr.life", ".ngrok-free.dev"],
      ...(isCodexSeatbeltSandbox
        ? { watch: { useFsEvents: false, usePolling: true } }
        : {}),
    },
    plugins: [
      vinext(),
      sites(),
      cloudflare({
        viteEnvironment: { name: "rsc", childEnvironments: ["ssr"] },
        config: localBindingConfig,
      }),
    ],
  };
});
