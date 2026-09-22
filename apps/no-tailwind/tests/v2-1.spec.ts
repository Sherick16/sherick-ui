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

test("focused composite fields keep their engaged tone under the pointer", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const input of [page.getByLabel("Date", { exact: true }), page.getByRole("combobox", { name: "Commands", exact: true })]) {
    const row = input.locator("xpath=ancestor::div[contains(@class, 'rounded-')][1]");
    await page.getByRole("button", { name: "Reset dates" }).focus();
    await page.mouse.move(0, 0);
    const resting = await css(row, "background-color");
    await input.hover();
    const hovered = await css(row, "background-color");
    expect(hovered).not.toBe(resting);
    await page.mouse.move(0, 0);
    await input.focus();
    const focused = await css(row, "background-color");
    expect(focused).not.toBe(hovered);
    await input.hover();
    expect(await css(row, "background-color")).toBe(focused);
  }
});

test("date text stays still and only the inset calendar affordance presses", async ({ page }) => {
  for (const reducedMotion of ["no-preference", "reduce"] as const) {
    await page.emulateMedia({ reducedMotion });
    for (const name of ["Date", "Start", "End"]) {
      const input = page.getByLabel(name, { exact: true });
      const row = input.locator("xpath=ancestor::div[contains(@class, 'rounded-')][1]");
      const trigger = page.getByRole("button", { name: `Open ${name}`, exact: true });
      await input.scrollIntoViewIfNeeded();
      const before = (await row.boundingBox())!;
      await input.hover({ position: { x: 24, y: 20 } });
      await page.mouse.down();
      try {
        // Sample held frames: text entry must never inherit the popup button's compression.
        const transforms = await row.evaluate(element => new Promise<string[]>(resolve => {
          const values: string[] = [];
          const frame = () => {
            values.push(getComputedStyle(element).transform);
            if (values.length === 8) resolve(values); else requestAnimationFrame(frame);
          };
          requestAnimationFrame(frame);
        }));
        expect(new Set(transforms)).toEqual(new Set(["none"]));
        expect((await row.boundingBox())!.width).toBeCloseTo(before.width, 1);
        await expect(page.getByRole("dialog")).toHaveCount(0);
      } finally { await page.mouse.up(); }
      await trigger.hover();
      const geometry = await trigger.evaluate(element => {
        const box = element.getBoundingClientRect();
        const layer = getComputedStyle(element, "::before");
        return { width: box.width, height: box.height, layerWidth: parseFloat(layer.width), layerHeight: parseFloat(layer.height), top: parseFloat(layer.top), bottom: parseFloat(layer.bottom) };
      });
      expect(geometry.width).toBeGreaterThanOrEqual(36);
      expect(geometry.height).toBeGreaterThanOrEqual(44);
      expect(geometry.layerWidth).toBe(32);
      expect(geometry.layerHeight).toBe(32);
      expect(geometry.top).toBe(geometry.bottom);
      const ink = trigger.locator("svg");
      const width = (await ink.boundingBox())!.width;
      await page.mouse.down();
      try {
        if (reducedMotion === "no-preference") {
          await expect.poll(async () => (await ink.boundingBox())!.width).toBeLessThan(width - 1);
        } else {
          expect((await ink.boundingBox())!.width).toBeCloseTo(width, 1);
        }
        expect(await css(row, "transform")).toBe("none");
        expect((await trigger.boundingBox())!.height).toBeCloseTo(geometry.height, 2);
      } finally { await page.mouse.up(); }
      await expect(page.getByRole("dialog")).toBeVisible();
      await page.keyboard.press("Escape");
      await expect(page.getByRole("dialog")).toHaveCount(0);
      await expect(trigger).toBeFocused();
    }
  }
});

test("pagination and step tracks match the existing segmented and progress families", async ({ page }) => {
  const pages = page.getByRole("navigation", { name: "Pages", exact: true });
  const segments = page.getByLabel("Reference segments", { exact: true });
  const tabs = page.getByRole("tablist", { name: "Reference tabs" });
  const selected = pages.locator('[aria-current="page"]');
  const segment = segments.getByRole("button", { name: "Two", exact: true });
  for (const theme of ["light", "dark"]) {
    await page.evaluate(value => { document.documentElement.dataset.sherickTheme = value; }, theme);
    for (const property of ["background-color", "box-shadow"]) {
      expect(await css(pages.getByRole("list"), property)).toBe(await css(segments, property));
      expect(await css(pages.getByRole("list"), property)).toBe(await css(tabs, property));
      expect(await css(selected, property)).toBe(await css(segment, property));
    }
    expect(await css(selected, "border-radius")).toBe(await css(segment, "border-radius"));
    const workflow = page.getByRole("navigation", { name: "Workflow" });
    const track = workflow.locator("[data-sui-step-track]").first();
    const progress = page.getByRole("progressbar");
    const progressTrack = progress.locator("[data-sui-progress-indicator]").locator("..").locator("..");
    for (const property of ["height", "background-color", "box-shadow", "border-radius"]) {
      expect(await css(track, property)).toBe(await css(progressTrack, property));
    }
    const fill = workflow.locator('[aria-current="step"] [data-sui-progress-indicator]');
    expect(await css(fill, "background-color")).toBe(await css(progress.locator("[data-sui-progress-indicator]"), "background-color"));
  }
  const target = pages.getByRole("button", { name: "Page 3", exact: true });
  const before = await css(target, "box-shadow");
  await target.focus();
  expect(await css(target, "box-shadow")).not.toBe(before);
  await page.keyboard.press("Enter");
  await expect(target).toHaveAttribute("aria-current", "page");
});
