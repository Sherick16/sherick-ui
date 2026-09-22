import { expect, test, type Locator } from "@playwright/test";

const css = (locator: Locator, property: string) => locator.evaluate(
  (element, name) => getComputedStyle(element).getPropertyValue(name), property,
);

test.beforeEach(async ({ page }) => {
  page.on("pageerror", error => { throw error; });
  page.on("console", message => { expect(message.type(), message.text()).not.toBe("error"); });
  await page.goto("/v2-1");
  await expect(page.getByTestId("no-tailwind-v21")).toBeVisible();
});

test("published controls retain native forms, selection and keyboard focus", async ({ page }) => {
  const grid = page.getByRole("grid");
  await grid.getByRole("button", { name: "Monday, June 10, 2024", exact: true }).focus();
  await page.keyboard.press("ArrowLeft");
  const next = grid.getByRole("button", { name: "Tuesday, June 11, 2024", exact: true });
  await expect(next).toBeFocused();
  expect(await css(next, "box-shadow")).not.toBe("none");
  await page.keyboard.press("Space");
  await expect(grid.getByRole("gridcell", { name: "Tuesday, June 11, 2024", exact: true })).toHaveAttribute("aria-selected", "true");
  expect(await css(page.locator("fieldset"), "border-top-width")).toBe("0px");
  const date = page.getByLabel("Date", { exact: true });
  await date.fill("2024-06-14");
  expect(await page.locator("#dates").evaluate(element => Object.fromEntries(new FormData(element as HTMLFormElement)))).toEqual({ date: "2024-06-14", start: "2024-06-10", end: "2024-06-12" });
  await page.getByRole("button", { name: "Reset dates" }).click();
  await expect(date).toHaveValue("2024-06-10");
  const commands = page.getByRole("combobox", { name: "Commands", exact: true });
  await commands.fill("archive");
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("Enter");
  await expect(page.getByTestId("command-action")).toHaveText("archive");
  const pages = page.getByRole("navigation", { name: "Pages", exact: true });
  await pages.getByRole("button", { name: "Next page" }).click();
  await expect(pages.getByRole("button", { name: "Page 3", exact: true })).toHaveAttribute("aria-current", "page");
  await expect(page.getByRole("link", { name: "Home", exact: true })).toHaveAttribute("href", "#home");
  const draft = page.getByRole("navigation", { name: "Workflow" }).getByRole("button", { name: /Draft/ });
  await draft.click();
  await expect(draft).toHaveAttribute("aria-current", "step");
  const child = page.getByRole("treeitem", { name: "Child", exact: true });
  await draft.focus();
  await page.keyboard.press("Tab");
  await page.keyboard.press("Tab");
  await expect(page.getByRole("treeitem", { name: "Root", exact: true })).toBeFocused();
  await page.keyboard.press("ArrowDown");
  await expect(child).toBeFocused();
  await page.keyboard.press("Space");
  await expect(child).toHaveAttribute("aria-selected", "true");
  expect(await child.evaluate(element => getComputedStyle(element.firstElementChild!).boxShadow)).not.toBe("none");
  await page.getByLabel("Files", { exact: true }).setInputFiles({ name: "notes.txt", mimeType: "text/plain", buffer: Buffer.from("notes") });
  const remove = page.getByRole("button", { name: "Remove notes.txt" });
  await expect(remove).toBeVisible();
  expect((await remove.boundingBox())!.height).toBeGreaterThanOrEqual(44);
  const files = page.getByRole("list").filter({ has: remove });
  await expect(files).toHaveAttribute("role", "list");
  for (const property of ["margin-block-start", "margin-block-end", "padding-inline-start", "padding-inline-end"]) {
    expect(await css(files, property)).toBe("0px");
  }
  expect(await css(files, "list-style-type")).toBe("none");
  await remove.click();
  await expect(remove).toHaveCount(0);
});

test("date and command portals keep scope, theme, focus and constrained RTL placement", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 640 });
  for (const theme of ["light", "dark"]) {
    await page.evaluate(value => { document.documentElement.dataset.sherickTheme = value; }, theme);
    for (const [triggerName, popupName] of [["Open Date", "Date"], ["Open Start", "Date range"], ["Open palette", "Palette"]]) {
      const trigger = page.getByRole("button", { name: triggerName, exact: true });
      await trigger.click();
      const popup = page.getByRole("dialog", { name: popupName, exact: true });
      await expect(popup).toBeVisible();
      expect(await popup.evaluate(element => element.closest("main"))).toBeNull();
      expect(await css(popup, "box-shadow")).not.toBe("none");
      expect(await css(popup, "border-radius")).not.toBe("0px");
      expect(await css(popup, "background-color")).not.toBe("rgba(0, 0, 0, 0)");
      const box = (await popup.boundingBox())!;
      expect(box.x).toBeGreaterThanOrEqual(-1);
      expect(box.x + box.width).toBeLessThanOrEqual(321);
      await page.keyboard.press("Escape");
      await expect(popup).toBeHidden();
      await expect(trigger).toBeFocused();
    }
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
});

test("selection and keyboard focus survive reduced motion and Chromium forced colors", async ({ page, browserName }) => {
  await page.emulateMedia({ reducedMotion: "reduce", ...(browserName === "chromium" ? { forcedColors: "active" as const } : {}) });
  const grid = page.getByRole("grid");
  const selected = grid.getByRole("button", { name: "Monday, June 10, 2024", exact: true });
  await selected.focus();
  await page.keyboard.press("ArrowLeft");
  await page.keyboard.press("Space");
  const next = grid.getByRole("button", { name: "Tuesday, June 11, 2024", exact: true });
  await expect(next).toBeFocused();
  await expect(grid.getByRole("gridcell", { name: "Tuesday, June 11, 2024", exact: true })).toHaveAttribute("aria-selected", "true");
  if (browserName === "chromium") {
    expect(await css(next, "outline-style")).not.toBe("none");
    expect(parseFloat(await css(next, "outline-width"))).toBeGreaterThanOrEqual(2);

    const root = page.getByRole("treeitem", { name: "Root", exact: true });
    const rootRow = root.locator(":scope > div").first();
    const child = page.getByRole("treeitem", { name: "Child", exact: true });
    const childRow = child.locator(":scope > div").first();
    await root.focus();
    await page.keyboard.press("Home");
    await page.keyboard.press("Space");
    await expect(root).toBeFocused();
    await expect(root).toHaveAttribute("aria-expanded", "true");
    await expect(root).toHaveAttribute("aria-selected", "true");
    expect(await css(root, "outline-style")).toBe("none");
    expect(await css(rootRow, "outline-style")).toBe("solid");
    expect(await css(rootRow, "outline-width")).toBe("2px");
    expect(await css(rootRow, "outline-offset")).toBe("-2px");
    expect((await rootRow.boundingBox())!.height).toBeLessThan((await root.boundingBox())!.height);
    expect((await rootRow.boundingBox())!.height).toBe((await childRow.boundingBox())!.height);
    expect(await css(root.getByRole("group"), "outline-style")).toBe("none");
    await page.keyboard.press("ArrowDown");
    await expect(child).toBeFocused();
    await expect(root).toHaveAttribute("aria-selected", "true");
    await expect(child).toHaveAttribute("aria-selected", "false");
    expect(await css(rootRow, "outline-style")).toBe("solid");
    expect(await css(rootRow, "outline-width")).toBe("1px");
    expect(await css(child, "outline-style")).toBe("none");
    expect(await css(childRow, "outline-style")).toBe("solid");
    expect(await css(childRow, "outline-width")).toBe("2px");
    expect(await css(childRow, "outline-offset")).toBe("-2px");

    const commands = page.getByRole("combobox", { name: "Commands", exact: true });
    const save = page.getByRole("option", { name: "Save draft", exact: true });
    const archive = page.getByRole("option", { name: "Archive draft", exact: true });
    const publish = page.getByRole("option", { name: "Publish draft", exact: true });
    await commands.fill("draft");
    await expect(save).toHaveAttribute("data-highlighted", "");
    for (const option of [save, archive, publish]) {
      await expect(commands).toBeFocused();
      await expect(commands).toHaveAttribute("aria-activedescendant", (await option.getAttribute("id"))!);
      await expect(option).toHaveAttribute("data-highlighted", "");
      expect(await css(option, "outline-style")).toBe("solid");
      expect(await css(option, "outline-width")).toBe("2px");
      expect(await css(option, "outline-offset")).toBe("-2px");
      if (option !== publish) await page.keyboard.press("ArrowDown");
    }
    await expect(publish).toHaveAttribute("aria-disabled", "true");
    for (const inactive of [save, archive]) {
      await expect(inactive).not.toHaveAttribute("data-highlighted", "");
      expect(await css(inactive, "outline-style")).toBe("none");
    }
    await page.keyboard.press("Enter");
    await expect(page.getByTestId("command-action")).toHaveText("");

    await page.getByRole("button", { name: "Open Start", exact: true }).click();
    const range = page.getByRole("dialog", { name: "Date range", exact: true });
    const selectedDays = range.getByRole("gridcell", { selected: true }).getByRole("button");
    await expect(selectedDays).toHaveCount(3);
    // Interior days need a persistent selection cue as well as the emphasized endpoints.
    await selectedDays.nth(1).focus();
    await page.keyboard.press("ArrowLeft");
    expect(await css(selectedDays.nth(2), "outline-width")).toBe("2px");
    await range.getByRole("button", { name: "Today", exact: true }).focus();
    for (const day of await selectedDays.all()) {
      expect(await css(day, "outline-style")).toBe("solid");
      expect(await css(day, "outline-width")).toBe("1px");
      expect(await css(day, "outline-offset")).toBe("-2px");
    }
    await page.keyboard.press("Escape");
    await expect(range).toBeHidden();
  }
  expect(await page.evaluate(() => document.getAnimations().filter(animation => animation.playState === "running").length)).toBe(0);
});
