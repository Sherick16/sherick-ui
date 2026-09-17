import { expect, test, type Page } from "@playwright/test";

const trackRuntimeErrors = (page: Page) => {
  const errors: string[] = [];

  page.on("pageerror", (error) => errors.push(`pageerror: ${error.message}`));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(`console: ${message.text()}`);
  });

  return errors;
};

test.beforeEach(async ({ page }) => {
  await page.goto("/verification/interactions");
});

test("Field gives one control its label, description and error", async ({ page }) => {
  const errors = trackRuntimeErrors(page);
  const checkbox = page.getByRole("checkbox", { name: "Release channel" });

  await expect(checkbox).toBeVisible();
  await expect(checkbox).toHaveAccessibleName("Release channel");
  await expect(checkbox).toHaveAccessibleDescription(
    /Visible to everyone in the workspace\. Pick a release channel\./
  );
  await expect(checkbox).toHaveAttribute("aria-invalid", "true");

  // The group is a set of controls, so it names itself rather than borrowing a field's label,
  // and every option keeps a name of its own inside it.
  const group = page.getByRole("radiogroup", { name: "Region", exact: true });
  await expect(group).toBeVisible();
  await expect(group.getByRole("radio", { name: "Europe" })).toHaveAttribute(
    "aria-checked",
    "true"
  );
  await expect(group.getByRole("radio", { name: "United States" })).toHaveAttribute(
    "aria-checked",
    "false"
  );

  expect(errors).toEqual([]);
});

test("Checkbox toggles from the keyboard and reproduces its state in the form", async ({ page }) => {
  const errors = trackRuntimeErrors(page);
  const notify = page.getByRole("checkbox", { name: "Form notifications" });

  await expect(notify).toHaveAttribute("aria-checked", "true");
  await notify.focus();
  await page.keyboard.press("Space");
  await expect(notify).toHaveAttribute("aria-checked", "false");
  await page.keyboard.press("Space");
  await expect(notify).toHaveAttribute("aria-checked", "true");

  await page.getByRole("button", { name: "Submit fields" }).click();
  await expect(page.getByTestId("fields-result")).toHaveText(
    "formBudget=40&formRegion=eu&formSeats=2&notify=yes"
  );

  expect(errors).toEqual([]);
});

test("an indeterminate checkbox is mixed, not ticked", async ({ page }) => {
  const errors = trackRuntimeErrors(page);
  const partial = page.getByRole("checkbox", { name: "Partial selection" });

  await expect(partial).toHaveAttribute("aria-checked", "mixed");

  // The mixed state must reach the native input, not only the rendered box: a form input
  // that reports `indeterminate: false` silently loses the distinction.
  const inputIndeterminate = await partial.evaluate((element) => {
    const sibling = element.nextElementSibling;
    return sibling instanceof HTMLInputElement ? sibling.indeterminate : null;
  });
  expect(inputIndeterminate).toBe(true);

  expect(errors).toEqual([]);
});

test("RadioGroup selects one value with the keyboard and submits it", async ({ page }) => {
  const errors = trackRuntimeErrors(page);
  const group = page.getByRole("radiogroup", { name: "Region", exact: true });

  await group.getByRole("radio", { name: "Europe" }).focus();
  await page.keyboard.press("ArrowDown");

  await expect(page.getByTestId("region-value")).toHaveText("us");
  await expect(group.getByRole("radio", { name: "United States" })).toHaveAttribute(
    "aria-checked",
    "true"
  );
  await expect(group.getByRole("radio", { name: "Europe" })).toHaveAttribute(
    "aria-checked",
    "false"
  );
  await expect(group.getByRole("radio", { name: "Asia Pacific" })).toBeDisabled();

  await page.getByRole("button", { name: "Submit fields" }).click();
  await expect(page.getByTestId("fields-result")).toHaveText(
    "formBudget=40&formRegion=eu&formSeats=2&notify=yes"
  );

  expect(errors).toEqual([]);
});

test("Slider adjusts and reports its value from the keyboard", async ({ page }) => {
  const errors = trackRuntimeErrors(page);
  const slider = page.getByRole("slider", { name: "Budget", exact: true });

  await expect(slider).toHaveAttribute("aria-valuenow", "30");
  await slider.focus();

  await page.keyboard.press("ArrowRight");
  await expect(page.getByTestId("budget-value")).toHaveText("40");

  await page.keyboard.press("Home");
  await expect(page.getByTestId("budget-value")).toHaveText("0");

  await page.keyboard.press("End");
  await expect(page.getByTestId("budget-value")).toHaveText("100");
  await expect(slider).toHaveAttribute("aria-valuenow", "100");

  expect(errors).toEqual([]);
});

test("the selection family holds one accent token in both themes", async ({ page }) => {
  const errors = trackRuntimeErrors(page);
  const checkboxFill = page
    .getByRole("checkbox", { name: "Form notifications" })
    .locator("span")
    .first();
  const radioFill = page
    .getByRole("radiogroup", { name: "Form region", exact: true })
    .getByRole("radio", { name: "Europe" })
    .locator("span")
    .first();

  const selectedFills = async () => {
    const read = (locator: typeof checkboxFill) =>
      locator.evaluate((element) => getComputedStyle(element).backgroundColor);

    return [await read(checkboxFill), await read(radioFill)];
  };

  await page.evaluate(() => {
    document.documentElement.dataset.sherickTheme = "light";
  });
  const light = await selectedFills();

  await page.evaluate(() => {
    document.documentElement.dataset.sherickTheme = "dark";
  });
  const dark = await selectedFills();

  expect(light[0]).toBe(light[1]);
  expect(dark[0]).toBe(dark[1]);
  expect(light[0]).not.toBe(dark[0]);

  expect(errors).toEqual([]);
});

test("a compact selection control keeps a compact layout box with a comfortable hit area", async ({
  page,
}) => {
  const errors = trackRuntimeErrors(page);
  const checkbox = page.getByRole("checkbox", { name: "Form notifications" });

  // The visible mark is the layout footprint, so a table column or a row gap is measured from
  // what the user sees rather than from a padded target.
  await checkbox.scrollIntoViewIfNeeded();
  const box = await checkbox.boundingBox();
  expect(box, "the checkbox has no box").not.toBeNull();
  expect(Math.round(box?.width ?? 0)).toBe(24);
  expect(Math.round(box?.height ?? 0)).toBe(24);

  // The target still answers over the full accessible floor, and no further.
  const reach = await checkbox.evaluate((element) => {
    const rect = element.getBoundingClientRect();
    const hits = (x: number, y: number) =>
      document.elementFromPoint(x, y)?.closest('[role="checkbox"]') === element;
    return {
      insideTarget: hits(rect.left - 8, rect.top + rect.height / 2),
      beyondTarget: hits(rect.left - 14, rect.top + rect.height / 2),
    };
  });
  expect(reach.insideTarget).toBe(true);
  expect(reach.beyondTarget).toBe(false);

  // The whole labelled row is interactive for a radio group, so the row itself is the target.
  const row = page.getByRole("radiogroup", { name: "Region", exact: true }).locator("label").first();
  await row.scrollIntoViewIfNeeded();
  const rowBox = await row.boundingBox();
  expect(rowBox, "the radio row has no box").not.toBeNull();
  expect(Math.round(rowBox?.height ?? 0)).toBeGreaterThanOrEqual(44);
  const hitAtRowEnd = await row.evaluate((element) => {
    const rect = element.getBoundingClientRect();
    return (
      document.elementFromPoint(rect.right - 4, rect.top + 4)?.closest("label") === element
    );
  });
  expect(hitAtRowEnd).toBe(true);

  expect(errors).toEqual([]);
});

test("NumberField types, steps and stops at its bounds", async ({ page }) => {
  const errors = trackRuntimeErrors(page);
  const field = page.getByTestId("seats-field");
  const input = field.getByRole("textbox", { name: "Seats" });
  const increase = field.getByRole("button", { name: "Increase" });
  const decrease = field.getByRole("button", { name: "Decrease" });

  await expect(input).toHaveValue("3");
  await expect(input).toHaveAttribute("aria-invalid", "true");

  await increase.click();
  await expect(input).toHaveValue("4");
  await decrease.click();
  await decrease.click();
  await expect(input).toHaveValue("2");

  await input.fill("40");
  await input.blur();
  await expect(input).toHaveValue("10");
  await expect(increase).toBeDisabled();
  await expect(decrease).toBeEnabled();

  expect(errors).toEqual([]);
});
