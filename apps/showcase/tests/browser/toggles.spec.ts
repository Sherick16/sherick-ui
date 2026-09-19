import { expect, test, type Locator } from "./fixtures";

/* The toggle family and the progress bar. These assert the rendered contract rather than the
   implementation: which role a part publishes, where its value lives, and what the browser
   actually resolves for a state the design language describes. */

const boxShadow = (locator: Locator) =>
  locator.evaluate((element) => getComputedStyle(element).boxShadow);

const animationName = (locator: Locator) =>
  locator.evaluate((element) => getComputedStyle(element).animationName);

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
     sweeps its own track instead of sitting at one. */
  const indeterminate = page.getByTestId("progress-indeterminate").getByRole("progressbar");
  await expect(indeterminate).not.toHaveAttribute("aria-valuenow");
  const sweep = indeterminate.locator("[data-sui-progress-indicator]");
  expect(await animationName(sweep)).toBe("sherick-indeterminate");
  expect(await sweep.evaluate((element) => getComputedStyle(element).animationIterationCount)).toBe(
    "infinite"
  );

  expect(errors).toEqual([]);
});

test("reduced motion leaves the indeterminate bar a static status glyph", async ({ page, errors }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/verification/interactions");
  const sweep = page
    .getByTestId("progress-indeterminate")
    .getByRole("progressbar")
    .locator("[data-sui-progress-indicator]");

  expect(await animationName(sweep)).toBe("none");
  const box = await sweep.boundingBox();
  expect(box?.width ?? 0).toBeGreaterThan(0);

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
