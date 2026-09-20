import { expect, test, type Locator, type Page } from "./fixtures";

/*
 The optical-balance specimens exist so the anatomy a reviewer judges by eye also has a
 deterministic contract. Nothing here asserts a pixel: every check reads geometry the browser
 computed — a slot's own box, a target's size, the side a logical property resolved to, and the
 line a mark is centred on.

 The showcase page carries a pre-existing CodeBlock hydration warning, so this spec makes no
 runtime-error claim.
*/

const openShowcase = async (page: Page) => {
  await page.goto("/");
  await page.waitForFunction(() => document.documentElement.dataset.hydrated === "true");
  return page.locator("#optical-balance");
};

/* The distance from the control's own box to its surface's inline **end** edge, read from the
   rendered direction rather than from the test's. */
const endInset = (control: Locator) =>
  control.evaluate((element) => {
    const box = element.parentElement;
    if (!box) throw new Error("the control has no surface");
    const surfaceBox = box.getBoundingClientRect();
    const controlBox = element.getBoundingClientRect();
    return getComputedStyle(element).direction === "rtl"
      ? controlBox.left - surfaceBox.left
      : surfaceBox.right - controlBox.right;
  });

test("a loading mark takes the slot its icon had, without changing the control", async ({ page }) => {
  const section = await openShowcase(page);

  // The two buttons share one label; the first is idle and the second is loading.
  const download = section.getByRole("button", { name: "Download", exact: true });
  await expect(download).toHaveCount(2);
  const [idle, busy] = [download.nth(0), download.nth(1)];

  const idleButton = await idle.boundingBox();
  const busyButton = await busy.boundingBox();
  expect(busyButton?.width, "entering the loading state must not resize the control").toBe(idleButton?.width);
  expect(busyButton?.height).toBe(idleButton?.height);

  const idleMark = await idle.locator("svg").first().boundingBox();
  const busyMark = await busy.locator("svg").first().boundingBox();
  expect(busyMark?.width, "a loading mark is the same mark").toBe(idleMark?.width);
  expect(busyMark?.height).toBe(idleMark?.height);

  // The icon-only control is the same rule with no label to hide behind.
  const iconIdle = await section.getByRole("button", { name: "Notification mark" }).boundingBox();
  const iconBusy = await section.getByRole("button", { name: "Notification loading" }).boundingBox();
  expect(iconBusy?.width).toBe(iconIdle?.width);
  expect(iconBusy?.height).toBe(iconIdle?.height);
});

test("a chip's dismiss mark keeps its target and its edge distance", async ({ page }) => {
  const section = await openShowcase(page);
  const dismiss = section.getByRole("button", { name: "Remove Platform" });
  await expect(dismiss).toBeVisible();

  const target = await dismiss.boundingBox();
  expect(target?.width, "a dismiss control clears the 24px pointer minimum").toBeGreaterThanOrEqual(24);
  expect(target?.height).toBeGreaterThanOrEqual(24);

  const leftToRight = await endInset(dismiss);
  await page.evaluate(() => {
    document.documentElement.dir = "rtl";
  });
  const rightToLeft = await endInset(dismiss);

  expect(leftToRight).toBeGreaterThan(0);
  expect(rightToLeft, "the compensation is a logical margin, so RTL mirrors it").toBeCloseTo(leftToRight, 0);
});

test("a field's embedded mark follows the writing direction", async ({ page }) => {
  const section = await openShowcase(page);
  const field = section.getByPlaceholder("Embedded mark").locator("..");
  const submit = field.getByRole("button", { name: "Submit search" });
  await expect(submit).toBeVisible();

  const leftToRight = await endInset(submit);
  await page.evaluate(() => {
    document.documentElement.dir = "rtl";
  });
  const rightToLeft = await endInset(submit);

  expect(leftToRight).toBeGreaterThan(0);
  expect(rightToLeft, "the submit control has to stay at the field's own end").toBeCloseTo(leftToRight, 0);
});

test("a status mark and a dismissal hold the first line of copy that wraps", async ({ page }) => {
  const section = await openShowcase(page);
  const alert = section.getByRole("alert").filter({ hasText: "Review these settings" });
  await expect(alert).toBeVisible();

  const geometry = await alert.evaluate((element) => {
    const mark = element.querySelector("span");
    const copy = element.querySelector("div");
    const dismiss = element.querySelector("button");
    if (!mark || !copy || !dismiss) throw new Error("an alert has a mark, a copy and a dismissal");

    const range = document.createRange();
    range.selectNodeContents(copy);
    const lines = range.getClientRects();
    const first = lines[0];
    if (!first) throw new Error("the alert copy has a first line");

    const centre = (box: DOMRect) => box.top + box.height / 2;
    return {
      lines: lines.length,
      firstLineCentre: centre(first),
      markCentre: centre(mark.getBoundingClientRect()),
      dismissCentre: centre(dismiss.getBoundingClientRect()),
    };
  });

  expect(geometry.lines, "the specimen has to wrap for this to mean anything").toBeGreaterThan(1);
  expect(Math.abs(geometry.markCentre - geometry.firstLineCentre)).toBeLessThanOrEqual(1);
  expect(Math.abs(geometry.dismissCentre - geometry.firstLineCentre)).toBeLessThanOrEqual(1);
});

test("a toast's dismissal is not clipped by the stack that owns the overflow", async ({ page }) => {
  const section = await openShowcase(page);
  await section.getByRole("button", { name: "Status mark" }).click();

  /* The stack carries the toast root, and Base keeps its dismissal control out of the reading
     order until the stack is engaged — which hovering it is. */
  const toast = page.getByRole("region", { name: "Notifications" }).locator(":scope > *").last();
  await toast.hover();
  const dismiss = toast.getByRole("button", { name: "Dismiss", exact: true });
  await expect(dismiss).toBeVisible();

  /* The root clips its own content, so every edge of the 44px target — and the inset ring it
     wears — has to stay inside it. */
  const clearance = await toast.evaluate((root) => {
    const button = root.querySelector('button[aria-label="Dismiss"]');
    if (!button) throw new Error("the toast has its own dismissal control");
    const outer = root.getBoundingClientRect();
    const inner = button.getBoundingClientRect();
    return [inner.top - outer.top, inner.left - outer.left, outer.right - inner.right, outer.bottom - inner.bottom];
  });

  expect(Math.min(...clearance)).toBeGreaterThanOrEqual(0);
});
