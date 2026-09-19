import { expect, test, isTopmost, type Locator, type Page } from "./fixtures";

/* A sheet is a dialog with an edge, so most of what is asserted here is the dialog contract
   holding at an edge: the same scrim, the same trap, the same dismissal, the same scroll lock.
   What is the sheet's own is placement, the square corners against the edge it is attached to,
   and the direction it arrives from. */

test.use({ reducedMotion: "no-preference" });

const sheet = (page: Page) => page.getByRole("dialog");
const open = (page: Page, side: "right" | "left" | "bottom" | "top") =>
  page.getByRole("button", { name: `Open ${side} sheet` }).click();

/* A surface is only where it ends up once its own entrance has finished, and the entrance is
   part of what this suite asserts, so every geometric check waits for the popup to stop moving. */
const settled = (page: Page) =>
  page.waitForFunction(
    () => document.querySelector('[role="dialog"]')?.getAnimations().length === 0
  );

/* The transform a sheet is painted at when its entrance begins. Paused and seeked to the start of
   its own transition, because a running one is only sampled by luck, and decomposed so a travel
   along one axis can be told from a travel along both. */
const startingTravel = (popup: Locator) =>
  popup.evaluate((element) => {
    element.getAnimations().forEach((animation) => {
      animation.pause();
      animation.currentTime = 0;
    });
    const style = getComputedStyle(element);
    const matrix = new DOMMatrix(style.transform === "none" ? "" : style.transform);
    return {
      x: Number(matrix.e.toFixed(2)),
      y: Number(matrix.f.toFixed(2)),
      scale: Number(matrix.a.toFixed(3)),
      width: Math.round(element.getBoundingClientRect().width),
      height: Math.round(element.getBoundingClientRect().height),
      from: [
        style.getPropertyValue("--sui-sheet-from-x").trim(),
        style.getPropertyValue("--sui-sheet-from-y").trim(),
      ],
    };
  });

/* The page's own scroll lock is applied to whichever of `html` and `body` establishes the
   viewport, so the assertion asks the same question the lock does. */
const pageScrollLocked = (page: Page) =>
  page.evaluate(() => {
    const html = getComputedStyle(document.documentElement).overflowY;
    const body = getComputedStyle(document.body).overflowY;
    return html === "hidden" || body === "hidden";
  });

const focusInside = (page: Page) =>
  page.evaluate(() => {
    const active = document.activeElement;
    const dialog = document.querySelector('[role="dialog"]');
    return Boolean(dialog && active && dialog.contains(active));
  });

test.beforeEach(async ({ page }) => {
  await page.goto("/verification/interactions");
  await page.waitForFunction(() => document.documentElement.dataset.hydrated === "true");
});

/* One edge means one axis. A sheet that travels on both enters diagonally — from a corner rather
   than from the edge it is attached to — which reads as a surface arriving from somewhere it was
   never placed. */
const edges = [
  { side: "right", axis: "x", sign: 1 },
  { side: "left", axis: "x", sign: -1 },
  { side: "bottom", axis: "y", sign: 1 },
  { side: "top", axis: "y", sign: -1 },
] as const;

for (const { side, axis, sign } of edges) {
  test(`a ${side} sheet enters along its own edge and along nothing else`, async ({ page, errors }) => {
    await open(page, side);
    const popup = sheet(page);
    await popup.waitFor({ state: "visible" });

    const travel = await startingTravel(popup);
    const own = axis === "x" ? travel.x : travel.y;
    const other = axis === "x" ? travel.y : travel.x;
    /* The offset is the sheet's own extent: it begins entirely outside the viewport, which is what
       makes it a slide rather than a lift. */
    const extent = axis === "x" ? travel.width : travel.height;

    expect(other).toBe(0);
    expect(Math.sign(own)).toBe(sign);
    expect(Math.abs(own)).toBe(extent);
    /* A sheet never scales: it is a surface arriving, not a part being made. */
    expect(travel.scale).toBe(1);

    /* The axis the component did not set falls back to nothing rather than to a full extent —
       the whole reason a side sheet can travel on one axis only. */
    expect(travel.from).toEqual(
      axis === "x" ? [`${sign * 100}%`, ""] : ["", `${sign * 100}%`]
    );

    expect(errors).toEqual([]);
  });
}

test("reduced motion keeps the arrival and removes the travel", async ({ page, errors }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await open(page, "right");
  const popup = sheet(page);
  await popup.waitFor({ state: "visible" });

  const state = await popup.evaluate((element) => {
    element.getAnimations().forEach((animation) => {
      animation.pause();
      animation.currentTime = 0;
    });
    const style = getComputedStyle(element);
    const matrix = new DOMMatrix(style.transform === "none" ? "" : style.transform);
    return {
      transition: style.transitionProperty,
      opacity: Number(style.opacity),
      x: matrix.e,
      y: matrix.f,
    };
  });

  /* The interpolation is gone, not the state: a sheet still reads as arriving, through its
     opacity, and it is never carried out of an edge it is not attached to. */
  expect(state.transition).toBe("opacity");
  expect(state.x).toBe(0);
  expect(state.y).toBe(0);
  expect(state.opacity).toBe(0);

  expect(errors).toEqual([]);
});

test("a sheet is attached to its edge, above the page, and never leaves the viewport", async ({
  page,
  errors,
}) => {
  await open(page, "right");

  const popup = sheet(page);
  await popup.waitFor({ state: "visible" });
  await settled(page);
  await expect(page.getByTestId("sheet-state")).toHaveText("open");
  expect(await isTopmost(popup)).toBe(true);

  const geometry = await popup.evaluate((element) => {
    const box = element.getBoundingClientRect();
    const style = getComputedStyle(element);
    return {
      right: box.right,
      width: box.width,
      transition: style.transitionProperty,
      innerRadius: Number.parseFloat(style.borderTopLeftRadius),
      attachedRadius: Number.parseFloat(style.borderTopRightRadius),
      viewport: window.innerWidth,
    };
  });

  /* Flush to the edge it is attached to. */
  expect(Math.abs(geometry.right - geometry.viewport)).toBeLessThanOrEqual(1);
  expect(geometry.width).toBeGreaterThan(240);
  /* The travel is a transform and an opacity, on the presence recipe's own timing. */
  expect(geometry.transition).toContain("transform");
  expect(geometry.transition).toContain("opacity");
  /* `shape` supplies the radius on the corner that faces away from the edge, and the attached
     corner is square — a rounded one there would draw a gap against the viewport. The exposed
     radius is the sheet's own role, one step tighter than a dialog's: a surface meeting an edge is
     read as an extension of the page, not as an oversized floating card. Read from the token, so
     the assertion follows the ladder rather than a number written here. */
  const prominentRadius = await page.evaluate(() => {
    const probe = document.createElement("div");
    probe.style.borderRadius = "1.5rem";
    document.body.appendChild(probe);
    const value = Number.parseFloat(getComputedStyle(probe).borderRadius);
    probe.remove();
    return value;
  });
  expect(geometry.innerRadius).toBe(prominentRadius);
  expect(geometry.attachedRadius).toBe(0);

  expect(errors).toEqual([]);
});

test("a sheet owns the page while it is open and gives it back when it closes", async ({
  page,
  errors,
}) => {
  expect(await pageScrollLocked(page)).toBe(false);

  await open(page, "right");
  await expect(sheet(page)).toBeVisible();
  await expect.poll(() => pageScrollLocked(page)).toBe(true);

  await page.keyboard.press("Escape");
  await expect(sheet(page)).toHaveCount(0);
  await expect.poll(() => pageScrollLocked(page)).toBe(false);

  expect(errors).toEqual([]);
});

test("focus enters the sheet, is trapped inside it, and returns to the trigger", async ({
  page,
  errors,
}) => {
  await open(page, "right");
  await expect(sheet(page)).toBeVisible();

  await expect.poll(() => focusInside(page)).toBe(true);

  /* The sheet holds three tabbables, so a trap that did not wrap would leave it well before the
     twelfth press. Each press is awaited on the settled focus, because the guard's redirect is
     queued in a frame rather than applied inside the key event. */
  for (let index = 0; index < 12; index += 1) {
    await page.keyboard.press("Tab");
    await expect.poll(() => focusInside(page)).toBe(true);
  }

  /* And backwards, where the other guard is the one that answers. */
  for (let index = 0; index < 6; index += 1) {
    await page.keyboard.press("Shift+Tab");
    await expect.poll(() => focusInside(page)).toBe(true);
  }

  await page.keyboard.press("Escape");
  await expect(sheet(page)).toHaveCount(0);
  await expect
    .poll(() => page.evaluate(() => document.activeElement?.textContent?.trim() ?? ""))
    .toBe("Open right sheet");

  expect(errors).toEqual([]);
});

test("an outside press and the sheet's own dismissal control both close it", async ({ page, errors }) => {
  await open(page, "right");
  await expect(sheet(page)).toBeVisible();
  await page.mouse.click(40, 400);
  await expect(sheet(page)).toHaveCount(0);
  await expect(page.getByTestId("sheet-state")).toHaveText("closed");

  await open(page, "right");
  await expect(sheet(page)).toBeVisible();
  await page.getByRole("button", { name: "Close" }).click();
  await expect(sheet(page)).toHaveCount(0);

  expect(errors).toEqual([]);
});

test("an action in the sheet's own footer closes it", async ({ page, errors }) => {
  await open(page, "right");
  await expect(sheet(page)).toBeVisible();

  await page.getByRole("button", { name: "Confirm" }).click();
  await expect(sheet(page)).toHaveCount(0);
  await expect(page.getByTestId("sheet-state")).toHaveText("closed");

  expect(errors).toEqual([]);
});
