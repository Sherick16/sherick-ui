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
