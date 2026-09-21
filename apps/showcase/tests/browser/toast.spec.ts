import { expect, test, type Locator, type Page } from "./fixtures";

/* Toasts. Base owns the queue, the timer, the limit, the swipe and the live region; what is
   asserted here is that the published viewport renders those facts — the region's announcement
   contract, the stack's limit and peeking, and the two ways a toast leaves. */

test.use({ reducedMotion: "no-preference" });

const stack = (page: Page) => page.getByRole("region", { name: "Notifications" });
const toasts = (page: Page) => stack(page).locator(":scope > *");
const toastNamed = (page: Page, name: string) => page.getByRole("dialog", { name });

const raise = (page: Page, name: string) => page.getByRole("button", { name }).click();

const height = (locator: Locator) =>
  locator.evaluate((element) => (element as HTMLElement).offsetHeight);

test.beforeEach(async ({ page }) => {
  await page.goto("/verification/interactions");
  await page.waitForFunction(() => document.documentElement.dataset.hydrated === "true");
});

test("the stack is one polite live region and every toast is named by its own title", async ({
  page,
  errors,
}) => {
  const region = stack(page);
  await expect(region).toHaveAttribute("aria-live", "polite");
  await expect(region).toHaveAttribute("aria-atomic", "false");

  await raise(page, "Raise toast");

  const toast = toastNamed(page, "Interactions toast");
  await expect(toast).toBeVisible();
  await expect(toast).toContainText("Raised from the interactions fixture.");
  /* The name comes from the title element Base wires into the toast's own labelled-by. */
  await expect(toast).toHaveAttribute("aria-labelledby", /.+/);

  expect(errors).toEqual([]);
});

test("a toast raised without a title is still a named dialog", async ({ page, errors }) => {
  /* A toast is a dialog, and Base names it from the `Toast.Title` part it renders — so a toast
     raised with only a description would publish a role with no accessible name. What it reports
     names it in that case, and the description stays the thing it reads out. The two assertions
     are what keep the two paths distinct: the labelled-by is Base's when a title exists, and the
     name is the viewport's when it does not. */
  await raise(page, "Raise untitled toast");

  const toast = toastNamed(page, "Warning");
  await expect(toast).toBeVisible();
  /* Base's own labelled-by points at a title that does not exist, so it is absent rather than
     empty, and the name comes from the viewport instead. */
  await expect(toast).not.toHaveAttribute("aria-labelledby", /.+/);
  await expect(toast).toHaveAccessibleName("Warning");
  await expect(toast).toHaveAttribute("aria-describedby", /.+/);
  await expect(toast).toContainText("Raised without a title.");

  expect(errors).toEqual([]);
});

test("a toast leaves through its own control and with the whole stack", async ({ page, errors }) => {
  await raise(page, "Raise toast");
  await expect(toasts(page)).toHaveCount(1);

  /* The stack carries its own dismissal control, and Base keeps it out of the reading order
     until the stack is engaged: a toast that announced a second close control would double the
     one a reader has to hear. Hovering expands the stack, which is Base's own reveal. */
  const toast = toastNamed(page, "Interactions toast");
  await toast.hover();
  await expect(toast.getByRole("button", { name: "Dismiss" })).toBeVisible();
  await toast.getByRole("button", { name: "Dismiss" }).click();
  await expect(toasts(page)).toHaveCount(0);

  await raise(page, "Raise toast");
  await raise(page, "Raise sticky toast");
  await expect(toasts(page)).toHaveCount(2);

  await raise(page, "Close toasts");
  await expect(toasts(page)).toHaveCount(0);

  expect(errors).toEqual([]);
});

test("a toast's action runs, and dismissing it is the caller's outcome", async ({ page, errors }) => {
  await raise(page, "Raise sticky toast");
  const toast = toastNamed(page, "Sticky toast");
  await expect(toast).toBeVisible();

  /* A toast carrying an action waits to be dismissed: the action is a decision, not a timeout. */
  await page.getByRole("button", { name: "Retry" }).click();
  await expect(page.getByTestId("toast-action")).toHaveText("retry");

  expect(errors).toEqual([]);
});

test("the stack holds its limit and retires the oldest toast", async ({ page, errors }) => {
  for (let index = 0; index < 4; index += 1) {
    await raise(page, "Raise toast");
  }

  await expect(toasts(page)).toHaveCount(4);
  /* Past the limit the oldest toast is not dropped but marked, so it can retire rather than
     vanish, and it leaves the reading order. */
  await expect(page.locator("[data-limited]")).toHaveCount(1);
  await expect(page.locator("[data-limited]")).toHaveAttribute("inert", "");

  expect(errors).toEqual([]);
});

test("a toast with a timeout dismisses itself", async ({ page, errors }) => {
  await raise(page, "Raise fleeting toast");
  await expect(toasts(page)).toHaveCount(1);

  await expect(toasts(page)).toHaveCount(0, { timeout: 5000 });

  expect(errors).toEqual([]);
});

test("a collapsed stack peeks, and expands to every toast's own height", async ({ page, errors }) => {
  await raise(page, "Raise toast");
  await raise(page, "Raise toast");
  await expect(toasts(page)).toHaveCount(2);

  const front = toasts(page).nth(0);
  const behind = toasts(page).nth(1);

  /* Collapsed, every toast lays out at the frontmost one's height and is stepped back from it, so
     the stack reads as a single surface with the edges of the others behind it. */
  const frontHeight = await height(front);
  const naturalBehind = await behind.evaluate((element) =>
    Number.parseFloat(getComputedStyle(element).getPropertyValue("--toast-height"))
  );
  await expect.poll(() => height(behind)).toBe(frontHeight);
  expect(naturalBehind).toBeGreaterThanOrEqual(frontHeight);

  await front.hover();
  await expect(front).toHaveAttribute("data-expanded");
  await expect.poll(() => height(behind)).toBe(naturalBehind);

  expect(errors).toEqual([]);
});

test("the stack's corner follows the writing direction", async ({ page, errors }) => {
  await raise(page, "Raise toast");
  const region = stack(page);
  /* The viewport has no height of its own — every toast in it is absolutely positioned — so it is
     asserted present rather than visible, and read from its own box. */
  await expect(region).toHaveCount(1);

  /* At this width the viewport is narrower than the page, so the corner it is anchored to is
     readable from its own box. Each reading names the physical edge that `end` resolved to.
     `start` is read too: it is never the inset edge, and a physical `right-6` would leave it as
     the one 24px from the edge under RTL. */
  const corner = () =>
    region.evaluate((element) => {
      const box = element.getBoundingClientRect();
      const style = getComputedStyle(element);
      const rtl = style.direction === "rtl";
      return {
        direction: style.direction,
        // The physical gap between the box and the edge that `end` resolves to.
        gapAtEnd: rtl ? box.left : window.innerWidth - box.right,
        insetAtEnd: rtl ? style.left : style.right,
        insetAtStart: rtl ? style.right : style.left,
      };
    });

  const ltr = await corner();
  expect(ltr.direction).toBe("ltr");
  expect(ltr.gapAtEnd).toBeCloseTo(24, 0);
  expect(ltr.insetAtEnd).toBe("24px");
  expect(ltr.insetAtStart).not.toBe("24px");

  /* The stack is named by its inline ends, so under RTL the same corner is the left one — and the
     physical inset swaps with it. */
  await page.evaluate(() => {
    document.documentElement.dir = "rtl";
  });

  await expect.poll(async () => (await corner()).direction).toBe("rtl");
  const rtl = await corner();
  expect(rtl.gapAtEnd).toBeCloseTo(24, 0);
  expect(rtl.insetAtEnd).toBe("24px");
  expect(rtl.insetAtStart).not.toBe("24px");

  expect(errors).toEqual([]);
});

test("a toast's content keeps its own height while the stack clamps the root", async ({
  page,
  errors,
}) => {
  /* The tall toast first, so the frontmost one is the short one and the stack has to clamp a root
     whose content is bigger than the root. */
  await raise(page, "Raise tall toast");
  await raise(page, "Raise toast");
  await expect(toasts(page)).toHaveCount(2);

  const behind = toasts(page).nth(1);
  const content = behind.locator(":scope > div").first();
  const natural = await content.evaluate((element) => (element as HTMLElement).offsetHeight);

  /* The root is what the stack clamps, and the clamp is a height *transition*, so it is awaited to
     settle rather than sampled. The content is never sized to the root, which is what keeps the
     primitive's own measurement of it independent of the height the stack derives from it. */
  const collapsed = await height(toasts(page).nth(0));
  await expect.poll(() => height(behind)).toBe(collapsed);
  expect(await content.evaluate((element) => (element as HTMLElement).offsetHeight)).toBe(natural);
  expect(natural).toBeGreaterThan(collapsed);

  /* And the clamp is released by a real interpolation rather than a snap: paused at the start of
     its own transition the root is still clamped, halfway it is between the two, and it settles
     on the content's own height. */
  await toasts(page).nth(0).hover();
  await expect(toasts(page).nth(0)).toHaveAttribute("data-expanded");

  const flight = await behind.evaluate((element) => {
    const animations = element.getAnimations();
    const at = (fraction: number) => {
      animations.forEach((animation) => {
        animation.pause();
        animation.currentTime =
          fraction * Number(animation.effect?.getTiming().duration ?? 0);
      });
      return (element as HTMLElement).offsetHeight;
    };
    return { start: at(0), middle: at(0.5), end: at(1) };
  });

  expect(flight.start).toBe(collapsed);
  expect(flight.middle).toBeGreaterThan(collapsed);
  expect(flight.middle).toBeLessThan(natural);
  expect(flight.end).toBe(natural);

  expect(errors).toEqual([]);
});

test("a promise toast carries a mark in every state it can be in", async ({ page, errors }) => {
  /* Base sets the toast's type to `loading`, then to `success` or `error`, and none of those are
     roles a caller chose. A type the renderer does not know loses both its mark and its tone, so
     each state is asserted on what it renders rather than on the type string alone. */
  const settled = (type: string) => page.locator(`[role="dialog"][data-type="${type}"]`);

  await page.getByRole("button", { name: "Raise resolving toast" }).click();

  const loading = settled("loading");
  await expect(loading).toHaveCount(1);
  await expect(loading).toContainText("Promise pending");
  /* Ongoing work is the one state that is not a status glyph: it carries the same activity the
     library's Spinner does. */
  await expect(loading.getByRole("status")).toHaveCount(1);

  const success = settled("success");
  await expect(success).toContainText("Promise settled");
  await expect(success.locator("svg.text-sherick-success")).toHaveCount(1);

  await raise(page, "Close toasts");
  await expect(toasts(page)).toHaveCount(0);

  await page.getByRole("button", { name: "Raise failing toast" }).click();
  const error = settled("error");
  await expect(error).toContainText("Promise rejected");
  await expect(error.locator("svg.text-sherick-danger")).toHaveCount(1);

  expect(errors).toEqual([]);

  expect(errors).toEqual([]);
});
