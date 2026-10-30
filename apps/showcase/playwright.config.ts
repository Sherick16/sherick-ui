import { defineConfig, devices } from "@playwright/test";

/* `scripts/verify.mjs` passes a free port, so a server another checkout left on 3100 is never the
   one under test. A server already on that port is not reused: it is not this checkout's. */
const port = Number(process.env.BROWSER_TEST_PORT ?? 3100);

/* Three projects, selected by tag rather than by file, so one spec can carry a check that only a
   given engine or input model can make:
   - `chromium` runs everything that is not tagged `@touch` or `@webkit`: the desktop pointer suite,
     every screenshot, and the 375px and forced-colours axe matrix.
   - `touch` runs the `@touch` tests under Pixel 7 emulation, with a touch-capable pointer and no
     hover. Hover is not a property Playwright exposes as an option, so the tests set it through
     the DevTools media override; see `tests/browser/motion.spec.ts`.
   - `webkit` runs the `@webkit` tests in WebKit, because an engine-level accessibility result is
     the one a single Chromium pass cannot show. Its axe scan is the only WebKit run. */
export default defineConfig({
  testDir: "./tests/browser",
  /* Screenshot baselines are named without the project, so the reviewed baselines recorded before
     the projects existed stay the ones every run compares against. Only `chromium` takes
     screenshots. */
  snapshotPathTemplate: "{testDir}/{testFilePath}-snapshots/{arg}-{platform}{ext}",
  timeout: 30_000,
  /* Every test opens its own page in a fresh context, so the runner spreads single tests, not whole
     files, across the workers; the long specs no longer finish last on one worker. */
  fullyParallel: true,
  workers: process.env.CI ? 2 : undefined,
  expect: {
    timeout: 5_000,
    toHaveScreenshot: {
      animations: "disabled",
      maxDiffPixelRatio: 0.002,
    },
  },
  use: {
    baseURL: `http://127.0.0.1:${port}`,
    browserName: "chromium",
    viewport: { width: 1280, height: 900 },
    deviceScaleFactor: 1,
    locale: "en-US",
    reducedMotion: "reduce",
  },
  projects: [
    {
      name: "chromium",
      grepInvert: /@touch|@webkit/,
    },
    {
      name: "touch",
      grep: /@touch/,
      use: { ...devices["Pixel 7"] },
    },
    {
      name: "webkit",
      grep: /@webkit/,
      use: { browserName: "webkit" },
    },
  ],
  webServer: {
    command: `node node_modules/next/dist/bin/next start -p ${port}`,
    url: `http://127.0.0.1:${port}/verification/core`,
    reuseExistingServer: !process.env.CI && !process.env.BROWSER_TEST_PORT,
    timeout: 120_000,
  },
});
