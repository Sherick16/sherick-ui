import { expect, test, type Locator, type Page } from "./fixtures";

/*
 The design language's §17 makes optical balance a property of every control rather than a
 section of the showcase, so the invariants it states are asserted against the components where
 they actually live. Nothing here asserts a pixel: every check reads geometry the browser
 computed — a slot's own box, a target's size, the side a logical property resolved to, and the
 line a mark is centred on.

 The showcase page carries a pre-existing CodeBlock hydration warning, so this spec makes no
 runtime-error claim.
*/

const openShowcase = async (page: Page, section: string) => {
  await page.goto("/");
  await page.waitForFunction(() => document.documentElement.dataset.hydrated === "true");
  return page.locator(`#${section}`);
};

/** The box of a control's mark **slot** — its first child — not of the artwork inside it. */
const slotBox = (control: Locator) =>
  control.evaluate((element) => {
    const slot = element.firstElementChild;
    if (!slot) throw new Error("the control has a mark slot");
    const rect = slot.getBoundingClientRect();
    return { width: rect.width, height: rect.height };
  });

/** A chip's dismiss target, the visible mark inside it, and the chip's own leading content. */
const chipGeometry = (dismiss: Locator) =>
  dismiss.evaluate((button) => {
    const chip = button.parentElement;
    if (!chip) throw new Error("a dismiss control belongs to a chip");
    const mark = button.querySelector("svg");
    const leading = chip.firstElementChild;
    if (!mark || !leading) throw new Error("a chip has leading content and its dismiss control a mark");

    const chipBox = chip.getBoundingClientRect();
    const targetBox = button.getBoundingClientRect();
    const markBox = mark.getBoundingClientRect();
    const leadingBox = leading.getBoundingClientRect();
    const rtl = getComputedStyle(button).direction === "rtl";

    return {
      target: { width: targetBox.width, height: targetBox.height },
      markInset: rtl ? markBox.left - chipBox.left : chipBox.right - markBox.right,
      leadingInset: rtl ? chipBox.right - leadingBox.right : leadingBox.left - chipBox.left,
    };
  });

test("a loading mark takes the slot its icon had, without changing the control", async ({ page }) => {
  const section = await openShowcase(page, "buttons");

  // Two buttons share one label; the first is at rest and the second is loading.
  const exports = section.getByRole("button", { name: "Export", exact: true });
  await expect(exports).toHaveCount(2);
  const [idle, busy] = [exports.nth(0), exports.nth(1)];

  const idleButton = await idle.boundingBox();
  const busyButton = await busy.boundingBox();
  expect(busyButton?.width, "entering the loading state must not resize the control").toBe(idleButton?.width);
  expect(busyButton?.height).toBe(idleButton?.height);

  const idleSlot = await slotBox(idle);
  const busySlot = await slotBox(busy);
  expect(busySlot.width, "a loading mark is the same mark").toBe(idleSlot.width);
  expect(busySlot.height).toBe(idleSlot.height);
  expect(idleSlot.width, "the slot owns its own box").toBeCloseTo(20, 1);
  expect(idleSlot.height).toBeCloseTo(20, 1);

  // The icon-only control is the same rule with no label to hide behind.
  const iconIdle = await section.getByRole("button", { name: "Notifications", exact: true }).boundingBox();
  const iconBusy = await section.getByRole("button", { name: "Saving notifications", exact: true }).boundingBox();
  expect(iconBusy?.width).toBe(iconIdle?.width);
  expect(iconBusy?.height).toBe(iconIdle?.height);
});

test("a chip's dismiss mark keeps its target and its edge distance", async ({ page }) => {
  const section = await openShowcase(page, "selection");
  const dismiss = section.getByRole("button", { name: "Remove Platform" });
  await expect(dismiss).toBeVisible();

  const leftToRight = await chipGeometry(dismiss);
  expect(leftToRight.target.width, "a dismiss control clears the 24px pointer minimum").toBeGreaterThanOrEqual(24);
  expect(leftToRight.target.height).toBeGreaterThanOrEqual(24);
  /* The visible mark — not the target's box — sits at the inset the chip's own leading content
     uses. Without the compensation the mark is six pixels further in. */
  expect(
    Math.abs(leftToRight.markInset - leftToRight.leadingInset),
    "the visible mark sits at the inset the chip's leading content uses",
  ).toBeLessThanOrEqual(2);

  await page.evaluate(() => {
    document.documentElement.dir = "rtl";
  });
  const rightToLeft = await chipGeometry(dismiss);
  expect(rightToLeft.markInset, "the compensation is a logical margin, so RTL mirrors it").toBeCloseTo(
    leftToRight.markInset,
    0,
  );
  expect(Math.abs(rightToLeft.markInset - rightToLeft.leadingInset)).toBeLessThanOrEqual(2);
});

test("a field's embedded mark follows the writing direction", async ({ page }) => {
  const section = await openShowcase(page, "fields");
  const field = section.getByPlaceholder("Search components").locator("..");
  const submit = field.getByRole("button", { name: "Submit search" });
  await expect(submit).toBeVisible();

  const endInset = (control: Locator) =>
    control.evaluate((element) => {
      const surface = element.parentElement;
      if (!surface) throw new Error("the control has no surface");
      const surfaceBox = surface.getBoundingClientRect();
      const controlBox = element.getBoundingClientRect();
      return getComputedStyle(element).direction === "rtl"
        ? controlBox.left - surfaceBox.left
        : surfaceBox.right - controlBox.right;
    });

  const leftToRight = await endInset(submit);
  await page.evaluate(() => {
    document.documentElement.dir = "rtl";
  });
  const rightToLeft = await endInset(submit);

  expect(leftToRight).toBeGreaterThan(0);
  expect(rightToLeft, "the submit control has to stay at the field's own end").toBeCloseTo(leftToRight, 0);
});

test("a status mark and a dismissal hold the first line of copy that wraps", async ({ page }) => {
  const section = await openShowcase(page, "feedback");
  const alert = section.getByRole("alert").filter({ hasText: "The connection dropped" });
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

test("a toast's dismissal keeps its ring inside the stack that clips it", async ({ page }) => {
  const section = await openShowcase(page, "feedback");
  await section.getByRole("button", { name: "Warning", exact: true }).click();

  /* The stack carries the toast root, and Base keeps its dismissal control out of the reading
     order until the stack is engaged — which hovering it is. */
  const toast = page.getByRole("region", { name: "Notifications" }).locator(":scope > *").last();
  await toast.hover();
  const dismiss = toast.getByRole("button", { name: "Dismiss", exact: true });
  await expect(dismiss).toBeVisible();

  // One keyboard press first, so the platform reports the scripted focus as visible.
  await page.keyboard.press("Tab");
  await dismiss.focus();

  const ring = await dismiss.evaluate((button) => {
    const style = getComputedStyle(button);
    const root = button.closest("div[class*='overflow-hidden']");
    if (!root) throw new Error("a toast's dismissal lives inside the clipped stack root");
    const outer = root.getBoundingClientRect();
    const inner = button.getBoundingClientRect();
    return {
      focusVisible: button.matches(":focus-visible"),
      shadow: style.boxShadow,
      outlineColor: style.outlineColor,
      clearance: [inner.top - outer.top, inner.left - outer.left, outer.right - inner.right, outer.bottom - inner.bottom],
    };
  });

  expect(ring.focusVisible, "the ring only exists while the dismissal is visibly focused").toBe(true);
  expect(ring.shadow, "the visible ring is drawn inside the target").toContain("inset");
  expect(ring.outlineColor, "and nothing is painted outside the target the stack clips").toBe("rgba(0, 0, 0, 0)");
  expect(Math.min(...ring.clearance)).toBeGreaterThanOrEqual(0);
});
