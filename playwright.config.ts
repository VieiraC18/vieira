import { defineConfig, devices } from "@playwright/test";
import { randomBytes } from "node:crypto";

// Credentials are generated for an isolated local test database, never production.
process.env.TEST_ADMIN_EMAIL ||= "test-admin@vieira.invalid";
process.env.TEST_ADMIN_PASSWORD ||= randomBytes(24).toString("base64url");

export default defineConfig({
  testDir: "./tests",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 90_000,
  expect: { timeout: 15_000 },
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    ...devices["Desktop Chrome"],
    baseURL: "http://127.0.0.1:3100",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  webServer: {
    command: "npx tsx scripts/test-server.ts",
    url: "http://127.0.0.1:3100/admin/login",
    reuseExistingServer: false,
    timeout: 180_000,
    gracefulShutdown: { signal: "SIGTERM", timeout: 5000 },
  },
});
