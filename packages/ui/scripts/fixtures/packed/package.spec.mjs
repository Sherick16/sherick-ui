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
      <label><input data-packed-radio-first type="radio" name="packed-isolation" checked> First</label>
      <label><input data-packed-radio-second type="radio" name="packed-isolation"> Second</label>
    `;
    hiddenRoot.append(fixture);
  });
  const mutableTarget = page.locator("[data-packed-focusability-target]");
  const nativeSummary = page.locator("[data-packed-summary]");
  const lateButton = page.locator("[data-packed-late-button]");
  const explicitlyRemoved = page.locator("[data-packed-explicit-negative]");
  const firstRadio = page.locator("[data-packed-radio-first]");
  const secondRadio = page.locator("[data-packed-radio-second]");
  await expect(nativeSummary).toHaveAttribute("tabindex", "-1");
  await expect(lateButton).toHaveAttribute("tabindex", "-1");
  await expect(explicitlyRemoved).toHaveAttribute("tabindex", "-1");
  await expect(firstRadio).toBeChecked();
  await expect(secondRadio).not.toBeChecked();
  await secondRadio.evaluate((element) => {
    element.checked = true;
  });
  await expect(firstRadio).not.toBeChecked();
  await expect(secondRadio).toBeChecked();
  await expect(firstRadio).toHaveAttribute("tabindex", "-1");
  await expect(secondRadio).toHaveAttribute("tabindex", "-1");
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
  expect(await firstRadio.getAttribute("tabindex")).toBeNull();
  expect(await secondRadio.getAttribute("tabindex")).toBeNull();
  await expect(firstRadio).not.toBeChecked();
  await expect(secondRadio).toBeChecked();

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

test("packed date family keeps RTL keyboard selection, native forms and portaled styling", async ({ page }) => {
  const fixture = page.getByTestId("packed-v21");
  const grid = fixture.getByRole("grid");
  await grid.getByRole("button", { name: "Monday, June 10, 2024", exact: true }).focus();
  await page.keyboard.press("ArrowLeft");
  const next = grid.getByRole("button", { name: "Tuesday, June 11, 2024", exact: true });
  await expect(next).toBeFocused();
  expect(await style(next, "boxShadow")).not.toBe("none");
  expect(await style(next, "borderTopWidth")).toBe("0px");
  await page.keyboard.press("Space");
  await expect(grid.getByRole("gridcell", { name: "Tuesday, June 11, 2024", exact: true })).toHaveAttribute("aria-selected", "true");
  const input = fixture.getByLabel("Packed date", { exact: true });
  await input.fill("2024-06-14");
  expect(await page.locator("#packed-dates").evaluate(form => Object.fromEntries(new FormData(form)))).toEqual({ date: "2024-06-14", start: "2024-06-10", end: "2024-06-12" });
  await fixture.getByRole("button", { name: "Reset packed dates" }).click();
  await expect(input).toHaveValue("2024-06-10");
  await fixture.getByRole("button", { name: "Open Packed date", exact: true }).click();
  const popup = page.getByRole("dialog", { name: "Packed date", exact: true });
  await expect(popup).toBeVisible();
  expect(await popup.evaluate(element => element.closest("main"))).toBeNull();
  expect(await style(popup, "boxShadow")).not.toBe("none");
  expect(await style(popup, "backgroundColor")).not.toBe("rgba(0, 0, 0, 0)");
  await page.keyboard.press("Escape");
  await expect(fixture.getByRole("button", { name: "Open Packed date", exact: true })).toBeFocused();
});

test("packed commands act, filter, and restore palette focus", async ({ page }) => {
  const fixture = page.getByTestId("packed-v21");
  const field = fixture.getByRole("combobox", { name: "Packed commands", exact: true });
  await field.fill("archive");
  await expect(fixture.getByRole("option")).toHaveCount(1);
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("Enter");
  await expect(page.getByTestId("packed-command-action")).toHaveText("archive");
  await expect(field).toHaveValue("archive");
  const trigger = fixture.getByRole("button", { name: "Open packed palette" });
  await trigger.click();
  const palette = page.getByRole("dialog", { name: "Packed palette", exact: true });
  await expect(palette.getByRole("combobox", { name: "Packed palette search" })).toBeFocused();
  expect(await style(palette, "boxShadow")).not.toBe("none");
  await palette.getByRole("option", { name: "Save draft" }).click();
  await expect(palette).toBeHidden();
  await expect(trigger).toBeFocused();
  await expect(page.getByTestId("packed-command-action")).toHaveText("save");
});

test("packed navigation, tree, upload and stepper preserve native state and focus", async ({ page }) => {
  const fixture = page.getByTestId("packed-v21");
  const pages = fixture.getByRole("navigation", { name: "Packed pages" });
  await pages.getByRole("button", { name: "Next page" }).click();
  await expect(pages.getByRole("button", { name: "Page 3", exact: true })).toHaveAttribute("aria-current", "page");
  const breadcrumb = fixture.getByRole("navigation", { name: "Packed breadcrumb" });
  await expect(breadcrumb.getByRole("link", { name: "Home" })).toHaveAttribute("href", "#home");
  await expect(breadcrumb.getByText("Current", { exact: true })).toHaveAttribute("aria-current", "page");
  const workflow = fixture.getByRole("navigation", { name: "Packed workflow" });
  await workflow.getByRole("button", { name: /Draft/ }).click();
  await expect(workflow.getByRole("button", { name: /Draft/ })).toHaveAttribute("aria-current", "step");
  const child = fixture.getByRole("treeitem", { name: "Child", exact: true });
  await workflow.getByRole("button", { name: /Draft/ }).focus();
  await page.keyboard.press("Tab");
  await page.keyboard.press("Tab");
  await expect(fixture.getByRole("treeitem", { name: "Root", exact: true })).toBeFocused();
  await page.keyboard.press("ArrowDown");
  await expect(child).toBeFocused();
  await page.keyboard.press("Space");
  await expect(child).toHaveAttribute("aria-selected", "true");
  expect(await child.evaluate(element => getComputedStyle(element.firstElementChild).boxShadow)).not.toBe("none");
  await fixture.getByLabel("Packed files", { exact: true }).setInputFiles({ name: "notes.txt", mimeType: "text/plain", buffer: Buffer.from("notes") });
  const remove = fixture.getByRole("button", { name: "Remove notes.txt" });
  await expect(remove).toBeVisible();
  expect((await remove.boundingBox()).height).toBeGreaterThanOrEqual(44);
  await remove.click();
  await expect(remove).toHaveCount(0);
});

test("published wave semantics pass axe before and after invalid date/file entry", async ({ page }) => {
  const fixture = page.getByTestId("packed-v21");
  const audit = () => new AxeBuilder({ page }).include('[data-testid="packed-v21"]')
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]).analyze();
  expect((await audit()).violations).toEqual([]);
  const end = fixture.getByLabel("Packed end", { exact: true });
  await end.fill("2024-06-05");
  await expect(end).toHaveAttribute("aria-invalid", "true");
  await fixture.getByLabel("Packed files", { exact: true }).setInputFiles({ name: "blocked.bin", mimeType: "application/octet-stream", buffer: Buffer.from("blocked") });
  await expect(fixture.getByRole("status").filter({ hasText: "blocked.bin" })).toBeVisible();
  expect((await audit()).violations).toEqual([]);
});
