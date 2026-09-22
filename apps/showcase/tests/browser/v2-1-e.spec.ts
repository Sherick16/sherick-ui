import { expect, test, type Locator, type Page } from "./fixtures";

/* The Stepper unit's browser fixture. It proves what the component contracts on — informative versus
   interactive semantics, which step is current, how completion is stated, what a disabled step and a
   rejected change do, and that long sequences adapt instead of widening the page — through roles,
   accessible names, focus and geometry rather than through internal class names. */

const openFixture = async (page: Page) => {
  await page.goto("/verification/v2-1-e");
  await expect(page.getByTestId("verification-v2-1-e")).toBeVisible();
  await page.waitForFunction(() => document.documentElement.dataset.hydrated === "true");
};

const step = (nav: Locator, name: RegExp) => nav.getByRole("button", { name });

const boxes = (items: Locator) =>
  items.evaluateAll((nodes) =>
    nodes.map((node) => {
      const box = node.getBoundingClientRect();
      return { top: Math.round(box.top), left: Math.round(box.left), width: Math.round(box.width) };
    })
  );

test.beforeEach(async ({ page }) => {
  await openFixture(page);
});

test("an informative list is text and an interactive one is native buttons", async ({ page, errors }) => {
  const informative = page.getByRole("navigation", { name: "Progress steps" });
  const interactive = page.getByRole("navigation", { name: "Checkout progress" });

  /* The default name is the component's own; a consumer overrides it like any nav. */
  await expect(informative).toHaveCount(1);
  await expect(informative.getByText("Review")).toBeVisible();

  /* Nothing to activate: informative steps and their container need no tab stops. */
  await expect(informative.locator("button, a, [tabindex]")).toHaveCount(0);
  await expect(informative).not.toHaveAttribute("tabindex");

  /* Every step of an interactive list is a real native button, the disabled one included. */
  await expect(interactive.getByRole("button")).toHaveCount(4);

  expect(errors).toEqual([]);
});

test("current, complete and remaining steps state themselves beyond colour", async ({ page, errors }) => {
  const nav = page.getByRole("navigation", { name: "Checkout progress" });

  /* Exactly one step is current, and it says so on the element that carries the step. */
  await expect(nav.locator("[aria-current]")).toHaveCount(1);
  const current = step(nav, /Shipping details/);
  await expect(current).toHaveAttribute("aria-current", "step");

  /* The current step keeps its own position rather than a completion mark. */
  await expect(current).toHaveAccessibleName(/\b2\b/);
  await expect(current.locator("svg")).toHaveCount(0);

  /* A complete step carries a mark and the word, so its state is not carried by tone alone. */
  const complete = step(nav, /Cart/);
  await expect(complete).not.toHaveAttribute("aria-current", "step");
  await expect(complete.locator("svg")).toHaveCount(1);
  await expect(complete).toHaveAccessibleName(/Complete/);

  /* A step that is neither keeps its ordered number, and the description is readable copy. */
  const remaining = step(nav, /Payment/);
  await expect(remaining).toHaveAccessibleName(/\b3\b/);
  await expect(remaining.locator("svg")).toHaveCount(0);
  await expect(nav.getByText("Courier and delivery window")).toBeVisible();

  expect(errors).toEqual([]);
});

test("current takes precedence when the consumer also marks that step complete", async ({ page, errors }) => {
  const nav = page.getByRole("navigation", { name: "Checkout progress" });
  const cart = step(nav, /Cart/);
  await cart.click();
  await expect(cart).toHaveAttribute("aria-current", "step");
  await expect(cart).toHaveAccessibleName(/\b1\b/);
  await expect(cart).not.toHaveAccessibleName(/Complete/);
  await expect(cart.locator("svg")).toHaveCount(0);
  expect(errors).toEqual([]);
});

test("the consumer owns the current step and can reject a reported change", async ({ page, errors }) => {
  const nav = page.getByRole("navigation", { name: "Checkout progress" });

  await step(nav, /Payment/).click();
  await expect(page.getByTestId("stepper-e-value")).toHaveText("payment");
  await expect(step(nav, /Payment/)).toHaveAttribute("aria-current", "step");
  await expect(nav.locator("[aria-current]")).toHaveCount(1);

  /* A consumer that ignores the callback keeps its own step: the component reports the requested
     value and renders the value it was given, holding no step state of its own. */
  const rejected = page.getByRole("navigation", { name: "Rejected progress" });
  await step(rejected, /Middle/).click();
  await expect(page.getByTestId("stepper-e-requested")).toHaveText("middle");
  await expect(page.getByTestId("stepper-e-attempts")).toHaveText("1");
  await expect(step(rejected, /Start/)).toHaveAttribute("aria-current", "step");
  await expect(rejected.locator("[aria-current]")).toHaveCount(1);

  expect(errors).toEqual([]);
});

test("a step is keyboard operable and a disabled step is skipped", async ({ page, errors }) => {
  const nav = page.getByRole("navigation", { name: "Checkout progress" });
  const payment = step(nav, /Payment/);

  /* The shared key-focus ring is what a keyboard user sees on the row. */
  await payment.focus();
  const ring = await payment.evaluate((element) => {
    const css = getComputedStyle(element);
    return { visible: element.matches(":focus-visible"), style: css.outlineStyle, width: css.outlineWidth };
  });
  expect(ring.visible).toBe(true);
  expect(ring.style).not.toBe("none");
  expect(ring.width).toBe("2px");

  await page.keyboard.press("Enter");
  await expect(page.getByTestId("stepper-e-value")).toHaveText("payment");

  await step(nav, /Cart/).focus();
  await page.keyboard.press(" ");
  await expect(page.getByTestId("stepper-e-value")).toHaveText("cart");

  /* Emphasis is that every step is a native button in the tab order, not a roving tab stop. */
  await step(nav, /Cart/).focus();
  await page.keyboard.press("Tab");
  await expect(step(nav, /Shipping details/)).toBeFocused();

  /* The disabled step cannot be reached: the next tab stop after Payment is outside this list. */
  await payment.focus();
  await page.keyboard.press("Tab");
  const focus = await page.evaluate(() => ({
    nav: document.activeElement?.closest("nav")?.getAttribute("aria-label") ?? null,
    disabled: document.activeElement instanceof HTMLButtonElement ? document.activeElement.disabled : null,
  }));
  expect(focus.nav).not.toBe("Checkout progress");
  expect(focus.disabled).not.toBe(true);

  expect(errors).toEqual([]);
});

test("a disabled step is disabled and a disabled list disables every step", async ({ page, errors }) => {
  const nav = page.getByRole("navigation", { name: "Checkout progress" });
  const review = step(nav, /Review and confirm/);
  await expect(review).toBeDisabled();

  /* A pointer press cannot activate it, so the consumer is never asked to move. */
  await review.click({ force: true });
  await expect(page.getByTestId("stepper-e-value")).toHaveText("shipping");
  await expect(nav.locator("[aria-current]")).toHaveCount(1);
  await expect(step(nav, /Cart/)).not.toBeDisabled();

  const locked = page.getByRole("navigation", { name: "Locked progress" });
  const lockedSteps = locked.getByRole("button");
  await expect(lockedSteps).toHaveCount(3);
  for (const button of await lockedSteps.all()) {
    await expect(button).toBeDisabled();
  }
  await lockedSteps.first().click({ force: true });
  await expect(page.getByTestId("stepper-e-locked")).toHaveText("none");

  expect(errors).toEqual([]);
});

test("null and unmatched current values leave every step uncurrent", async ({ page, errors }) => {
  const idle = page.getByRole("navigation", { name: "Idle progress" });
  await expect(idle.locator("[aria-current]")).toHaveCount(0);
  await expect(page.getByTestId("stepper-e-idle")).toHaveText("none");

  /* The workflow has not started, so its first step is not silently the current one. */
  await step(idle, /Import/).click();
  await expect(page.getByTestId("stepper-e-idle")).toHaveText("import");
  await expect(step(idle, /Import/)).toHaveAttribute("aria-current", "step");
  await expect(idle.locator("[aria-current]")).toHaveCount(1);

  const unknown = page.getByRole("navigation", { name: "Unknown progress" });
  await expect(unknown.locator("[aria-current]")).toHaveCount(0);

  expect(errors).toEqual([]);
});

test("vertical steps stack in one column while horizontal steps share a line", async ({ page, errors }) => {
  const vertical = page.getByRole("navigation", { name: "Vertical progress" });
  const verticalBoxes = await boxes(vertical.locator("li"));
  expect(verticalBoxes).toHaveLength(3);
  expect(verticalBoxes[1].top).toBeGreaterThan(verticalBoxes[0].top);
  expect(verticalBoxes[2].top).toBeGreaterThan(verticalBoxes[1].top);
  expect(Math.abs(verticalBoxes[1].left - verticalBoxes[0].left)).toBeLessThanOrEqual(1);
  expect(Math.abs(verticalBoxes[1].width - verticalBoxes[0].width)).toBeLessThanOrEqual(1);

  const horizontal = page.getByRole("navigation", { name: "Idle progress" });
  const horizontalBoxes = await boxes(horizontal.locator("li"));
  expect(horizontalBoxes).toHaveLength(3);
  expect(horizontalBoxes[1].top).toBe(horizontalBoxes[0].top);
  expect(horizontalBoxes[1].left).toBeGreaterThan(horizontalBoxes[0].left);
  expect(horizontalBoxes[2].left).toBeGreaterThan(horizontalBoxes[1].left);

  expect(errors).toEqual([]);
});

test("many steps become a readable vertical sequence in a narrow column", async ({ page, errors }) => {
  await page.setViewportSize({ width: 320, height: 900 });
  await openFixture(page);

  const container = page.getByTestId("stepper-e-narrow");
  const nav = container.getByRole("navigation", { name: "Long progress" });
  const items = nav.locator("li");
  await expect(items).toHaveCount(7);

  const width = await container.evaluate((element) => element.clientWidth);
  const itemBoxes = await boxes(items);
  for (const box of itemBoxes) {
    expect(box.width, `a step is ${box.width}px wide inside a ${width}px container`).toBeLessThanOrEqual(
      width + 1
    );
    expect(box.left).toBeGreaterThanOrEqual(0);
  }

  expect(new Set(itemBoxes.map(box => box.top)).size).toBe(7);
  expect(await nav.evaluate(element => element.scrollWidth - element.clientWidth)).toBeLessThanOrEqual(1);
  for (const direction of ["ltr", "rtl"]) {
    await page.evaluate(value => { document.documentElement.dir = value; }, direction);
    for (const target of await nav.getByRole("button").all()) {
      await target.focus();
      await expect(target).toBeFocused();
      const bounds = (await nav.boundingBox())!;
      const box = (await target.boundingBox())!;
      expect(box.x).toBeGreaterThanOrEqual(bounds.x);
      expect(box.x + box.width).toBeLessThanOrEqual(bounds.x + bounds.width);
      expect(await target.evaluate(element => element.scrollWidth - element.clientWidth)).toBeLessThanOrEqual(1);
    }
  }

  const documentBox = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
  expect(documentBox.scrollWidth).toBeLessThanOrEqual(documentBox.clientWidth);

  expect(errors).toEqual([]);
});

test("both step layouts retain logical alignment and order in RTL", async ({ page, errors }) => {
  for (const direction of ["ltr", "rtl"]) {
    await page.evaluate(value => { document.documentElement.dir = value; }, direction);
    for (const [name, stacked] of [["Checkout progress", false], ["Vertical progress", true]] as const) {
      const items = page.getByRole("navigation", { name }).locator("li");
      const track = (await items.first().locator("[data-sui-step-track]").boundingBox())!;
      const mark = (await items.first().locator("[data-sui-step-mark]").boundingBox())!;
      const label = (await items.first().getByText(stacked ? "Account" : "Cart", { exact: true }).boundingBox())!;
      if (stacked) {
        if (direction === "ltr") expect(mark.x + mark.width).toBeLessThan(label.x);
        else expect(label.x + label.width).toBeLessThan(mark.x);
      } else {
        expect(track.y + track.height).toBeLessThan(label.y);
        expect(Math.abs(mark.y - label.y)).toBeLessThanOrEqual(1);
        const start = direction === "ltr" ? track.x : track.x + track.width;
        const markStart = direction === "ltr" ? mark.x : mark.x + mark.width;
        expect(Math.abs(start - markStart)).toBeLessThanOrEqual(1);
        const second = (await items.nth(1).boundingBox())!;
        const first = (await items.first().boundingBox())!;
        if (direction === "ltr") expect(first.x).toBeLessThan(second.x);
        else expect(first.x).toBeGreaterThan(second.x);
      }
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
  }
  expect(errors).toEqual([]);
});

test("step presses move only enabled ink and respect reduced motion", async ({ page, errors }) => {
  const nav = page.getByRole("navigation", { name: "Checkout progress" });
  for (const reducedMotion of ["no-preference", "reduce"] as const) {
    await page.emulateMedia({ reducedMotion });
    for (const target of [step(nav, /Payment/), step(nav, /Review and confirm/)]) {
      await target.scrollIntoViewIfNeeded();
      const mark = target.locator("[data-sui-step-mark]");
      const track = target.locator("[data-sui-step-track]");
      const trackBefore = (await track.boundingBox())!;
      const before = (await target.boundingBox())!;
      const inkBefore = (await mark.boundingBox())!;
      const presses = reducedMotion === "no-preference" && await target.isEnabled();
      await page.mouse.move(before.x + 1, before.y + before.height / 2);
      await page.mouse.down();
      try {
        if (presses) {
          await expect.poll(async () => (await mark.boundingBox())!.width).toBeLessThan(inkBefore.width - 1);
        } else {
          expect((await mark.boundingBox())!.width).toBeCloseTo(inkBefore.width, 1);
        }
        const held = (await target.boundingBox())!;
        for (const property of ["x", "y", "width", "height"] as const) {
          expect(held[property]).toBeCloseTo(before[property], 1);
        }
        const trackHeld = (await track.boundingBox())!;
        for (const property of ["x", "y", "width", "height"] as const) {
          expect(trackHeld[property]).toBeCloseTo(trackBefore[property], 1);
        }
      } finally {
        await page.mouse.up();
      }
      await expect.poll(async () => (await mark.boundingBox())!.width).toBeCloseTo(inkBefore.width, 1);
    }
  }
  expect(errors).toEqual([]);
});

test("passive and disabled steps stay fully readable without scroll tab stops", async ({ page, errors }) => {
  await page.setViewportSize({ width: 320, height: 900 });
  for (const name of ["Progress steps", "Locked progress"]) {
    const nav = page.getByRole("navigation", { name, exact: true });
    await expect(nav).not.toHaveAttribute("tabindex");
    expect(await nav.evaluate(element => element.scrollWidth - element.clientWidth)).toBeLessThanOrEqual(1);
    const positions = await boxes(nav.locator("li"));
    expect(new Set(positions.map(item => item.top)).size).toBe(positions.length);
  }
  await expect(page.getByRole("navigation", { name: "Progress steps" }).getByRole("button")).toHaveCount(0);
  for (const button of await page.getByRole("navigation", { name: "Locked progress" }).getByRole("button").all()) {
    await expect(button).toBeDisabled();
  }
  expect(errors).toEqual([]);
});
