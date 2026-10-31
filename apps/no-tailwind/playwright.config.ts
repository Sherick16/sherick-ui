import { defineConfig } from "@playwright/test";

/* `scripts/verify.mjs` passes a free port, so a server another checkout left on 4173 is never the
   one under test. A server already on that port is not reused: it is not this checkout's. */
const port = Number(process.env.BROWSER_TEST_PORT ?? 4173);

export default defineConfig({
  testDir: "./tests",
  timeout: 30_000,
  // Every test opens its own page in a fresh context.
  fullyParallel: true,
  workers: process.env.CI ? 2 : undefined,
  projects: [
    { name: "chromium", use: { browserName: "chromium" } },
    { name: "firefox", testMatch: /(?:hostile|v2-1|table)\.spec\.ts/, use: { browserName: "firefox" } },
    { name: "webkit", testMatch: /(?:hostile|v2-1|table)\.spec\.ts/, use: { browserName: "webkit", launchOptions: { executablePath: process.env.WEBKIT_EXECUTABLE_PATH } } },
  ],
  use: {
    baseURL: `http://127.0.0.1:${port}`,
    browserName: "chromium",
    viewport: { width: 1280, height: 900 },
    deviceScaleFactor: 1,
    locale: "en-US",
    reducedMotion: "reduce",
  },
  webServer: {
    command: `node node_modules/vite/bin/vite.js preview --host 127.0.0.1 --port ${port} --strictPort`,
    url: `http://127.0.0.1:${port}`,
    reuseExistingServer: !process.env.CI && !process.env.BROWSER_TEST_PORT,
    timeout: 60_000,
  },
});
