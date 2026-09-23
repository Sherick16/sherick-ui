import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/browser",
  timeout: 30_000,
  fullyParallel: false,
  workers: process.env.CI ? 2 : 1,
  expect: {
    timeout: 5_000,
    toHaveScreenshot: {
      animations: "disabled",
      maxDiffPixelRatio: 0.002,
    },
  },
  use: {
    baseURL: "http://127.0.0.1:3100",
    browserName: "chromium",
    viewport: { width: 1280, height: 900 },
    deviceScaleFactor: 1,
    locale: "en-US",
    reducedMotion: "reduce",
  },
  webServer: {
    command: "bunx next start -p 3100",
    url: "http://127.0.0.1:3100/verification/core",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
