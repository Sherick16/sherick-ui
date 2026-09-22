import { expect, test, type Locator, type Page } from "./fixtures";

/* v2.1 unit A — the date family.
   Every assertion is made in the roles, names, values and geometry the grid publishes, so the
   suite states the contract rather than the implementation behind it. Day buttons are addressed by
   the full civil date they announce, which is the same name a screen reader reads. */

const openDateFamily = async (page: Page) => {
  await page.goto("/verification/v2-1-a");
  await page.waitForFunction(() => document.documentElement.dataset.hydrated === "true");
};

const focused = (page: Page) => page.locator(":focus");

const day = (scope: Locator, name: string) => scope.getByRole("button", { name, exact: true });

test.beforeEach(async ({ page }) => {
  await openDateFamily(page);
});

test("the grid names itself, keeps one tab stop and marks today", async ({ page, errors }) => {
  const calendar = page.getByTestId("single-calendar");
  const grid = calendar.getByRole("grid");

  await expect(grid).toBeVisible();
  await expect(grid).toHaveAccessibleName("February 2024");
  await expect(grid).toHaveAccessibleDescription(/select a date/i);

  // The weekday headings are named, whatever they show.
  await expect(grid.getByRole("columnheader", { name: "Monday" })).toBeVisible();
  await expect(grid.getByRole("columnheader", { name: "Sunday" })).toBeVisible();

  // Exactly one day is the tab stop, and it is the selected one.
  await expect(grid.locator('button[tabindex="0"]')).toHaveCount(1);
  await expect(calendar.getByRole("button", { name: "Thursday, February 15, 2024" })).toHaveAttribute(
    "tabindex",
    "0"
  );

  // Today is announced as the current date, and it is not the selection.
  const todayCell = calendar
    .getByRole("gridcell")
    .filter({ has: day(calendar, "Tuesday, February 20, 2024") });
  await expect(todayCell).toHaveAttribute("aria-current", "date");
  await expect(todayCell).not.toHaveAttribute("aria-selected", "true");

  expect(errors).toEqual([]);
});

test("a day is selected by keyboard and by pointer, and the value follows", async ({
  page,
  errors,
}) => {
  const calendar = page.getByTestId("single-calendar");

  await day(calendar, "Thursday, February 15, 2024").click();
  await expect(page.getByTestId("single-value")).toHaveText("2024-02-15");
  await expect(
    calendar.getByRole("gridcell").filter({ has: day(calendar, "Thursday, February 15, 2024") })
  ).toHaveAttribute("aria-selected", "true");

  await day(calendar, "Thursday, February 15, 2024").focus();
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("Enter");

  await expect(page.getByTestId("single-value")).toHaveText("2024-02-17");
  await expect(
    calendar.getByRole("gridcell").filter({ has: day(calendar, "Saturday, February 17, 2024") })
  ).toHaveAttribute("aria-selected", "true");
  await expect(
    calendar.getByRole("gridcell").filter({ has: day(calendar, "Thursday, February 15, 2024") })
  ).not.toHaveAttribute("aria-selected", "true");

  expect(errors).toEqual([]);
});

test("arrows move by day and week and Home and End move within the row", async ({ page, errors }) => {
  const calendar = page.getByTestId("single-calendar");

  await day(calendar, "Thursday, February 15, 2024").focus();

  await page.keyboard.press("ArrowRight");
  await expect(focused(page)).toHaveAccessibleName("Friday, February 16, 2024");

  await page.keyboard.press("ArrowDown");
  await expect(focused(page)).toHaveAccessibleName("Friday, February 23, 2024");

  await page.keyboard.press("ArrowUp");
  await expect(focused(page)).toHaveAccessibleName("Friday, February 16, 2024");

  // The row starts on Monday, because that is the week start the calendar was given.
  await page.keyboard.press("Home");
  await expect(focused(page)).toHaveAccessibleName("Monday, February 12, 2024");

  await page.keyboard.press("End");
  await expect(focused(page)).toHaveAccessibleName("Sunday, February 18, 2024");

  // Moving the focus is not a selection.
  await expect(page.getByTestId("single-value")).toHaveText("2024-02-15");

  expect(errors).toEqual([]);
});

test("PageUp and PageDown cross months and years, retaining the day and the focus", async ({
  page,
  errors,
}) => {
  const calendar = page.getByTestId("single-calendar");
  const grid = calendar.getByRole("grid");

  // 2024 is a leap year, so this month has a day 29 to come back to.
  await day(calendar, "Thursday, February 29, 2024").focus();

  await page.keyboard.press("PageDown");
  await expect(grid).toHaveAccessibleName("March 2024");
  await expect(focused(page)).toHaveAccessibleName("Friday, March 29, 2024");

  await page.keyboard.press("PageUp");
  await expect(grid).toHaveAccessibleName("February 2024");
  await expect(focused(page)).toHaveAccessibleName("Thursday, February 29, 2024");

  await page.keyboard.press("Shift+PageUp");
  await expect(grid).toHaveAccessibleName("February 2023");
  await expect(focused(page)).toHaveAccessibleName("Wednesday, February 29, 2023");

  await page.keyboard.press("Shift+PageDown");
  await expect(grid).toHaveAccessibleName("February 2024");
  await expect(focused(page)).toHaveAccessibleName("Thursday, February 29, 2024");

  expect(errors).toEqual([]);
});

test("a month control keeps the day's focus, and today navigates without selecting", async ({
  page,
  errors,
}) => {
  const calendar = page.getByTestId("single-calendar");
  const grid = calendar.getByRole("grid");

  await day(calendar, "Thursday, February 15, 2024").focus();
  await calendar.getByRole("button", { name: "Next month" }).click();

  await expect(grid).toHaveAccessibleName("March 2024");
  await expect(focused(page)).toHaveAccessibleName("Friday, March 15, 2024");

  await calendar.getByRole("button", { name: "Today", exact: true }).click();

  await expect(grid).toHaveAccessibleName("February 2024");
  await expect(focused(page)).toHaveAccessibleName("Tuesday, February 20, 2024");
  await expect(page.getByTestId("single-value")).toHaveText("2024-02-15");

  expect(errors).toEqual([]);
});

test("a month boundary clamps the day instead of losing it", async ({ page, errors }) => {
  const calendar = page.getByTestId("range-calendar");
  const grid = calendar.getByRole("grid");

  await day(calendar, "Wednesday, January 31, 2024").focus();
  await page.keyboard.press("PageDown");

  await expect(grid).toHaveAccessibleName("February 2024");
  await expect(focused(page)).toHaveAccessibleName("Thursday, February 29, 2024");

  // The range itself did not move: navigation is not selection.
  await expect(page.getByTestId("range-value")).toHaveText("2024-01-08 → 2024-01-12");

  expect(errors).toEqual([]);
});

test("the value format's first and last months have no earlier or later control", async ({
  page,
  errors,
}) => {
  const first = page.getByTestId("bounds-calendar");
  const last = page.getByTestId("last-bounds-calendar");

  await expect(first.getByRole("grid")).toHaveAccessibleName("January 1");
  await expect(first.getByRole("button", { name: "Previous month" })).toBeDisabled();
  await expect(first.getByRole("button", { name: "Next month" })).toBeEnabled();

  await expect(last.getByRole("grid")).toHaveAccessibleName("December 9999");
  await expect(last.getByRole("button", { name: "Next month" })).toBeDisabled();
  await expect(last.getByRole("button", { name: "Previous month" })).toBeEnabled();

  expect(errors).toEqual([]);
});

test("unavailable and out-of-bounds days stay discoverable and cannot be selected", async ({
  page,
  errors,
}) => {
  const calendar = page.getByTestId("range-calendar");

  const outsideMinimum = day(calendar, "Monday, January 1, 2024");
  const blocked = day(calendar, "Wednesday, January 24, 2024");

  await expect(outsideMinimum).toHaveAttribute("aria-disabled", "true");
  await expect(blocked).toHaveAttribute("aria-disabled", "true");
  await expect(day(calendar, "Friday, January 5, 2024")).not.toHaveAttribute("aria-disabled", "true");

  // Discoverable: the disabled day still takes the grid's focus.
  await blocked.focus();
  await expect(focused(page)).toHaveAccessibleName("Wednesday, January 24, 2024");

  await blocked.click();
  await expect(page.getByTestId("range-value")).toHaveText("2024-01-08 → 2024-01-12");

  expect(errors).toEqual([]);
});

test("a range cannot span an unavailable date, and the refusal is announced", async ({
  page,
  errors,
}) => {
  const calendar = page.getByTestId("range-calendar");

  // A second selection after a complete range starts a new one.
  await day(calendar, "Saturday, January 20, 2024").click();
  await expect(page.getByTestId("range-value")).toHaveText("2024-01-20 → none");

  // January 24 and 25 are unavailable, so this endpoint is refused.
  await day(calendar, "Saturday, January 27, 2024").click();
  await expect(page.getByTestId("range-value")).toHaveText("2024-01-20 → none");
  await expect(calendar.getByRole("status")).toHaveText("That range includes an unavailable date");

  // The same start with an endpoint that clears the unavailable days completes normally.
  await day(calendar, "Monday, January 22, 2024").click();
  await expect(page.getByTestId("range-value")).toHaveText("2024-01-20 → 2024-01-22");
  await expect(calendar.getByRole("status")).toHaveText("");

  expect(errors).toEqual([]);
});

test("a range's endpoints are sorted however they are chosen", async ({ page, errors }) => {
  const calendar = page.getByTestId("range-calendar");

  await day(calendar, "Sunday, January 28, 2024").click();
  await expect(page.getByTestId("range-value")).toHaveText("2024-01-28 → none");

  await day(calendar, "Saturday, January 27, 2024").click();
  await expect(page.getByTestId("range-value")).toHaveText("2024-01-27 → 2024-01-28");

  await expect(
    calendar.getByRole("gridcell").filter({ has: day(calendar, "Saturday, January 27, 2024") })
  ).toHaveAttribute("aria-selected", "true");
  await expect(
    calendar.getByRole("gridcell").filter({ has: day(calendar, "Sunday, January 28, 2024") })
  ).toHaveAttribute("aria-selected", "true");

  expect(errors).toEqual([]);
});

test("a controlled month that is refused keeps both the month and the focus", async ({
  page,
  errors,
}) => {
  const calendar = page.getByTestId("controlled-calendar");
  const grid = calendar.getByRole("grid");

  await expect(grid).toHaveAccessibleName("March 2024");

  await day(calendar, "Sunday, March 31, 2024").focus();
  await page.keyboard.press("PageDown");
  await expect(grid).toHaveAccessibleName("April 2024");
  await expect(focused(page)).toHaveAccessibleName("Tuesday, April 30, 2024");

  await page.getByTestId("controlled-reject").check();
  await day(calendar, "Sunday, March 31, 2024").focus();
  await page.keyboard.press("PageDown");

  // April would have clamped the day to the 30th; the refused month keeps March and the day.
  await expect(grid).toHaveAccessibleName("March 2024");
  await expect(focused(page)).toHaveAccessibleName("Saturday, March 30, 2024");
  await expect(page.getByTestId("controlled-month")).toHaveText("2024-03-01");

  await page.getByTestId("controlled-reject").uncheck();
  await day(calendar, "Saturday, March 30, 2024").focus();
  await page.keyboard.press("PageDown");

  await expect(grid).toHaveAccessibleName("April 2024");
  await expect(page.getByTestId("controlled-month")).toHaveText("2024-04-01");

  expect(errors).toEqual([]);
});

test("a value that changes from the outside is shown, and cleared again", async ({ page, errors }) => {
  const calendar = page.getByTestId("controlled-calendar");
  const grid = calendar.getByRole("grid");

  await page.getByTestId("controlled-set").click();

  await expect(page.getByTestId("controlled-value")).toHaveText("2024-05-04");
  await expect(page.getByTestId("controlled-month")).toHaveText("2024-05-01");
  await expect(grid).toHaveAccessibleName("May 2024");
  await expect(
    calendar.getByRole("gridcell").filter({ has: day(calendar, "Saturday, May 4, 2024") })
  ).toHaveAttribute("aria-selected", "true");

  await page.getByTestId("controlled-clear").click();
  await expect(page.getByTestId("controlled-value")).toHaveText("none");
  await expect(grid.locator('[aria-selected="true"]')).toHaveCount(0);

  expect(errors).toEqual([]);
});

test("a disabled calendar dims once and offers no interaction", async ({ page, errors }) => {
  const wrapper = page.getByTestId("disabled-calendar");
  const grid = wrapper.getByRole("grid");

  // One opacity step for the whole calendar, and none on the parts inside it.
  await expect(wrapper.locator("> div")).toHaveCSS("opacity", "0.45");
  await expect(day(wrapper, "Wednesday, April 10, 2024")).toHaveCSS("opacity", "1");

  await expect(day(wrapper, "Wednesday, April 10, 2024")).toBeDisabled();
  await expect(wrapper.getByRole("button", { name: "Previous month" })).toBeDisabled();
  await expect(wrapper.getByRole("button", { name: "Today", exact: true })).toBeDisabled();
  await expect(grid.locator('button[tabindex="0"]')).toHaveCount(0);

  expect(errors).toEqual([]);
});

test("an invalid value is announced and wears the danger tone", async ({ page, errors }) => {
  const invalid = page.getByTestId("invalid-calendar");
  const valid = page.getByTestId("single-calendar");

  await expect(invalid.getByRole("grid")).toHaveAttribute("aria-invalid", "true");
  await expect(valid.getByRole("grid")).not.toHaveAttribute("aria-invalid", "true");

  const fillOf = (scope: Locator, name: string) =>
    day(scope, name).evaluate((element) => getComputedStyle(element).backgroundColor);

  // The selection carries the state too, so it is not stated by the aria attribute alone.
  expect(await fillOf(invalid, "Wednesday, April 10, 2024")).not.toBe(
    await fillOf(valid, "Thursday, February 15, 2024")
  );

  expect(errors).toEqual([]);
});

test("a locale changes the wording and the week start, not the value", async ({ page, errors }) => {
  const calendar = page.getByTestId("locale-calendar");
  const grid = calendar.getByRole("grid");

  await expect(grid).toHaveAccessibleName("Juli 2024");
  await expect(calendar.getByRole("button", { name: "Voriger Monat" })).toBeEnabled();
  await expect(calendar.getByRole("button", { name: "Nächster Monat" })).toBeEnabled();

  // weekStartsOn 0 puts Sunday in the first column.
  await expect(grid.getByRole("columnheader").first()).toHaveAccessibleName("Sonntag");

  await day(calendar, "Donnerstag, 4. Juli 2024").click();
  await expect(
    calendar.getByRole("gridcell").filter({ has: day(calendar, "Donnerstag, 4. Juli 2024") })
  ).toHaveAttribute("aria-selected", "true");

  expect(errors).toEqual([]);
});

test("a right-to-left page mirrors the horizontal arrows and the chevrons", async ({
  page,
  errors,
}) => {
  const calendar = page.getByTestId("rtl-calendar");

  await day(calendar, "Wednesday, September 11, 2024").focus();

  // In a right-to-left page the next day is to the left.
  await page.keyboard.press("ArrowLeft");
  await expect(focused(page)).toHaveAccessibleName("Thursday, September 12, 2024");

  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("ArrowRight");
  await expect(focused(page)).toHaveAccessibleName("Tuesday, September 10, 2024");

  const chevron = await calendar
    .getByRole("button", { name: "Previous month" })
    .locator("svg")
    .evaluate((element) => getComputedStyle(element).transform);
  const [a, , , d] = chevron.replace(/matrix\(|\)/g, "").split(", ").map(Number);
  expect(Math.abs(a)).toBeCloseTo(1, 2);
  expect(Math.abs(d)).toBeCloseTo(1, 2);
  expect(a).toBeLessThan(0);

  expect(errors).toEqual([]);
});

test("a narrow container holds the grid without overflowing the page", async ({ page, errors }) => {
  const wrapper = page.getByTestId("narrow-calendar");
  const grid = wrapper.getByRole("grid");

  const [wrapperBox, gridBox] = await Promise.all([wrapper.boundingBox(), grid.boundingBox()]);
  expect(wrapperBox).not.toBeNull();
  expect(gridBox).not.toBeNull();

  // The grid is seven columns wide, so it scrolls inside the container it was given instead of
  // widening it or spilling onto the page.
  expect(gridBox!.width).toBeGreaterThan(wrapperBox!.width);
  const containerOverflow = await wrapper.evaluate((element) => ({
    scrollWidth: element.scrollWidth,
    clientWidth: element.clientWidth,
  }));
  expect(containerOverflow.scrollWidth).toBeLessThanOrEqual(containerOverflow.clientWidth + 1);

  const pageOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth
  );
  expect(pageOverflow).toBe(false);

  // Every day stays reachable, however narrow the column is.
  await day(wrapper, "Friday, August 9, 2024").focus();
  await expect(focused(page)).toHaveAccessibleName("Friday, August 9, 2024");

  expect(errors).toEqual([]);
});

test("the date field labels its input, carries the constraints and reports an unusable entry", async ({
  page,
  errors,
}) => {
  const field = page.getByTestId("picker-field");
  const input = field.getByLabel("Arrival date");

  await expect(input).toHaveAttribute("type", "date");
  await expect(input).toHaveAttribute("min", "2024-06-01");
  await expect(input).toHaveAttribute("max", "2024-06-30");
  await expect(input).toHaveAccessibleDescription(/the day you arrive on site/i);
  await expect(input).toHaveValue("2024-06-14");

  await input.fill("2024-06-20");
  await expect(page.getByTestId("picker-value")).toHaveText("2024-06-20");

  // A date the application refuses stays on screen, is reported, and never becomes the value.
  await input.fill("2024-06-18");
  await expect(page.getByTestId("picker-value")).toHaveText("2024-06-20");
  await expect(input).toHaveValue("2024-06-18");
  await expect(input).toHaveAttribute("aria-invalid", "true");
  await expect(field.getByText("That range includes an unavailable date")).toBeVisible();

  // The browser's own bounds do the same for a date outside them.
  await input.fill("2024-07-05");
  await expect(page.getByTestId("picker-value")).toHaveText("2024-06-20");
  await expect(input).toHaveValue("2024-07-05");
  expect(await input.evaluate((element) => (element as HTMLInputElement).validity.rangeOverflow)).toBe(
    true
  );

  expect(errors).toEqual([]);
});

test("the calendar trigger opens a named surface, focuses the day and restores focus on Escape", async ({
  page,
  errors,
}) => {
  const field = page.getByTestId("picker-field");
  const trigger = field.getByRole("button", { name: "Open Arrival date" });

  await trigger.click();

  const popup = page.getByRole("dialog", { name: "Arrival date" });
  await expect(popup).toBeVisible();
  await expect(popup.getByRole("grid")).toHaveAccessibleName("June 2024");
  await expect(focused(page)).toHaveAccessibleName("Friday, June 14, 2024");

  await page.keyboard.press("Escape");
  await expect(popup).toHaveCount(0);
  await expect(trigger).toBeFocused();

  await trigger.press("Enter");
  await expect(popup).toBeVisible();
  await expect(focused(page)).toHaveAccessibleName("Friday, June 14, 2024");

  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("Enter");

  await expect(popup).toHaveCount(0);
  await expect(page.getByTestId("picker-value")).toHaveText("2024-06-21");
  await expect(field.getByLabel("Arrival date")).toHaveValue("2024-06-21");

  expect(errors).toEqual([]);
});

test("a required field is the browser's, and an error is the field's", async ({ page, errors }) => {
  const required = page.getByTestId("picker-default-field").getByLabel("Review date");
  await expect(required).toHaveAttribute("required", "");

  const error = page.getByTestId("picker-error-field");
  await expect(error.getByLabel("Cut-off date")).toHaveAttribute("aria-invalid", "true");
  await expect(error.getByText("Choose a date in the current cycle.")).toBeVisible();

  const disabled = page.getByTestId("picker-disabled-field");
  await expect(disabled.getByLabel("Archived date")).toBeDisabled();
  await expect(disabled.getByRole("button", { name: "Open Archived date" })).toBeDisabled();

  expect(errors).toEqual([]);
});

test("a range field is one named group with two labelled endpoints", async ({ page, errors }) => {
  const group = page.getByRole("group", { name: "Release window" });
  await expect(group).toBeVisible();
  await expect(group).toHaveAccessibleDescription("Two endpoints, one calendar.");

  const start = page.getByTestId("range-picker-field").getByLabel("Start date");
  const end = page.getByTestId("range-picker-field").getByLabel("End date");

  await expect(start).toHaveValue("2024-06-03");
  await expect(end).toHaveValue("2024-06-07");
  await expect(start).toHaveAttribute("name", "releaseStart");
  await expect(end).toHaveAttribute("name", "releaseEnd");

  expect(errors).toEqual([]);
});

test("a reversed or unavailable range is reported and never becomes the value", async ({
  page,
  errors,
}) => {
  const field = page.getByTestId("range-picker-field");
  const start = field.getByLabel("Start date");
  const end = field.getByLabel("End date");
  const message = field.getByText("That range includes an unavailable date");

  await end.fill("2024-06-01");
  await expect(page.getByTestId("range-picker-value")).toHaveText("2024-06-03 → 2024-06-07");
  await expect(message).toBeVisible();
  await expect(end).toHaveAttribute("aria-invalid", "true");

  await end.fill("2024-06-20");
  await expect(page.getByTestId("range-picker-value")).toHaveText("2024-06-03 → 2024-06-07");
  await expect(message).toBeVisible();

  await end.fill("2024-06-17");
  await expect(page.getByTestId("range-picker-value")).toHaveText("2024-06-03 → 2024-06-17");
  await expect(message).toHaveCount(0);

  await start.fill("2024-06-19");
  await expect(page.getByTestId("range-picker-value")).toHaveText("2024-06-03 → 2024-06-17");
  await expect(field.getByText("That range includes an unavailable date").first()).toBeVisible();

  expect(errors).toEqual([]);
});

test("the range picker's calendar completes a range and closes itself", async ({ page, errors }) => {
  const field = page.getByTestId("range-picker-field");

  await field.getByRole("button", { name: "Open Start date" }).click();

  const popup = page.getByRole("dialog", { name: "Release window" });
  await expect(popup).toBeVisible();

  const grid = popup.getByRole("grid");
  await expect(grid).toHaveAttribute("aria-multiselectable", "true");
  await expect(focused(page)).toHaveAccessibleName("Monday, June 3, 2024");

  // A complete range starts a new one, so this is a start and the surface stays open.
  await grid.getByRole("button", { name: "Monday, June 10, 2024", exact: true }).click();
  await expect(popup).toBeVisible();
  await expect(page.getByTestId("range-picker-value")).toHaveText("2024-06-10 → none");

  await grid.getByRole("button", { name: "Wednesday, June 12, 2024", exact: true }).click();
  await expect(popup).toHaveCount(0);
  await expect(page.getByTestId("range-picker-value")).toHaveText("2024-06-10 → 2024-06-12");
  await expect(field.getByLabel("Start date")).toHaveValue("2024-06-10");
  await expect(field.getByLabel("End date")).toHaveValue("2024-06-12");

  expect(errors).toEqual([]);
});

test("a native field submits its value and a form reset restores the default", async ({
  page,
  errors,
}) => {
  const form = page.getByTestId("leap-form");
  const input = form.getByLabel("Leap day");

  await expect(input).toHaveValue("2024-02-29");

  await form.getByRole("button", { name: "Submit" }).click();
  await expect(page.getByTestId("form-result")).toHaveText("leap=2024-02-29");

  await input.fill("2024-03-05");
  await form.getByRole("button", { name: "Submit" }).click();
  await expect(page.getByTestId("form-result")).toHaveText("leap=2024-03-05");

  // Emptying a required field is the browser's own validation, so submission never reaches us.
  await input.fill("");
  expect(await input.evaluate((element) => (element as HTMLInputElement).validity.valueMissing)).toBe(true);
  await form.getByRole("button", { name: "Submit" }).click();
  await expect(page.getByTestId("form-result")).toHaveText("leap=2024-03-05");

  await form.getByRole("button", { name: "Reset" }).click();
  await expect(input).toHaveValue("2024-02-29");
  await form.getByRole("button", { name: "Submit" }).click();
  await expect(page.getByTestId("form-result")).toHaveText("leap=2024-02-29");

  // The calendar selection came back with it, not only the text in the field.
  await form.getByRole("button", { name: "Open Leap day" }).click();
  const popup = page.getByRole("dialog", { name: "Leap day" });
  await expect(popup.getByRole("grid")).toHaveAccessibleName("February 2024");
  await expect(
    popup.getByRole("gridcell").filter({
      has: popup.getByRole("button", { name: "Thursday, February 29, 2024", exact: true }),
    })
  ).toHaveAttribute("aria-selected", "true");
  await expect(focused(page)).toHaveAccessibleName("Thursday, February 29, 2024");

  expect(errors).toEqual([]);
});
