import { expect, test } from "./fixtures";

/*
 The showcase table of contents is presentation, so these assert its two layouts and its scrollspy
 contract rather than any pixel geometry. The showcase page carries a pre-existing CodeBlock
 hydration warning, so this spec makes no runtime-error claim.
*/

const DESKTOP = { width: 1800, height: 900 };
const NARROW = { width: 1280, height: 900 };

test("the wide layout keeps a gutter table of contents in sync with the reader", async ({ page }) => {
  await page.setViewportSize(DESKTOP);
  await page.goto("/");
  await page.waitForFunction(() => document.documentElement.dataset.hydrated === "true");

  const nav = page.getByRole("navigation", { name: "Showcase sections" });
  await expect(nav).toBeVisible();
  await expect(nav.getByRole("link")).toHaveCount(9);
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

test("the narrow layout replaces the gutter table of contents with a jump control", async ({ page }) => {
  await page.setViewportSize(NARROW);
  await page.goto("/");
  await page.waitForFunction(() => document.documentElement.dataset.hydrated === "true");

  await expect(page.getByRole("navigation", { name: "Showcase sections" })).toHaveCount(0);

  await page.getByRole("button", { name: "Jump to…" }).click();
  const nav = page.getByRole("navigation", { name: "Showcase sections" });
  await expect(nav.getByRole("link")).toHaveCount(9);

  await nav.getByRole("link", { name: "Surfaces" }).click();
  await expect(page).toHaveURL(/#surfaces$/);
  await expect(page.getByRole("button", { name: "Jump to…" })).toHaveAttribute("aria-expanded", "false");
});
