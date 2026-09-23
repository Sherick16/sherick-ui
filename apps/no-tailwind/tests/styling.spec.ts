import { expect, test, type Page } from "@playwright/test";

const runtimeErrors = (page: Page) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(`pageerror: ${error.message}`));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(`console: ${message.text()}`);
  });
  return errors;
};

const genericUtilityStyle = async (locator: ReturnType<Page["getByTestId"]>) =>
  locator.evaluate((element) => {
    const style = getComputedStyle(element);
    return {
      display: style.display,
      position: style.position,
      paddingLeft: style.paddingLeft,
      borderRadius: style.borderRadius,
    };
  });

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await expect(page.getByTestId("no-tailwind-ready")).toBeVisible();
});

test("package CSS styles Sherick components but never generic consumer descendants", async ({ page }) => {
  const errors = runtimeErrors(page);

  const siblingSentinel = await genericUtilityStyle(page.getByTestId("css-leak-sentinel"));
  expect(siblingSentinel).toEqual({
    display: "block",
    position: "static",
    paddingLeft: "0px",
    borderRadius: "0px",
  });

  for (const testId of ["button-child-leak-sentinel", "card-child-leak-sentinel"]) {
    const style = await genericUtilityStyle(page.getByTestId(testId));
    expect(style, `${testId} inherited a Sherick generic utility`).toEqual({
      display: "inline",
      position: "static",
      paddingLeft: "0px",
      borderRadius: "0px",
    });
  }

  const button = page.getByRole("button", { name: "Primary" });
  const buttonStyle = await button.evaluate((element) => {
    const style = getComputedStyle(element);
    return {
      display: style.display,
      borderRadius: style.borderRadius,
      minHeight: style.minHeight,
    };
  });

  expect(["flex", "inline-flex"]).toContain(buttonStyle.display);
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
  const tooltip = page.getByText("Portaled tooltip");
  await expect(tooltip).toBeVisible();
  const tooltipStyle = await tooltip.evaluate((element) => getComputedStyle(element));
  expect(tooltipStyle.boxShadow).not.toBe("none");
  expect(parseFloat(tooltipStyle.borderRadius)).toBeGreaterThan(0);

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

test("portaled Wave B surfaces remain scoped and styled", async ({ page }) => {
  const errors = runtimeErrors(page);

  /* Each popup is portaled out of the page subtree, so the stylesheet can only style it because
     the subtree establishes the same private scope every other Sherick surface does. */
  const popupShell = page.locator(".sui-scope.shadow-sherick-floating");

  await page.getByRole("button", { name: "Portaled popover" }).click();
  await expect(page.getByText("Popover content")).toBeVisible();
  const popover = await popupShell.evaluate((element) => {
    const style = getComputedStyle(element);
    return {
      portaled: element.closest("main") === null,
      radius: parseFloat(style.borderRadius),
      shadow: style.boxShadow,
      backdrop: style.backdropFilter,
    };
  });
  expect(popover.portaled).toBe(true);
  expect(popover.radius).toBeGreaterThan(0);
  expect(popover.shadow).not.toBe("none");
  expect(popover.backdrop).toContain("blur");
  await page.keyboard.press("Escape");

  await page.getByRole("button", { name: "Portaled menu" }).click();
  const menuItem = page.getByRole("menuitem", { name: "Delete" });
  await expect(menuItem).toBeVisible();
  expect(await menuItem.evaluate((element) => getComputedStyle(element).borderRadius)).not.toBe("0px");
  await page.keyboard.press("Escape");

  await page.getByRole("combobox", { name: "Portaled combobox" }).click();
  const option = page.getByRole("option", { name: "Dashboard" });
  await expect(option).toBeVisible();
  expect(await option.evaluate((element) => getComputedStyle(element).borderRadius)).not.toBe("0px");
  await page.keyboard.press("Escape");

  /* The alert dialog is a surface of its own with its own role, styled by package CSS alone. */
  await page.getByRole("button", { name: "Open portaled alert" }).click();
  const alertDialog = page.getByRole("alertdialog");
  await expect(alertDialog).toBeVisible();
  const alertStyle = await alertDialog.evaluate((element) => {
    const style = getComputedStyle(element);
    return { radius: parseFloat(style.borderRadius), shadow: style.boxShadow };
  });
  expect(alertStyle.radius).toBeGreaterThan(0);
  expect(alertStyle.shadow).not.toBe("none");

  const confirm = alertDialog.getByRole("button", { name: "Delete" });
  expect(await confirm.evaluate((element) => getComputedStyle(element).backgroundColor)).not.toBe(
    "rgba(0, 0, 0, 0)"
  );

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
  await expect(page.locator("pre.prism-code .token.keyword").first()).toBeVisible();
  expect(errors).toEqual([]);
});

test("a nested icon node keeps the mark slot and the target size", async ({ page }) => {
  const errors = runtimeErrors(page);

  /* The fixture passes a text node as the icon, which no SVG-only selector can size: the slot
     has to own its own box for the mark to stay 20px and the target to stay 44px. */
  const add = page.getByRole("button", { name: "Add" });
  await expect(add).toBeVisible();

  const geometry = await add.evaluate((button) => {
    const slot = button.firstElementChild;
    if (!slot) throw new Error("the icon button has a mark slot");
    const target = button.getBoundingClientRect();
    const mark = slot.getBoundingClientRect();
    return {
      target: { width: target.width, height: target.height },
      mark: { width: mark.width, height: mark.height },
    };
  });

  expect(geometry.mark.width, "the slot owns its own box").toBeCloseTo(20, 1);
  expect(geometry.mark.height).toBeCloseTo(20, 1);
  expect(geometry.target.width).toBeGreaterThanOrEqual(44);
  expect(geometry.target.height).toBeGreaterThanOrEqual(44);

  /* The non-shrinking half lives in the slot, not in `Spinner` itself: a *labelled* spinner is a
     mark and a label, and it has to be allowed to shrink in a narrow row. So the slot holds its
     box, and the status wrapper stays shrinkable. */
  const shrink = await Promise.all([
    add.evaluate((button) => getComputedStyle(button.firstElementChild as Element).flexShrink),
    page
      .getByRole("status")
      .first()
      .evaluate((element) => getComputedStyle(element).flexShrink),
  ]);
  expect(shrink[0], "the mark slot refuses to shrink").toBe("0");
  expect(shrink[1], "a labelled spinner is allowed to").not.toBe("0");

  expect(errors).toEqual([]);
});

test("held options share control elevation without raising navigation highlight", async ({ page }) => {
  const errors = runtimeErrors(page);
  for (const theme of ["light", "dark"]) {
    await page.evaluate(theme => { document.documentElement.dataset.sherickTheme = theme; }, theme);
    const reference = page.getByRole("button", { name: "Comfortable", exact: true });
    const depth = await reference.evaluate(element => getComputedStyle(element).boxShadow);
    for (const name of ["Project type", "Portaled combobox"]) {
      await page.getByRole("combobox", { name, exact: true }).click();
      const chosen = page.getByRole("option", { name: "Design system", exact: true });
      const other = page.getByRole("option", { name: "Dashboard", exact: true });
      await expect(chosen).toHaveAttribute("aria-selected", "true");
      await other.hover();
      await expect(other).toHaveAttribute("data-highlighted", "");
      await expect.poll(() => chosen.evaluate(element => getComputedStyle(element).boxShadow)).toBe(depth);
      expect(await other.evaluate(element => getComputedStyle(element).boxShadow)).toBe("none");
      await page.keyboard.press("Escape");
      await expect(other).toHaveCount(0);
    }
  }
  expect(errors).toEqual([]);
});
