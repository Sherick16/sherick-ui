import { expect, test, type Locator, type Page } from "@playwright/test";

async function noPageOverflow(page: Page) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
}

async function inViewport(locator: Locator, page: Page) {
  const box = await locator.boundingBox();
  expect(box).not.toBeNull();
  const viewport = page.viewportSize()!;
  expect(box!.x).toBeGreaterThanOrEqual(-1);
  expect(box!.y).toBeGreaterThanOrEqual(-1);
  expect(box!.x + box!.width).toBeLessThanOrEqual(viewport.width + 1);
  expect(box!.y + box!.height).toBeLessThanOrEqual(viewport.height + 1);
}

test.beforeEach(async ({ page }) => {
  page.on("pageerror", error => { throw error; });
  page.on("console", message => { expect(message.type(), message.text()).not.toBe("error"); });
  await page.goto("/hostile");
});

for (const direction of ["ltr", "rtl"]) {
  for (const width of [320, 640, 1280]) {
    test(`${direction} at ${width}: grid children own their width and overflow`, async ({ page }) => {
      await page.goto(`/hostile?dir=${direction}`);
      await page.setViewportSize({ width, height: 720 });
      await page.evaluate(dir => { document.documentElement.dir = dir; }, direction);
      const failures = await page.getByTestId("hostile-grid").evaluate(grid => {
        const boundary = grid.getBoundingClientRect();
        return Array.from(grid.children).flatMap((child, index) => {
          if (child.matches('input[aria-hidden="true"]')) return []; // Base's hidden form inputs.
          const rect = child.getBoundingClientRect();
          return rect.width > boundary.width + 1 || rect.left < boundary.left - 1 || rect.right > boundary.right + 1
            ? [`${index}: ${child.tagName} ${child.textContent?.slice(0, 55)} width ${rect.width}`] : [];
        });
      });
      expect.soft(failures).toEqual([]);
      await noPageOverflow(page);
    });
  }
}

test("short modal leaves both ends and nested popups reachable", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 360 });
  await page.getByRole("button", { name: "Open stress dialog", exact: true }).click();
  const dialog = page.getByRole("dialog");
  const close = dialog.getByRole("button", { name: "Close dialog" });
  await close.scrollIntoViewIfNeeded();
  await inViewport(close, page);
  const select = dialog.getByRole("combobox", { name: "Nested select", exact: true });
  await select.click();
  await inViewport(page.getByRole("listbox").locator(".."), page);
  await page.keyboard.press("End");
  await inViewport(page.getByRole("option").last(), page);
  await page.keyboard.press("Escape");
  await expect(select).toBeFocused();
  await expect(dialog).toBeVisible();
  const finish = dialog.getByRole("button", { name: "Finish dialog" });
  await finish.scrollIntoViewIfNeeded();
  await inViewport(finish, page);
  await finish.click();
  await expect(dialog).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Open stress dialog", exact: true })).toBeFocused();
});

test("loading without an icon preserves button geometry", async ({ page }) => {
  const button = page.getByTestId("loading-button");
  // Intrinsic rather than a stretching column masks no width changes.
  await button.evaluate(el => { el.style.alignSelf = "start"; });
  const before = await button.boundingBox();
  await page.getByRole("button", { name: "Toggle loading", exact: true }).click();
  const after = await button.boundingBox();
  expect(after!.width).toBeCloseTo(before!.width, 1);
  expect(after!.height).toBeCloseTo(before!.height, 1);
  await expect(button).toHaveAccessibleName("Save changes");
  await expect(button).toBeDisabled();
  await expect(button).toHaveAttribute("aria-busy", "true");
  await page.getByRole("button", { name: "Toggle loading", exact: true }).click();
  await expect(button).toBeEnabled();
  expect((await button.boundingBox())!.width).toBeCloseTo(before!.width, 1);
});

for (const side of ["left", "right", "top", "bottom"]) {
  test(`RTL ${side} drawer retains its physical edge and reachable footer`, async ({ page }) => {
    await page.goto(`/hostile?dir=rtl&side=${side}`);
    await page.setViewportSize({ width: 320, height: 360 });
    await page.evaluate(() => { document.documentElement.dir = "rtl"; });
    await page.getByRole("button", { name: "Open stress drawer", exact: true }).click();
    const drawer = page.getByRole("dialog");
    await inViewport(drawer, page);
    const box = (await drawer.boundingBox())!;
    if (side === "left") expect(box.x).toBeCloseTo(0, 0);
    if (side === "right") expect(box.x + box.width).toBeCloseTo(320, 0);
    if (side === "top") expect(box.y).toBeCloseTo(0, 0);
    if (side === "bottom") expect(box.y + box.height).toBeCloseTo(360, 0);
    const finish = drawer.getByRole("button", { name: "Finish drawer" });
    await finish.scrollIntoViewIfNeeded();
    await inViewport(finish, page);
    await finish.click();
    await expect(drawer).toHaveCount(0);
  });
}

for (const kind of ["select", "combobox", "menu", "popover", "tooltip"]) {
  test(`${kind} collision and content near each corner`, async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 360 });
    for (const corner of ["top-left", "top-right", "bottom-left", "bottom-right"]) {
      await page.getByTestId("edge-anchor").evaluate((el, corner) => {
        el.style.cssText = `position:fixed;${corner.includes("top") ? "top" : "bottom"}:4px;${corner.includes("left") ? "left" : "right"}:4px;width:180px;margin:0`;
        Array.from(el.children).forEach(child => { (child as HTMLElement).style.display = ""; });
      }, corner);
      const trigger = page.getByRole(kind === "select" || kind === "combobox" ? "combobox" : "button", { name: `Edge ${kind}`, exact: true });
      await trigger.evaluate(el => {
        let root = el as HTMLElement;
        while (root.parentElement?.dataset.testid !== "edge-anchor") root = root.parentElement!;
        Array.from(root.parentElement!.children).forEach(child => { if (child !== root) (child as HTMLElement).style.display = "none"; });
      });
      if (kind === "tooltip") await trigger.hover();
      else await trigger.click();
      const surface = kind === "select" || kind === "combobox" ? page.getByRole("listbox").locator("..")
        : kind === "tooltip" ? page.getByTestId("stress-tooltip").locator("..") : page.getByRole(kind === "menu" ? "menu" : "dialog");
      await expect(surface).toBeVisible();
      await inViewport(surface, page);
      expect(await surface.evaluate(el => el.scrollWidth - el.clientWidth)).toBeLessThanOrEqual(1);
      await noPageOverflow(page);
      await page.keyboard.press("Escape");
      await page.mouse.move(310, 180);
      await expect(surface).toHaveCount(0); // Finish Base's exit before moving/reopening the anchor.
    }
  });
}

test("long toast keeps copy and action reachable in a short viewport", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 360 });
  await page.getByRole("button", { name: "Raise stress toast" }).click();
  const toast = page.getByRole("dialog");
  await inViewport(toast, page);
  const action = toast.getByRole("button", { name: "Resolve notification" });
  await action.scrollIntoViewIfNeeded();
  await inViewport(action, page);
  await action.click();
  await toast.getByRole("button", { name: "Dismiss", exact: true }).click();
  await expect(toast).toHaveCount(0);
});

test("RTL slider keyboard and pointer agree on the increasing direction", async ({ page }) => {
  await page.goto("/hostile?dir=rtl");
  await page.evaluate(() => { document.documentElement.dir = "rtl"; });
  const slider = page.getByRole("slider");
  await slider.focus();
  await slider.press("Home");
  const minimum = (await slider.boundingBox())!;
  await slider.press("End");
  const maximum = (await slider.boundingBox())!;
  expect(maximum.x).toBeLessThan(minimum.x);
  await slider.press("Home");
  await slider.press("ArrowLeft");
  await expect(slider).toHaveAttribute("aria-valuenow", "1");
});

for (const scale of [2, 4]) {
  test(`${scale * 100}% equivalent reflow keeps modal actions reachable`, async ({ page }) => {
    // Browser zoom reduces the CSS viewport. deviceScaleFactor alone does not exercise reflow.
    await page.setViewportSize({ width: 1280 / scale, height: 900 / scale });
    await noPageOverflow(page);
    await page.getByRole("button", { name: "Open stress confirmation" }).click();
    const alert = page.getByRole("alertdialog");
    const heading = alert.getByRole("heading");
    await heading.scrollIntoViewIfNeeded();
    await inViewport(heading, page);
    const confirm = alert.getByRole("button", { name: "Confirm this unusually long operation" });
    await confirm.scrollIntoViewIfNeeded();
    await inViewport(confirm, page);
    await confirm.click();
    await expect(alert).toHaveCount(0);
  });
}

test("200% text sizing wraps copy without clipping or page overflow", async ({ page }) => {
  await page.setViewportSize({ width: 640, height: 720 });
  await page.evaluate(() => { document.documentElement.style.fontSize = "200%"; });
  await page.getByTestId("hostile-grid").evaluate(el => { el.style.width = "100%"; });
  await noPageOverflow(page);
  const alert = page.getByRole("status").filter({ has: page.getByRole("button", { name: "Dismiss alert" }) });
  expect(await alert.evaluate(el => el.scrollWidth - el.clientWidth)).toBeLessThanOrEqual(1);
  await page.getByRole("button", { name: "Toggle validation" }).click();
  await noPageOverflow(page);
});

for (const kind of ["dialog", "drawer"]) {
  test(`nested controls inside ${kind}: hit testing, Escape order and viewport reduction`, async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 640 });
    await page.getByRole("button", { name: `Open stress ${kind}`, exact: true }).click();
    const modal = page.getByRole("dialog").first();
    const combo = modal.getByRole("combobox", { name: "Nested combobox", exact: true });
    await combo.fill("Project 2");
    const option = page.getByRole("option", { name: "Project 23", exact: true });
    await option.click();
    await expect(combo).toHaveValue("Project 23");
    await page.setViewportSize({ width: 320, height: 300 });
    await combo.click();
    await page.keyboard.press("Escape");
    await expect(modal).toBeVisible();
    await expect(combo).toBeFocused();
    const popover = modal.getByRole("button", { name: "Nested popover", exact: true });
    await popover.click();
    const input = page.getByRole("textbox", { name: "Popover field" });
    await input.fill("Editable within two layers");
    await inViewport(input, page);
    await page.keyboard.press("Escape");
    await expect(popover).toBeFocused();
    const menu = modal.getByRole("button", { name: "Nested menu", exact: true });
    await menu.click();
    await page.getByRole("menuitem", { name: "Nested command" }).click();
    await expect(menu).toBeFocused();
    const tooltip = modal.getByRole("button", { name: "Nested tooltip", exact: true });
    await tooltip.hover();
    await expect(page.getByText("Nested hint", { exact: true })).toBeVisible();
    await page.mouse.move(0, 0);
    await page.keyboard.press("Escape");
    await expect(modal).toHaveCount(0);
  });
}

test("drawer's reading surface accepts keyboard scrolling on open", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 360 });
  await page.getByRole("button", { name: "Open stress drawer", exact: true }).click();
  const drawer = page.getByRole("dialog");
  const scroller = drawer.locator(":scope > div").first();
  await expect(scroller).toBeFocused();
  const before = await scroller.evaluate(el => el.scrollTop);
  await page.keyboard.press("PageDown");
  await expect.poll(() => scroller.evaluate(el => el.scrollTop)).toBeGreaterThan(before);
});

for (const kind of ["dialog", "drawer"]) {
  test(`notification accessibility and keyboard actions while ${kind} is open`, async ({ page }) => {
    await page.getByRole("button", { name: `Open stress ${kind}`, exact: true }).click();
    const notify = page.getByRole("button", { name: "Notify inside overlay" });
    await notify.scrollIntoViewIfNeeded();
    await notify.focus();
    await page.keyboard.press("Enter");
    const viewport = page.getByRole("region", { name: "Notifications", exact: true });
    await expect(viewport).toBeAttached(); // The positioned stack has absolutely positioned children.
    expect(await viewport.evaluate(el => el.closest('[aria-hidden="true"], [inert]') !== null)).toBe(false);
    // The live region and named toast are exposed even before keyboard engagement.
    const toast = page.getByRole("dialog", { name: "Modal notification", exact: true });
    await expect(toast).toBeVisible();
    const modal = page.getByRole("dialog").filter({ has: notify });
    await page.keyboard.press("Tab");
    expect(await modal.evaluate(el => el.contains(document.activeElement))).toBe(true);
    await page.keyboard.press("Shift+Tab");
    await expect(notify).toBeFocused();
    await page.keyboard.press("F6");
    await expect(viewport).toBeFocused();
    await expect(viewport).toHaveAttribute("data-expanded", "");
    await expect(viewport).toHaveAttribute("aria-keyshortcuts", "F6");
    await expect(toast).toBeVisible();
    expect(await toast.evaluate(el => el.closest('[aria-hidden="true"], [inert]') !== null)).toBe(false);
    expect(await toast.evaluate(el => { const r = el.getBoundingClientRect(); return el.contains(document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2)); })).toBe(true);
    await page.keyboard.press("Tab");
    await expect(toast).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(toast.getByRole("button", { name: "Undo modal change" })).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page.getByText("Modal change undone", { exact: true })).toBeVisible();
    await expect(modal).toBeVisible();
    await page.keyboard.press("Tab");
    await expect(toast.getByRole("button", { name: "Dismiss", exact: true })).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(notify).toBeFocused();
    await page.keyboard.press("F6");
    await expect(viewport).toBeFocused();
    await page.keyboard.press("Shift+Tab");
    await expect(notify).toBeFocused();
    await page.keyboard.press("F6");
    await expect(viewport).toBeFocused();
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    await expect(toast.getByRole("button", { name: "Dismiss", exact: true })).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(toast).toHaveCount(0);
    await expect(notify).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(modal).toHaveCount(0);
    await expect(page.getByRole("button", { name: `Open stress ${kind}`, exact: true })).toBeFocused();
  });
}

test.describe("coarse pointer", () => {
  test.use({ hasTouch: true });
  test("expanded marks keep clearance and compact controls remain tappable", async ({ page }) => {
    expect(await page.evaluate(() => matchMedia("(pointer: coarse)").matches)).toBe(true);
    const first = page.getByRole("checkbox", { name: "First checkbox" });
    const second = page.getByRole("checkbox", { name: "Second checkbox" });
    await first.scrollIntoViewIfNeeded();
    const a = (await first.boundingBox())!;
    const b = (await second.boundingBox())!;
    expect(b.x - (a.x + a.width)).toBeGreaterThanOrEqual(20);
    const hit = await first.evaluate(el => {
      const r = el.getBoundingClientRect();
      const s = getComputedStyle(el, "::after");
      return { x: r.x + parseFloat(getComputedStyle(el).borderLeftWidth) + parseFloat(s.left) + 2, y: r.y + r.height / 2, width: parseFloat(s.width) };
    });
    expect(hit.width).toBeGreaterThanOrEqual(44);
    await page.touchscreen.tap(hit.x, hit.y);
    await expect(first).toBeChecked();
    await expect(second).not.toBeChecked();
    const chip = page.getByRole("button", { name: /^Remove project_/ });
    const target = await chip.evaluate(el => { const s = getComputedStyle(el, "::after"); return parseFloat(s.width); });
    expect(target).toBeCloseTo(44, 0);
    await chip.tap();
    const increment = page.getByTestId("hostile-grid").getByRole("button", { name: "Increase", exact: true });
    const size = (await increment.boundingBox())!;
    expect(size.width).toBeGreaterThanOrEqual(44);
    expect(size.height).toBeGreaterThanOrEqual(44);
    await increment.tap();
    await expect(page.getByRole("textbox", { name: "Stress number" })).toHaveValue("123,456,790");
  });
});

test("fields yield to siblings in narrow flex rows", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 720 });
  const failures = await page.getByTestId("flex-fields").evaluate(section => Array.from(section.children).flatMap(row => {
    const bounds = row.getBoundingClientRect();
    return Array.from(row.children).filter(el => !el.matches('input[aria-hidden="true"]')).flatMap(el => {
      const box = el.getBoundingClientRect();
      return box.right > bounds.right + 1 ? [el.textContent || el.tagName] : [];
    });
  }));
  expect(failures).toEqual([]);
  await noPageOverflow(page);
});

test("wide tracks, tables and code scroll locally instead of losing content", async ({ page }) => {
  const grid = page.getByTestId("hostile-grid");
  for (const label of ["Stress segments", "Stress toggles", "Stress tabs"]) {
    const track = page.getByRole(label === "Stress tabs" ? "tablist" : "group", { name: label });
    const last = track.getByRole(label === "Stress tabs" ? "tab" : "button").last();
    await last.focus();
    const scroller = label === "Stress tabs" ? track.locator("..") : track;
    await expect.poll(() => scroller.evaluate(el => el.scrollLeft), { message: label }).toBeGreaterThan(0);
    const inner = (await last.boundingBox())!;
    const outer = (await scroller.boundingBox())!;
    expect(inner.x + inner.width).toBeLessThanOrEqual(outer.x + outer.width + 1);
  }
  for (const scroller of [grid.getByRole("table").first().locator(".."), grid.getByRole("table").last().locator(".."), grid.locator("pre")]) {
    const widths = await scroller.evaluate(el => ({ scroll: el.scrollWidth, client: el.clientWidth }));
    expect(widths.scroll).toBeGreaterThan(widths.client);
    await scroller.evaluate(el => { el.scrollLeft = el.scrollWidth; });
    expect(await scroller.evaluate(el => el.scrollLeft)).toBeGreaterThan(0);
  }
  await noPageOverflow(page);
});
