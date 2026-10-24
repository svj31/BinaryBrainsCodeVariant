import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "tests",
  timeout: 45_000,
  use: {
    baseURL: process.env.BASE_URL ?? "http://localhost:3100",
    viewport: { width: 1280, height: 1500 },
    launchOptions: { args: ["--use-gl=swiftshader", "--enable-webgl", "--ignore-gpu-blocklist"] },
  },
  webServer: process.env.BASE_URL
    ? undefined
    : { command: "npm run build && npx next start -p 3100", url: "http://localhost:3100", reuseExistingServer: true, timeout: 240_000 },
});
