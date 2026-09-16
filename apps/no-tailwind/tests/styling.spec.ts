import { expect, test, type Page } from "@playwright/test";

const runtimeErrors = (page: Page) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(`pageerror: ${error.message}`));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(`console: ${message.text()}`);
  });
  return errors;
};

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await expect(page.getByTestId("no-tailwind-ready")).toBeVisible();
});

test("package CSS styles Sherick components but does not leak generic utilities", async ({ page }) => {
  const errors = runtimeErrors(page);

  const sentinel = page.getByTestId("css-leak-sentinel");
  const sentinelStyle = await sentinel.evaluate((element) => {
    const style = getComputedStyle(element);
    return {
      display: style.display,
      position: style.position,
      paddingLeft: style.paddingLeft,
      borderRadius: style.borderRadius,
      fontSize: style.fontSize,
    };
  });

  expect(sentinelStyle).toEqual({
    display: "block",
    position: "static",
    paddingLeft: "0px",
    borderRadius: "0px",
    fontSize: "16px",
  });

  const button = page.getByRole("button", { name: "Primary" });
  const buttonStyle = await button.evaluate((element) => {
    const style = getComputedStyle(element);
    return {
      display: style.display,
      borderRadius: style.borderRadius,
      minHeight: style.minHeight,
    };
  });

  expect(buttonStyle.display).toBe("inline-flex");
  expect(parseFloat(buttonStyle.borderRadius)).toBeGreaterThan(0);
  expect(parseFloat(buttonStyle.minHeight)).toBeGreaterThanOrEqual(48);
  expect(errors).toEqual([]);
});

test("shadow, ring and backdrop plumbing works without Tailwind preflight", async ({ page }) => {
  const errors = runtimeErrors(page);

  const switchControl = page.getByRole("switch", { name: "Enabled" });
  const switchTrack = switchControl.locator(".shadow-sherick-recessed").first();
  const switchThumb = switchControl.locator(".shadow-sherick-control").first();

  const [trackShadow, thumbShadow] = await Promise.all([
    switchTrack.evaluate((element) => getComputedStyle(element).boxShadow),
    switchThumb.evaluate((element) => getComputedStyle(element).boxShadow),
  ]);

  expect(trackShadow).not.toBe("none");
  expect(trackShadow).toContain("inset");
  expect(thumbShadow).not.toBe("none");

  await page.getByRole("button", { name: "Open dialog" }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  const dialogVisuals = await dialog.evaluate((element) => {
    const style = getComputedStyle(element);
    return {
      boxShadow: style.boxShadow,
      backdropFilter: style.backdropFilter,
    };
  });

  expect(dialogVisuals.boxShadow).not.toBe("none");
  expect(dialogVisuals.backdropFilter).not.toBe("none");
  expect(dialogVisuals.backdropFilter).toContain("blur");

  expect(errors).toEqual([]);
});

test("portaled Select, Tooltip and Dialog remain styled", async ({ page }) => {
  const errors = runtimeErrors(page);

  const select = page.getByRole("combobox", { name: "Project type" });
  await select.click();
  const option = page.getByRole("option", { name: "Dashboard" });
  await expect(option).toBeVisible();
  await expect(option.evaluate((element) => getComputedStyle(element).borderRadius)).not.toBe("0px");
  await page.keyboard.press("Escape");

  await page.getByRole("button", { name: "Tooltip trigger" }).hover();
  await expect(page.getByRole("tooltip")).toBeVisible();

  await page.getByRole("button", { name: "Open dialog" }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  const dialogStyle = await dialog.evaluate((element) => getComputedStyle(element));
  expect(parseFloat(dialogStyle.borderRadius)).toBeGreaterThan(0);

  const nestedSelect = page.getByRole("combobox", { name: "Dialog project type" });
  await nestedSelect.click();
  await expect(page.getByRole("option", { name: "Design system" })).toBeVisible();

  expect(errors).toEqual([]);
});

test("theme tokens and KaTeX assets are present without consumer styling infrastructure", async ({ page }) => {
  const errors = runtimeErrors(page);

  const primary = await page.evaluate(() =>
    getComputedStyle(document.documentElement).getPropertyValue("--sui-primary").trim()
  );
  expect(primary).not.toBe("");

  await expect(page.locator(".katex").first()).toBeVisible();
  const katexFont = await page.locator(".katex").first().evaluate((element) => getComputedStyle(element).fontFamily);
  expect(katexFont.toLowerCase()).toContain("katex");
  expect(errors).toEqual([]);
});
