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

/**
 * Whether `locator` is what the document actually hit-tests at its own center.
 *
 * `toBeVisible` cannot see occlusion: a popup rendered behind a modal is still visible, still has
 * a box, and still answers its own accessible name — it is simply painted under the surface that
 * owns the viewport. A nested overlay therefore has to be checked against the stack, not the
 * tree.
 */
export const isTopmost = (locator: Locator) =>
  locator.evaluate((element) => {
    const box = element.getBoundingClientRect();
    const top = document.elementFromPoint(box.left + box.width / 2, box.top + box.height / 2);
    return top === element || element.contains(top);
  });
