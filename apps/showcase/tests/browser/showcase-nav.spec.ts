import { expect, test, type Locator, type Page } from "./fixtures";

/*
 The showcase table of contents is presentation, so these assert its two layouts and its scrollspy
 contract rather than any pixel geometry. The showcase page carries a pre-existing CodeBlock
 hydration warning, so this spec makes no runtime-error claim.
*/

const DESKTOP = { width: 1800, height: 900 };
const NARROW = { width: 1280, height: 900 };

/*
 The entries are rendered from the page's shared section list, so the contract worth testing is that
 every entry is a same-page anchor resolving to exactly one rendered section. The number of sections
 is deliberately not asserted — the list is free to grow or shrink.
*/
const expectEntriesTargetRealSections = async (page: Page, nav: Locator) => {
  const links = nav.getByRole("link");
  await expect(links.first()).toBeVisible();

  const hrefs = await links.evaluateAll((entries) => entries.map((entry) => entry.getAttribute("href")));
  expect(hrefs.length, "the navigation must list at least one section").toBeGreaterThan(0);

  for (const href of hrefs) {
    const target = href ?? "";
    expect(target, "every navigation entry must be a same-page anchor").toMatch(/^#[^#]+$/);
    await expect(page.locator(target), `${target} must resolve to one rendered section`).toHaveCount(1);
  }
};

test("the wide layout keeps a gutter table of contents in sync with the reader", async ({ page }) => {
  await page.setViewportSize(DESKTOP);
  await page.goto("/");
  await page.waitForFunction(() => document.documentElement.dataset.hydrated === "true");

  const nav = page.getByRole("navigation", { name: "Showcase sections" });
  await expect(nav).toBeVisible();
  await expectEntriesTargetRealSections(page, nav);
  await expect(page.getByRole("button", { name: "Jump to…" })).toHaveCount(0);

  // A native anchor carries the location in the URL, and the entry it landed on is current.
  await nav.getByRole("link", { name: "Fields" }).click();
  await expect(page).toHaveURL(/#fields$/);
  await expect(nav.getByRole("link", { name: "Fields" })).toHaveAttribute("aria-current", "location");
  await expect(nav.getByRole("link", { name: "Design language" })).not.toHaveAttribute(
    "aria-current",
    "location"
  );

  // The last section can never reach the scrollspy offset, so the end of the page has to mark it.
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await expect(nav.getByRole("link", { name: "Content" })).toHaveAttribute("aria-current", "location");
});

test("the narrow layout replaces the gutter table of contents with a sticky jump control", async ({ page }) => {
  await page.setViewportSize(NARROW);
  await page.goto("/");
  await page.waitForFunction(() => document.documentElement.dataset.hydrated === "true");

  await expect(page.getByRole("navigation", { name: "Showcase sections" })).toHaveCount(0);

  const trigger = page.getByRole("button", { name: "Jump to…" });
  await trigger.click();

  const nav = page.getByRole("navigation", { name: "Showcase sections" });
  await expectEntriesTargetRealSections(page, nav);

  await nav.getByRole("link", { name: "Display" }).click();
  await expect(page).toHaveURL(/#display$/);
  await expect(trigger).toHaveAttribute("aria-expanded", "false");

  // The control has to stay reachable once the reader scrolls past it.
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await expect(trigger).toBeInViewport();
});
