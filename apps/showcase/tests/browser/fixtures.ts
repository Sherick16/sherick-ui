import AxeScan from "@axe-core/playwright";
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
 * The suite's axe scan. Every rule still runs and every violation is reported in full; two settings
 * drop only work that no test reads:
 * - a passing rule lists one example node, not every node it matched;
 * - a page with no child frame runs `axe.run` in place. The default flow runs `axe.runPartial`,
 *   copies every partial result into a second, blank page and finishes there, so that it can reach
 *   cross-origin frames. With one frame it returns the same results at about a third of the cost,
 *   and a page that embeds a frame keeps the default flow.
 */
export class AxeBuilder extends AxeScan {
  readonly #page: Page;

  constructor({ page }: { page: Page }) {
    super({ page });
    this.#page = page;
    super.options({ resultTypes: ["violations"] });
  }

  options(options: Parameters<AxeScan["options"]>[0]) {
    return super.options({ resultTypes: ["violations"], ...options });
  }

  analyze() {
    this.setLegacyMode(this.#page.frames().length === 1);
    return super.analyze();
  }
}

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
