import { expect, test, type Page } from "./fixtures";

const setTheme = async (page: Page, theme: "light" | "dark") => {
  await page.evaluate((nextTheme) => {
    localStorage.setItem("sherick-ui-theme", nextTheme);
    document.documentElement.dataset.sherickTheme = nextTheme;
  }, theme);
};

for (const theme of ["light", "dark"] as const) {
  test(`core controls hydrate and match the ${theme} browser baseline`, async ({ page, errors }) => {

    await page.goto("/verification/core");
    await expect(page.getByTestId("verification-core")).toBeVisible();
    await expect(page.getByRole("button", { name: "Primary" })).toBeVisible();
    await expect(page.getByRole("dialog")).toHaveCount(0);

    await setTheme(page, theme);
    await expect(page).toHaveScreenshot(`core-${theme}.png`, { fullPage: true });

    expect(errors, `browser/runtime errors on the core ${theme} fixture`).toEqual([]);
  });

  test(`initially-open dialog hydrates and matches the ${theme} browser baseline`, async ({ page, errors }) => {

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

test("published component styles survive a host Tailwind reset", async ({ page, errors }) => {

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

test("showcase elevations and structural lines retain their design-language values", async ({ page, errors }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Design system showcase" })).toBeVisible();
  await setTheme(page, "dark");

  const raised = page.getByTestId("tile-raised");
  const recessed = page.getByTestId("tile-recessed");
  const floating = page.getByTestId("tile-floating");
  const columnHeader = page.getByText("Column header", { exact: true });

  for (const surface of [raised, recessed, floating]) {
    await expect(surface).toBeVisible();
    expect(await surface.evaluate((element) => getComputedStyle(element).boxShadow)).not.toBe("none");
  }

  // The expected value is read from the token itself, and asserted with an auto-retrying matcher:
  // a theme switch re-resolves every token at once, so a one-shot comparison can catch the
  // element mid-repaint and report a colour the page has already left behind.
  const expectedEdge = await page.evaluate(() => {
    const probe = document.createElement("div");
    probe.style.borderBottom = "1px solid oklch(var(--sui-edge) / 0.10)";
    document.body.appendChild(probe);
    const value = getComputedStyle(probe).borderBottomColor;
    probe.remove();
    return value;
  });

  await expect(columnHeader).toHaveCSS("border-bottom-color", expectedEdge);
  await expect(columnHeader).toHaveCSS("border-bottom-width", "1px");
});

test("Media keeps native semantics inside the Sherick frame", async ({ page }) => {
  await page.goto("/");
  const display = page.locator("#display");
  const image = display.locator("img").first();
  const videos = display.locator("video");
  const frame = videos.first().locator("..");
  await expect(image).toHaveAttribute("alt", "Warm living room with a sofa");
  await expect(image.locator("..")).toHaveCSS("overflow", "hidden");
  await expect(frame).toHaveCSS("overflow", "hidden");
  await expect(frame).not.toHaveCSS("border-radius", "0px");
  await expect(frame).not.toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
  await expect(videos.first()).toHaveCSS("object-fit", "contain");
  await expect(videos.nth(1)).toHaveCSS("object-fit", "cover");
  await expect(videos.nth(1).locator("..")).toHaveCSS("aspect-ratio", "16 / 9");
  await expect(videos.nth(2)).toHaveAttribute("aria-hidden", "true");
  await expect(videos.nth(2)).toHaveAttribute("tabindex", "-1");
  await expect(videos.nth(2)).not.toHaveAttribute("controls", "");
});
