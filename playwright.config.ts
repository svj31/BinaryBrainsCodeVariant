import { defineConfig, devices } from "@playwright/test";

const gl = { launchOptions: { args: ["--use-gl=swiftshader", "--enable-webgl", "--ignore-gpu-blocklist"] } };

export default defineConfig({
  testDir: "tests",
  timeout: 60_000,
  use: { baseURL: process.env.BASE_URL ?? "http://localhost:3100" },
  projects: [
    // full functional suite
    { name: "chrome-desktop", testMatch: /e2e\.spec/, use: { ...devices["Desktop Chrome"], viewport: { width: 1280, height: 1500 }, ...gl } },
    // cross-browser and cross-device smoke
    { name: "chrome", testMatch: /devices\.spec/, use: { ...devices["Desktop Chrome"], ...gl } },
    { name: "firefox", testMatch: /devices\.spec/, use: { ...devices["Desktop Firefox"] } },
    { name: "safari", testMatch: /devices\.spec/, use: { ...devices["Desktop Safari"] } },
    { name: "android-phone", testMatch: /devices\.spec/, use: { ...devices["Pixel 7"], ...gl } },
    { name: "iphone", testMatch: /devices\.spec/, use: { ...devices["iPhone 14"] } },
    { name: "ipad", testMatch: /devices\.spec/, use: { ...devices["iPad (gen 7)"] } },
  ],
  webServer: process.env.BASE_URL
    ? undefined
    : { command: "npm run build && npx next start -p 3100", url: "http://localhost:3100", reuseExistingServer: true, timeout: 240_000 },
});
