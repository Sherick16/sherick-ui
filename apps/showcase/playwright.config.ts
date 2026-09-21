import { defineConfig } from "@playwright/test";

/* Focused iteration may target an already-running `next dev` server (the root `bun run dev` script
   serves it on :3000) by setting `PLAYWRIGHT_BASE_URL`. The default path still builds and serves
   the production showcase, which is the release gate. */
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:3100";
const externalServer = Boolean(process.env.PLAYWRIGHT_BASE_URL);

export default defineConfig({
  testDir: "./tests/browser",
  timeout: 30_000,
  fullyParallel: false,
  workers: 1,
  expect: {
    timeout: 5_000,
    toHaveScreenshot: {
      animations: "disabled",
      maxDiffPixelRatio: 0.002,
    },
  },
  use: {
    baseURL,
    browserName: "chromium",
    viewport: { width: 1280, height: 900 },
    deviceScaleFactor: 1,
    locale: "en-US",
    reducedMotion: "reduce",
  },
  ...(externalServer
    ? {}
    : {
        webServer: {
          command: "bunx next start -p 3100",
          url: "http://127.0.0.1:3100/verification/core",
          reuseExistingServer: !process.env.CI,
          timeout: 120_000,
        },
      }),
});
