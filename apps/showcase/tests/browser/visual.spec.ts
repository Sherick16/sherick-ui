import { expect, test, type Page } from "@playwright/test";

const trackRuntimeErrors = (page: Page) => {
  const errors: string[] = [];

  page.on("pageerror", (error) => errors.push(`pageerror: ${error.message}`));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(`console: ${message.text()}`);
  });

  return errors;
};

const setTheme = async (page: Page, theme: "light" | "dark") => {
  await page.evaluate((nextTheme) => {
    localStorage.setItem("sherick-ui-theme", nextTheme);
    document.documentElement.dataset.sherickTheme = nextTheme;
  }, theme);
};

for (const theme of ["light", "dark"] as const) {
  test(`core controls hydrate and match the ${theme} browser baseline`, async ({ page }) => {
    const errors = trackRuntimeErrors(page);

    await page.goto("/verification/core");
    await expect(page.getByTestId("verification-core")).toBeVisible();
    await expect(page.getByRole("button", { name: "Primary" })).toBeVisible();
    await expect(page.getByRole("dialog")).toHaveCount(0);

    await setTheme(page, theme);
    await expect(page).toHaveScreenshot(`core-${theme}.png`, { fullPage: true });

    expect(errors, `browser/runtime errors on the core ${theme} fixture`).toEqual([]);
  });

  test(`initially-open dialog hydrates and matches the ${theme} browser baseline`, async ({ page }) => {
    const errors = trackRuntimeErrors(page);

    await page.goto("/verification/dialog");
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(page.getByRole("heading", { name: "Published package dialog" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Close dialog" })).toBeVisible();

    await setTheme(page, theme);
    await expect(page).toHaveScreenshot(`dialog-${theme}.png`, { fullPage: true });

    expect(errors, `browser/runtime errors on the initially-open ${theme} dialog fixture`).toEqual([]);
  });
}

test("published component styles survive a host Tailwind reset", async ({ page }) => {
  const errors = trackRuntimeErrors(page);

  await page.goto("/verification/core");
  await setTheme(page, "dark");

  const primary = page.getByRole("button", { name: "Primary" });
  const tonal = page.getByRole("button", { name: "Tonal" });
  const switchControl = page.getByRole("switch", { name: "Enabled" });
  const switchTrack = switchControl.locator(".shadow-sherick-recessed").first();
  const switchThumb = switchControl.locator(".shadow-sherick-control").first();

  await expect(primary).toBeVisible();
  await expect(tonal).toBeVisible();
  await expect(switchTrack).toBeVisible();
  await expect(switchThumb).toBeVisible();

  const styles = await Promise.all([
    primary.evaluate((element) => getComputedStyle(element).backgroundColor),
    tonal.evaluate((element) => getComputedStyle(element).backgroundColor),
    tonal.evaluate((element) => getComputedStyle(element).boxShadow),
    switchTrack.evaluate((element) => getComputedStyle(element).boxShadow),
    switchThumb.evaluate((element) => getComputedStyle(element).boxShadow),
  ]);

  const [primaryBackground, tonalBackground, tonalShadow, trackShadow, thumbShadow] = styles;

  expect(primaryBackground).not.toBe("rgba(0, 0, 0, 0)");
  expect(tonalBackground).not.toBe("rgba(0, 0, 0, 0)");
  expect(tonalShadow).not.toBe("none");
  expect(trackShadow).not.toBe("none");
  expect(trackShadow).toContain("inset");
  expect(thumbShadow).not.toBe("none");

  expect(errors, "host Tailwind compatibility fixture produced runtime errors").toEqual([]);
});
