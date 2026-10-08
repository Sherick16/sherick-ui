import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Locator, type Page } from "./fixtures";

/* DateTimePicker — a native datetime-local field, the shared calendar and a column per part of
   the clock. Every assertion is made in the roles, names and values the picker publishes: the
   columns are radio groups named by their caption, and each reading is named by what it shows. */

const openDateTime = async (page: Page) => {
  await page.goto("/verification/date-time");
  await page.waitForFunction(() => document.documentElement.dataset.hydrated === "true");
};

const focused = (page: Page) => page.locator(":focus");
const column = (popup: Locator, name: string) => popup.getByRole("radiogroup", { name, exact: true });
const reading = (group: Locator, name: string) => group.getByRole("radio", { name, exact: true });
const day = (popup: Locator, name: string) => popup.getByRole("button", { name, exact: true });

const openPopup = async (page: Page, label: string) => {
  await page.getByRole("button", { name: `Open ${label}`, exact: true }).click();
  const popup = page.getByRole("dialog", { name: label });
  await expect(popup).toBeVisible();
  return popup;
};

test.beforeEach(async ({ page }) => {
  await openDateTime(page);
});

test("the field is the browser's datetime-local control with its constraints", async ({ page, errors }) => {
  const field = page.getByTestId("date-time-field");
  const input = field.getByLabel("Departure", { exact: true });

  await expect(input).toHaveAttribute("type", "datetime-local");
  await expect(input).toHaveAttribute("min", "2024-06-01T06:00");
  await expect(input).toHaveAttribute("max", "2024-06-30T22:00");
  await expect(input).toHaveValue("2024-06-14T09:30");
  await expect(input).toHaveAccessibleDescription("Local time at the departure airport.");
  await expect(field.getByRole("button", { name: "Open Departure" })).toHaveAttribute("aria-haspopup", "dialog");

  expect(errors).toEqual([]);
});

test("the popup pairs the month with named time columns and lands on the day", async ({ page, errors }) => {
  const popup = await openPopup(page, "Departure");

  await expect(popup.getByRole("grid")).toHaveAccessibleName("June 2024");
  await expect(focused(page)).toHaveAccessibleName("Friday, June 14, 2024");

  const time = popup.getByRole("group", { name: "Time" });
  await expect(time).toContainText("9:30 AM");
  await expect(reading(column(time, "Hour"), "9")).toBeChecked();
  await expect(reading(column(time, "Minute"), "30")).toBeChecked();
  await expect(reading(column(time, "AM/PM"), "AM")).toBeChecked();
  // A twelve-hour column lists the hours of the period on screen, twelve first.
  await expect(column(time, "Hour").getByRole("radio")).toHaveCount(12);
  await expect(column(time, "Hour").getByRole("radio").first()).toHaveAccessibleName("12");
  // The default step offers every fifth minute.
  await expect(column(time, "Minute").getByRole("radio")).toHaveCount(12);

  // The held reading opens in the middle of its column, with neighbours visible on both sides.
  const hours = column(time, "Hour");
  const [list, held] = await Promise.all([hours.boundingBox(), reading(hours, "9").boundingBox()]);
  const offCenter = Math.abs(held!.y + held!.height / 2 - (list!.y + list!.height / 2));
  expect(offCenter).toBeLessThan(held!.height);

  expect(errors).toEqual([]);
});

test("a reading commits as it is chosen, and Done closes the popup back to its trigger", async ({ page, errors }) => {
  const popup = await openPopup(page, "Departure");
  const time = popup.getByRole("group", { name: "Time" });

  await reading(column(time, "Hour"), "11").click();
  await expect(page.getByTestId("date-time-value")).toHaveText("2024-06-14T11:30");
  await expect(popup).toBeVisible();

  await reading(column(time, "AM/PM"), "PM").click();
  await expect(page.getByTestId("date-time-value")).toHaveText("2024-06-14T23:30");
  // The period column switches the hour column to the afternoon's hours.
  await expect(reading(column(time, "Hour"), "11")).toBeChecked();
  await expect(time).toContainText("11:30 PM");

  await day(popup, "Thursday, June 20, 2024").click();
  await expect(page.getByTestId("date-time-value")).toHaveText("2024-06-20T23:30");
  await expect(popup).toBeVisible();

  await popup.getByRole("button", { name: "Done" }).click();
  await expect(popup).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Open Departure" })).toBeFocused();
  await expect(page.getByTestId("date-time-field").getByLabel("Departure", { exact: true })).toHaveValue("2024-06-20T23:30");

  expect(errors).toEqual([]);
});

test("arrow keys walk a column and select as they move; Escape restores the trigger", async ({ page, errors }) => {
  const popup = await openPopup(page, "Departure");
  const minutes = column(popup, "Minute");

  await reading(minutes, "30").focus();
  await page.keyboard.press("ArrowDown");
  await expect(reading(minutes, "35")).toBeFocused();
  await expect(reading(minutes, "35")).toBeChecked();
  await expect(page.getByTestId("date-time-value")).toHaveText("2024-06-14T09:35");

  await page.keyboard.press("ArrowUp");
  await page.keyboard.press("ArrowUp");
  await expect(page.getByTestId("date-time-value")).toHaveText("2024-06-14T09:25");

  // Tab leaves the column for the next one: one tab stop per column.
  await page.keyboard.press("Tab");
  await expect(focused(page)).toHaveAccessibleName("AM");

  await page.keyboard.press("Escape");
  await expect(popup).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Open Departure" })).toBeFocused();

  expect(errors).toEqual([]);
});

test("a half-chosen value waits for its other half, and bounds settle a crossing choice", async ({ page, errors }) => {
  const popup = await openPopup(page, "Pickup");
  const time = popup.getByRole("group", { name: "Time" });
  const value = page.getByTestId("date-time-empty-value");

  await expect(time).toContainText("Choose a time");
  await expect(column(time, "Hour").getByRole("radio", { checked: true })).toHaveCount(0);

  // A date alone is not a value.
  await day(popup, "Monday, June 10, 2024").click();
  await expect(value).toHaveText("none");
  await expect(popup.getByRole("gridcell", { name: "Monday, June 10, 2024" })).toHaveAttribute("aria-selected", "true");

  // On the first day, readings before 08:15 are refused, and an hour that would land before it
  // settles on the bound.
  await expect(reading(column(time, "Hour"), "7")).toBeDisabled();
  await reading(column(time, "Hour"), "8").click();
  await expect(value).toHaveText("2024-06-10T08:15");
  await expect(reading(column(time, "Minute"), "10")).toBeDisabled();
  await expect(reading(column(time, "Minute"), "15")).toBeChecked();

  // On the last day, a period that would cross 17:45 settles on it too.
  await day(popup, "Thursday, June 20, 2024").click();
  await expect(value).toHaveText("2024-06-20T08:15");
  await reading(column(time, "AM/PM"), "PM").click();
  await expect(value).toHaveText("2024-06-20T17:45");
  await expect(reading(column(time, "Hour"), "6")).toBeDisabled();

  expect(errors).toEqual([]);
});

test("a twenty-four-hour locale drops the period and writes its own labels", async ({ page, errors }) => {
  const popup = await openPopup(page, "Abfahrt");
  const time = popup.getByRole("group", { name: "Uhrzeit" });

  await expect(popup.getByRole("grid")).toHaveAccessibleName("Juli 2024");
  await expect(time).toContainText("18:45");
  await expect(column(time, "Stunde").getByRole("radio")).toHaveCount(24);
  await expect(reading(column(time, "Stunde"), "18")).toBeChecked();
  await expect(reading(column(time, "Stunde"), "00")).toBeVisible();
  await expect(time.getByRole("radiogroup")).toHaveCount(2);
  // A fifteen-minute step.
  await expect(column(time, "Minute").getByRole("radio")).toHaveText(["00", "15", "30", "45"]);
  await expect(popup.getByRole("button", { name: "Fertig" })).toBeVisible();

  expect(errors).toEqual([]);
});

test("an off-step minute is still held, and a twelve-hour cycle can be asked for", async ({ page, errors }) => {
  const popup = await openPopup(page, "Reminder");
  const minutes = column(popup, "Minute");

  await expect(reading(minutes, "07")).toBeChecked();
  await expect(minutes.getByRole("radio")).toHaveCount(13);
  await expect(reading(column(popup, "Hour"), "7")).toBeChecked();
  await expect(column(popup, "AM/PM").getByRole("radio", { checked: true })).toHaveText(/am/i);

  expect(errors).toEqual([]);
});

test("typed entry is native, and a value the picker refuses is held and explained", async ({ page, errors }) => {
  const field = page.getByTestId("date-time-field");
  const input = field.getByLabel("Departure", { exact: true });

  await input.fill("2024-06-18T10:00");
  await expect(input).toHaveAttribute("aria-invalid", "true");
  await expect(field).toContainText("That date and time is not available");
  await expect(page.getByTestId("date-time-value")).toHaveText("2024-06-14T09:30");

  await input.fill("2024-06-21T07:05");
  await expect(input).not.toHaveAttribute("aria-invalid", "true");
  await expect(page.getByTestId("date-time-value")).toHaveText("2024-06-21T07:05");

  await input.fill("2024-06-30T23:00");
  expect(await input.evaluate((element: HTMLInputElement) => element.validity.rangeOverflow)).toBe(true);
  await expect(page.getByTestId("date-time-value")).toHaveText("2024-06-21T07:05");

  expect(errors).toEqual([]);
});

test("required and error are the field's, and a disabled field offers nothing", async ({ page, errors }) => {
  const checkIn = page.getByTestId("date-time-error-field").getByLabel(/^Check-in/);
  await expect(checkIn).toHaveAttribute("required", "");
  await expect(checkIn).toHaveAttribute("aria-invalid", "true");
  await expect(page.getByTestId("date-time-error-field")).toContainText("Choose a time after noon.");

  const archived = page.getByTestId("date-time-disabled-field");
  await expect(archived.getByLabel("Archived at", { exact: true })).toBeDisabled();
  await expect(archived.getByRole("button", { name: "Open Archived at" })).toBeDisabled();

  expect(errors).toEqual([]);
});

test("a disabled picker opened by its owner offers nothing to choose", async ({ page, errors }) => {
  await page.getByRole("button", { name: "Open locked picker" }).click();
  const popup = page.getByRole("dialog", { name: "Locked" });
  await expect(popup).toBeVisible();

  for (const button of await popup.getByRole("button").all()) await expect(button).toBeDisabled();
  for (const radio of await popup.getByRole("radio").all()) await expect(radio).toBeDisabled();
  await reading(column(popup, "Hour"), "9").click({ force: true });
  await day(popup, "Thursday, May 2, 2024").click({ force: true });
  await expect(page.getByTestId("date-time-locked-requests")).toHaveText("0");

  expect(errors).toEqual([]);
});

test("the native form submits the civil value and reset restores the default", async ({ page, errors }) => {
  const form = page.getByTestId("date-time-form");
  const input = form.getByLabel(/^Meeting/);

  await form.getByRole("button", { name: "Submit" }).click();
  await expect(page.getByTestId("date-time-form-result")).toHaveText("meeting=2024-02-29T10:00");

  const popup = await openPopup(page, "Meeting");
  await reading(column(popup, "Hour"), "3").click();
  await popup.getByRole("button", { name: "Next month" }).click();
  await day(popup, "Friday, March 1, 2024").click();
  await expect(input).toHaveValue("2024-03-01T03:00");
  await page.keyboard.press("Escape");

  await form.getByRole("button", { name: "Reset" }).click();
  await expect(input).toHaveValue("2024-02-29T10:00");

  const reopened = await openPopup(page, "Meeting");
  await expect(reopened.getByRole("gridcell", { name: "Thursday, February 29, 2024" })).toHaveAttribute("aria-selected", "true");
  await expect(reading(column(reopened, "Hour"), "10")).toBeChecked();

  expect(errors).toEqual([]);
});

test("in a right-to-left page the native affordance stays clipped behind the field's own", async ({ page, errors }) => {
  const input = page.getByTestId("date-time-rtl-field").getByLabel("موعد", { exact: true });
  const geometry = await input.evaluate((element) => {
    const own = element.getBoundingClientRect();
    const slot = element.parentElement!.getBoundingClientRect();
    return { left: own.left - slot.left, right: own.right - slot.right };
  });

  // The input starts at the slot's edge and spills out on the side its native affordance is on.
  expect(Math.abs(geometry.left)).toBeLessThan(1);
  expect(geometry.right).toBeGreaterThan(30);

  const popup = await openPopup(page, "موعد");
  await expect(popup.getByRole("radiogroup")).toHaveCount(3);

  expect(errors).toEqual([]);
});

test("the open popup passes axe in both themes", async ({ page, errors }) => {
  for (const theme of ["light", "dark"] as const) {
    await page.emulateMedia({ colorScheme: theme });
    await openDateTime(page);
    const popup = await openPopup(page, "Departure");
    const results = await new AxeBuilder({ page })
      .include('[role="dialog"]')
      .options({
        runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"] },
        rules: { "target-size": { enabled: true } },
      })
      .analyze();
    const summary = results.violations
      .map((violation) => `${violation.id} [${violation.nodes.map((node) => node.target.join(" ")).join(", ")}]`)
      .join("\n");
    expect(results.violations, `axe violations in ${theme}:\n${summary}`).toEqual([]);
    await page.keyboard.press("Escape");
    await expect(popup).toHaveCount(0);
  }

  expect(errors).toEqual([]);
});
