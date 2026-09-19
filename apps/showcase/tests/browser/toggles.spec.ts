import { expect, test, type Locator, type Page } from "./fixtures";

/* The toggle family and the progress bar. These assert the rendered contract rather than the
   implementation: which role a part publishes, where its value lives, and what the browser
   actually resolves for a state the design language describes. */

const boxShadow = (locator: Locator) =>
  locator.evaluate((element) => getComputedStyle(element).boxShadow);

const animationName = (locator: Locator) =>
  locator.evaluate((element) => getComputedStyle(element).animationName);

/** A computed duration is normalized to milliseconds: a browser prints `1.4s` where the token says
 *  `1400ms`, and the Web Animations API counts in milliseconds. */
const asMilliseconds = (value: string) => {
  const trimmed = value.trim();
  return trimmed.endsWith("ms") ? Number.parseFloat(trimmed) : Number.parseFloat(trimmed) * 1000;
};

/** The x translation a sweep paints at a point of its own loop. The animation is paused and
 *  seeked rather than sampled, because a running animation outranks the cascade and the loop's
 *  start is the state it really paints first. */
const sweepTravelAt = async (page: Page, locator: Locator, fraction: number) => {
  const loop = await page.evaluate((name) =>
    getComputedStyle(document.documentElement).getPropertyValue(name), "--sui-duration-activity");

  await locator.evaluate((element, currentTime) => {
    element.getAnimations().forEach((animation) => {
      animation.pause();
      animation.currentTime = currentTime;
    });
  }, asMilliseconds(loop) * fraction);

  return locator.evaluate((element) => {
    const style = getComputedStyle(element);
    return new DOMMatrix(style.transform === "none" ? "" : style.transform).e;
  });
};

test.use({ reducedMotion: "no-preference" });

test.beforeEach(async ({ page }) => {
  await page.goto("/verification/interactions");
});

test("a chip is a toggle only when it holds a selection", async ({ page, errors }) => {
  const toggle = page.getByRole("button", { name: "Standalone chip" });
  await expect(toggle).toHaveAttribute("aria-pressed", "true");

  /* A held chip takes the selected tone in its fill, rather than the neutral matte step the rest
     of a row holds. The expected tone is read from the token itself, and the assertion retries
     because the fill is interpolated. */
  const selectedFill = await page.evaluate(() => {
    const probe = document.createElement("div");
    probe.style.backgroundColor = "oklch(var(--sui-primary) / 0.22)";
    document.body.appendChild(probe);
    const value = getComputedStyle(probe).backgroundColor;
    probe.remove();
    return value;
  });
  await expect(toggle).toHaveCSS("background-color", selectedFill);

  await toggle.click();
  await expect(toggle).toHaveAttribute("aria-pressed", "false");
  await expect(toggle).not.toHaveCSS("background-color", selectedFill);

  /* Nothing about a tag's own box is interactive, so the tag is not a button at all; its one
     control names itself from the chip it removes. */
  await expect(page.getByRole("button", { name: "Removable chip", exact: true })).toHaveCount(0);
  const dismiss = page.getByRole("button", { name: "Remove Removable chip" });
  await expect(dismiss).toBeVisible();
  await dismiss.click();
  await expect(page.getByTestId("removable-chip-state")).toHaveText("removed");

  expect(errors).toEqual([]);
});

test("a chip group owns the shared value, and its members are one tab stop", async ({ page, errors }) => {
  const design = page.getByRole("button", { name: "Design" });
  const code = page.getByRole("button", { name: "Code" });
  const ops = page.getByRole("button", { name: "Ops" });

  await expect(page.getByTestId("chip-group-value")).toHaveText("design");

  /* Several chips can be held at once, which is this group's default. */
  await code.click();
  await expect(page.getByTestId("chip-group-value")).toHaveText("design,code");
  await expect(code).toHaveAttribute("aria-pressed", "true");
  await expect(design).toHaveAttribute("aria-pressed", "true");

  /* A member disabled by its own prop loses its interactive state and its place in the roving
     order, while the group still holds what it held. */
  await expect(ops).toBeDisabled();
  await expect(ops).toHaveCSS("opacity", "0.45");

  await design.focus();
  await expect(design).toBeFocused();
  await page.keyboard.press("ArrowRight");
  await expect(code).toBeFocused();
  await page.keyboard.press("ArrowRight");
  await expect(design).toBeFocused();

  expect(errors).toEqual([]);
});

test("a segmented control is exclusive and can never be emptied", async ({ page, errors }) => {
  const group = page.getByRole("group", { name: "Interactions range" });
  const day = group.getByRole("button", { name: "Day" });
  const week = group.getByRole("button", { name: "Week" });
  const month = group.getByRole("button", { name: "Month" });

  await expect(page.getByTestId("segmented-value")).toHaveText("week");
  await expect(week).toHaveAttribute("aria-pressed", "true");

  /* An exclusive control always holds exactly one option, so the press that would release the
     held one is vetoed rather than clearing the control. */
  await week.click();
  await expect(page.getByTestId("segmented-value")).toHaveText("week");
  await expect(week).toHaveAttribute("aria-pressed", "true");

  await day.click();
  await expect(page.getByTestId("segmented-value")).toHaveText("day");
  await expect(day).toHaveAttribute("aria-pressed", "true");
  await expect(week).toHaveAttribute("aria-pressed", "false");

  await expect(month).toBeDisabled();
  await month.click({ force: true });
  await expect(page.getByTestId("segmented-value")).toHaveText("day");

  expect(errors).toEqual([]);
});

test("the toggle family reads its selection from the primitive, and a groove is one groove", async ({
  page,
  errors,
}) => {
  const bold = page.getByRole("button", { name: "Bold" });
  const italic = page.getByRole("button", { name: "Italic" });

  await expect(page.getByTestId("toggle-group-value")).toHaveText("bold");
  await italic.click();
  await expect(page.getByTestId("toggle-group-value")).toHaveText("bold,italic");
  await bold.click();
  await expect(page.getByTestId("toggle-group-value")).toHaveText("italic");

  /* The group is the recessed track and the member that is held is raised out of it; the member
     that is not shows the track through, so it carries no depth of its own. */
  const track = page.getByRole("group", { name: "Interactions formatting" });
  await bold.evaluate((element) => (element as HTMLElement).blur());
  expect(await boxShadow(track)).toContain("inset");
  expect(await boxShadow(italic)).not.toBe("none");
  /* The depth it gives up on release is interpolated, so the assertion retries rather than
     sampling the transition. */
  await expect(bold).toHaveCSS("box-shadow", "none");

  /* A standalone chip is a raised matte control, so it is lifted at rest exactly like a tonal
     button is. */
  expect(await boxShadow(page.getByRole("button", { name: "Standalone chip" }))).not.toBe("none");

  expect(errors).toEqual([]);
});

test("progress measures a known value and sweeps an unknown one", async ({ page, errors }) => {
  const determinate = page.getByTestId("progress-determinate").getByRole("progressbar");
  const track = determinate.locator(".shadow-sherick-recessed");
  const fill = determinate.locator("[data-sui-progress-indicator]");

  await expect(determinate).toHaveAttribute("aria-valuenow", "40");
  await expect(page.getByTestId("progress-determinate").getByText("40%")).toBeVisible();

  const measure = async () => {
    const trackBox = await track.boundingBox();
    const fillBox = await fill.boundingBox();
    if (!trackBox || !fillBox) throw new Error("the progress bar did not lay out");
    return fillBox.width / trackBox.width;
  };

  expect(await measure()).toBeCloseTo(0.4, 1);

  await page.getByRole("button", { name: "Advance progress" }).click();
  await expect(determinate).toHaveAttribute("aria-valuenow", "65");
  expect(await measure()).toBeCloseTo(0.65, 1);

  /* An unknown extent reports work rather than a position: no value is announced, and the fill
     sweeps its own track instead of sitting at one. The box that travels is the fill's own
     wrapper — the track's width — so the sweep is measured against the track, not the fill. */
  const indeterminate = page.getByTestId("progress-indeterminate").getByRole("progressbar");
  await expect(indeterminate).not.toHaveAttribute("aria-valuenow");
  const sweep = indeterminate.locator("[data-sui-progress-indicator]").locator("xpath=..");
  expect(await animationName(sweep)).toBe("sherick-indeterminate");
  expect(await sweep.evaluate((element) => getComputedStyle(element).animationIterationCount)).toBe(
    "infinite"
  );

  expect(errors).toEqual([]);
});

test("reduced motion leaves the indeterminate bar a static status glyph", async ({ page, errors }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/verification/interactions");
  const fill = page
    .getByTestId("progress-indeterminate")
    .getByRole("progressbar")
    .locator("[data-sui-progress-indicator]");

  expect(await animationName(fill.locator("xpath=.."))).toBe("none");

  /* The loop stops, but the bar still reports work: the fill rests where it starts, as one bar's
     worth of the track rather than as nothing at all. */
  const fillBox = await fill.boundingBox();
  const trackBox = await page
    .getByTestId("progress-indeterminate")
    .locator(".shadow-sherick-recessed")
    .boundingBox();
  expect((fillBox?.width ?? 0) / (trackBox?.width ?? 1)).toBeCloseTo(0.4, 1);

  expect(errors).toEqual([]);
});

test("an uncontrolled segmented control starts on the first option it can hold", async ({
  page,
  errors,
}) => {
  const group = page.getByRole("group", { name: "Interactions default range" });
  const day = group.getByRole("button", { name: "Day" });
  const week = group.getByRole("button", { name: "Week" });

  /* No initial value was given, and the control still holds exactly one option. */
  await expect(day).toHaveAttribute("aria-pressed", "true");

  await week.click();
  await expect(week).toHaveAttribute("aria-pressed", "true");
  await expect(day).toHaveAttribute("aria-pressed", "false");

  /* And the choice it holds cannot be released either. */
  await week.click();
  await expect(week).toHaveAttribute("aria-pressed", "true");

  expect(errors).toEqual([]);
});

test("the sweep travels a composited transform, in the page's own direction", async ({
  page,
  errors,
}) => {
  const bar = page.getByTestId("progress-indeterminate").getByRole("progressbar");
  const fill = bar.locator("[data-sui-progress-indicator]");
  const sweep = fill.locator("xpath=..");

  /* The box stays where it is put, and the travel is carried by the transform list: an endless
     loop must never sit on the layout path. */
  expect(
    await sweep.evaluate((element) => {
      const style = getComputedStyle(element);
      return style.getPropertyValue("inset-inline-start") || style.getPropertyValue("left");
    })
  ).toBe("0px");
  expect(await sweep.evaluate((element) => getComputedStyle(element).transform)).not.toBe("none");

  /* On a page that reads left to right the box is before the track at the top of its loop, over
     it in the middle, and past it at the end. */
  const forwardStart = await sweepTravelAt(page, sweep, 0);
  const forwardMiddle = await sweepTravelAt(page, sweep, 0.5);
  const forwardEnd = await sweepTravelAt(page, sweep, 0.99);
  expect(forwardStart).toBeLessThan(0);
  expect(Math.abs(forwardMiddle)).toBeLessThan(Math.abs(forwardStart));
  expect(forwardEnd).toBeGreaterThan(0);

  /* A transform is physical and the page is not: the same recipe sweeps the other way when the
     document is laid out right to left. */
  await page.evaluate(() => {
    document.documentElement.dir = "rtl";
  });
  expect(await sweepTravelAt(page, sweep, 0)).toBeGreaterThan(0);
  expect(await sweepTravelAt(page, sweep, 0.99)).toBeLessThan(0);

  expect(errors).toEqual([]);
});

test("a dismiss control inside a chip group keeps its own keys", async ({ page, errors }) => {
  const dismiss = page.getByRole("button", { name: "Remove Draft" });
  await expect(dismiss).toBeVisible();
  await dismiss.focus();
  await expect(dismiss).toBeFocused();

  /* The dismiss control is not one of the group's items, so the keys aimed at it belong to it:
     the group's roving navigation must not take focus off the control the user is standing on. */
  for (const key of ["ArrowRight", "ArrowLeft", "Home", "End"]) {
    await page.keyboard.press(key);
    await expect(dismiss, `pressing ${key} in the dismiss control`).toBeFocused();
  }

  /* It is still a control: it activates, and it removes the chip it belongs to. */
  await page.keyboard.press("Enter");
  await expect(page.getByTestId("group-tag-state")).toHaveText("removed");
  await expect(page.getByRole("button", { name: "Remove Draft" })).toHaveCount(0);

  expect(errors).toEqual([]);
});
