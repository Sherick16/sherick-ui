import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

// Register before navigation: a post-hydration listener would miss the package defect.
let errors;
test.beforeEach(async ({ page }) => {
  errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
  await page.goto("/");
  await expect(page.locator("[data-ready=true]")).toBeVisible();
});
test.afterEach(() => expect(errors).toEqual([]));

const style = (locator, property) => locator.evaluate((element, name) => getComputedStyle(element)[name], property);

test("no-reset CSS, consumer ownership, and className overrides", async ({ page }) => {
  for (const [id, display] of [["sentinel", "block"], ["nested", "inline"]]) {
    expect(await page.locator(`#${id}`).evaluate((element) => {
      const s = getComputedStyle(element);
      return [s.display, s.position, s.paddingLeft, s.borderRadius, s.boxSizing];
    })).toEqual([display, "static", "0px", "0px", "content-box"]);
  }
  const button = page.locator("#primary");
  expect(await style(button, "borderTopWidth")).toBe("0px");
  expect(await style(button, "fontFamily")).toBe("monospace");
  expect(await style(button, "minHeight")).toBe("48px");
  expect(await style(page.getByRole("textbox", { name: "Name" }), "borderTopWidth")).toBe("0px");
  expect(await style(page.getByRole("separator"), "borderTopStyle")).toBe("solid");
  expect(await style(page.getByRole("separator"), "borderTopWidth")).toBe("1px");
  expect(await style(page.getByText("Package badge", { exact: true }), "boxSizing")).toBe("border-box");
  const override = page.locator("#override");
  expect(await override.evaluate((element) => {
    const s = getComputedStyle(element);
    return [s.width, s.minWidth, s.padding, s.borderRadius, s.position, s.overflow, s.opacity];
  })).toEqual(["96px", "0px", "0px", "0px", "static", "visible", "1"]);
  await override.hover();
  await expect.poll(() => style(override, "opacity")).toBe("0.5");
  const select = page.getByRole("combobox", { name: "Project", exact: true });
  expect(await style(select, "padding")).toBe("0px");
  expect(await style(select, "borderRadius")).toBe("0px");
  expect(await style(page.locator("#slider-root"), "width")).toBe("180px");
  await expect(page.locator("#slider-root").getByRole("slider", { name: "Volume" })).toBeVisible();
  await page.getByRole("checkbox", { name: "Accept" }).uncheck();
  await expect(page.getByRole("checkbox", { name: "Accept" })).not.toBeChecked();
  await page.getByRole("switch", { name: "Enabled" }).click();
  await expect(page.getByRole("switch", { name: "Enabled" })).not.toBeChecked();
});

test("packed editable Combobox isolates hidden content without becoming modal", async ({ page }) => {
  const searchable = page.getByRole("combobox", { name: "Search project" });
  const outsideButton = page.locator("#primary");
  await expect(outsideButton).toHaveAttribute("tabindex", "0");

  await searchable.click();
  await expect(page.getByRole("option", { name: "Dashboard" })).toBeVisible();
  await expect(outsideButton).toHaveAttribute("tabindex", "-1");
  await outsideButton.evaluate((button) => {
    const hiddenRoot = button.closest('[aria-hidden="true"]');
    if (!hiddenRoot) throw new Error("Outside button is not inside Combobox isolation");
    const fixture = document.createElement("div");
    fixture.innerHTML = `
      <div data-packed-focusability-target>Becomes focusable while hidden</div>
      <details><summary data-packed-summary>Native summary</summary></details>
      <button data-packed-late-button>Mounted while hidden</button>
      <button data-packed-explicit-negative>Stops participating while hidden</button>
    `;
    hiddenRoot.append(fixture);
  });
  const mutableTarget = page.locator("[data-packed-focusability-target]");
  const nativeSummary = page.locator("[data-packed-summary]");
  const lateButton = page.locator("[data-packed-late-button]");
  const explicitlyRemoved = page.locator("[data-packed-explicit-negative]");
  await expect(nativeSummary).toHaveAttribute("tabindex", "-1");
  await expect(lateButton).toHaveAttribute("tabindex", "-1");
  await expect(explicitlyRemoved).toHaveAttribute("tabindex", "-1");
  await mutableTarget.evaluate((element) => {
    element.tabIndex = 0;
  });
  await expect(mutableTarget).toHaveAttribute("tabindex", "-1");
  await explicitlyRemoved.evaluate((element) => {
    element.tabIndex = -1;
  });

  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
    .analyze();
  expect(results.violations).toEqual([]);

  await page.keyboard.press("Escape");
  await expect(outsideButton).toHaveAttribute("tabindex", "0");
  await expect(mutableTarget).toHaveAttribute("tabindex", "0");
  expect(await nativeSummary.getAttribute("tabindex")).toBeNull();
  expect(await lateButton.getAttribute("tabindex")).toBeNull();
  await expect(explicitlyRemoved).toHaveAttribute("tabindex", "-1");

  await searchable.click();
  await expect(page.getByRole("option", { name: "Dashboard" })).toBeVisible();
  await outsideButton.click();
  await expect(page.getByRole("option", { name: "Dashboard" })).toHaveCount(0);
});

test("document themes and overrides reach styled portals", async ({ page }) => {
  const primary = page.locator("#primary");
  await page.emulateMedia({ colorScheme: "light", reducedMotion: "reduce" });
  const light = await style(primary, "backgroundColor");
  await page.emulateMedia({ colorScheme: "dark" });
  await expect.poll(() => style(primary, "backgroundColor")).not.toBe(light);
  const dark = await style(primary, "backgroundColor");
  await page.evaluate(() => document.documentElement.dataset.sherickTheme = "light");
  await expect.poll(() => style(primary, "backgroundColor")).toBe(light);
  await page.emulateMedia({ colorScheme: "light" });
  await page.evaluate(() => document.documentElement.dataset.sherickTheme = "dark");
  await expect.poll(() => style(primary, "backgroundColor")).toBe(dark);
  await page.addStyleTag({ content: ":root { --sui-primary-strong: 0.6 0.2 145; --sui-surface-overlay: 0.4 0.1 145; }" });
  await expect.poll(() => style(primary, "backgroundColor")).not.toBe(dark);
  const custom = await style(primary, "backgroundColor");
  await page.getByRole("button", { name: "Open dialog", exact: true }).click();
  const dialog = page.getByRole("dialog", { name: "Packed dialog" });
  await expect(dialog).toBeVisible();
  expect(await dialog.evaluate(el => el.closest("main"))).toBeNull();
  expect(await style(dialog, "boxShadow")).not.toBe("none");
  expect(await style(dialog, "backdropFilter")).toContain("blur");
  expect(await style(page.locator("#portal-primary"), "backgroundColor")).toBe(custom);
  expect(await dialog.evaluate(el => getComputedStyle(el).getPropertyValue("--sui-surface-overlay").trim())).toBe("0.4 0.1 145");
  await page.locator("#portal-primary").click();
  await expect(dialog).toBeHidden();
  await page.getByRole("combobox", { name: "Project", exact: true }).click();
  const option = page.getByRole("option", { name: "Two" });
  await expect(option).toBeVisible();
  expect(await style(option, "borderRadius")).not.toBe("0px");
  await option.click();
  await expect(page.getByRole("combobox", { name: "Project", exact: true })).toHaveText("Two");
  await page.getByRole("button", { name: "Popup", exact: true }).click();
  await expect(page.getByText("Package popup")).toBeVisible();
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "Open drawer" }).click();
  await expect(page.getByRole("dialog", { name: "Packed drawer" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog", { name: "Packed drawer" })).toBeHidden();
  await page.getByRole("button", { name: "Notify" }).click();
  const toast = page.getByRole("dialog", { name: "Packed toast" });
  await expect(toast).toBeVisible();
  expect(await style(toast, "boxShadow")).not.toBe("none");
});

test("rich content hydrates without scanning host DOM or replacing host keyframes", async ({ page }) => {
  await expect(page.locator("#host-code .token")).toHaveCount(0);
  await expect(page.locator("pre.prism-code .token.keyword").first()).toBeVisible();
  await expect(page.locator("pre.prism-code .token.tag").first()).toBeVisible();
  await expect(page.locator(".katex").first()).toBeVisible();
  expect(await style(page.locator(".katex").first(), "fontFamily")).toContain("SherickKaTeX");
  expect(await page.evaluate(async () => {
    await document.fonts.load('16px "SherickKaTeX_Main"');
    return document.fonts.check('16px "SherickKaTeX_Main"');
  })).toBe(true);
  expect(await page.locator("#host-spin").evaluate(el => new DOMMatrix(el.getAnimations()[0].effect.getKeyframes().at(-1).transform).m41)).toBe(123);
  expect(await page.locator("#host-pulse").evaluate(el => el.getAnimations()[0].effect.getKeyframes().at(-1).opacity)).toBe("0.123");
  expect(await style(page.getByRole("status").filter({ hasText: "Working" }).locator("svg"), "animationName")).toBe("sherick-spin");
});

test("theme.css works alone without component rules or a reset", async ({ page }) => {
  await page.goto("/theme-only.html");
  await page.emulateMedia({ colorScheme: "light" });
  const token = page.locator("#token");
  const light = await style(token, "backgroundColor");
  expect(light).not.toBe("rgba(0, 0, 0, 0)");
  await page.emulateMedia({ colorScheme: "dark" });
  await expect.poll(() => style(token, "backgroundColor")).not.toBe(light);
  await page.evaluate(() => document.documentElement.dataset.sherickTheme = "light");
  await expect.poll(() => style(token, "backgroundColor")).toBe(light);
  expect(await style(token, "display")).toBe("block");
  expect(await style(token, "position")).toBe("static");
  expect(await style(page.getByRole("button"), "borderTopWidth")).not.toBe("0px");
});
