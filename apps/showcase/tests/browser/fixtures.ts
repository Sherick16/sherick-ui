import { expect, test as base, type Locator, type Page } from "@playwright/test";

/**
 * Browser suite fixture.
 *
 * `errors` collects page errors and error-level console output. It is installed as a fixture rather
 * than called inside a test, because a fixture's setup runs before `beforeEach`: collecting from
 * inside a test body misses everything the first navigation emits, which is where a hydration
 * failure or a broken import actually shows up.
 */
export const test = base.extend<{ errors: string[] }>({
  errors: async ({ page }, use) => {
    const errors: string[] = [];

    page.on("pageerror", (error) => errors.push(`pageerror: ${error.message}`));
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(`console: ${message.text()}`);
    });

    // eslint-disable-next-line react-hooks/rules-of-hooks -- Playwright's fixture API names its continuation `use`.
    await use(errors);
  },
});

export { expect };
export type { Locator, Page };
