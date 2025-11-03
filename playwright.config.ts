import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  timeout: 30000,
  retries: process.env.CI ? 2 : 1,
  workers: process.env.CI ? 1 : 2,
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  reporter: "html",

  use: {
    baseURL: "http://localhost:3001",
    viewport: { width: 1280, height: 720 },
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    // Tạm thời disable firefox và webkit
    // {
    //   name: "firefox",
    //   use: { ...devices["Desktop Firefox"] },
    // },
    // {
    //   name: "webkit",
    //   use: { ...devices["Desktop Safari"] },
    // },
  ],

  webServer: {
    command: process.env.CI ? "pnpm build && pnpm start" : "pnpm dev",
    port: 3001,
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
