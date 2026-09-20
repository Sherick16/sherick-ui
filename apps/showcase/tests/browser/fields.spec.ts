import { expect, test, type Page } from "./fixtures";

test.beforeEach(async ({ page }) => {
  await page.goto("/verification/interactions");
});

test("Field gives one control its label, description and error", async ({ page, errors }) => {
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

test("a required field puts the requirement on the control, not only on its label", async ({
  page,
  errors,
}) => {
  const input = page.getByTestId("seats-field").getByRole("textbox", { name: "Seats" });

  await expect(input).toHaveAttribute("required", "");
  await expect(input).toHaveAttribute("data-required", "");
  await expect(page.getByTestId("seats-field").getByText("*")).toBeVisible();

  expect(errors).toEqual([]);
});

test("a field renders Base's own validation message when it is not given one", async ({
  page,
  errors,
}) => {
  const field = page.getByText("Priority").locator("..");
  const input = field.getByRole("textbox", { name: "Priority" });
  const message = page.getByText("Choose five or fewer");

  await expect(message).toHaveCount(0);

  await input.fill("6");
  await input.blur();

  await expect(message).toBeVisible();
  await expect(input).toHaveAttribute("aria-invalid", "true");
  await expect(input).toHaveAccessibleDescription(/Choose five or fewer/);

  await input.fill("4");
  await input.blur();
  await expect(message).toHaveCount(0);

  expect(errors).toEqual([]);
});

test("a field's disabled state reaches the control's own styling", async ({ page, errors }) => {
  const checkbox = page.getByRole("checkbox", { name: "Locked by its field" });

  // Base disables the control through the field; Sherick must style it disabled without ever
  // having received a `disabled` prop of its own.
  await expect(checkbox).toBeDisabled();
  await expect(checkbox).toHaveAttribute("data-disabled", "");

  const styled = await checkbox.evaluate((element) => {
    const style = getComputedStyle(element);
    return { opacity: style.opacity, cursor: style.cursor };
  });
  expect(styled.opacity).toBe("0.45");
  expect(styled.cursor).toBe("not-allowed");

  expect(errors).toEqual([]);
});

test("Checkbox toggles from the keyboard and reproduces its state in the form", async ({
  page,
  errors,
}) => {
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

test("an indeterminate checkbox is mixed, not ticked", async ({ page, errors }) => {
  const partial = page.getByRole("checkbox", { name: "Partial selection" });

  await expect(partial).toHaveAttribute("aria-checked", "mixed");

  /* The mixed state must reach the native input, not only the rendered box: a form input
     that reports `indeterminate: false` silently loses the distinction. `aria-checked` is in
     the server-rendered markup, while the input's `indeterminate` *property* can only be
     assigned once React has hydrated — so the read waits for the marker the root layout sets
     after the whole tree below it has run its effects, which is the state and not a timeout. */
  await page.waitForFunction(() => document.documentElement.dataset.hydrated === "true");

  const inputIndeterminate = await partial.evaluate((element) => {
    const sibling = element.nextElementSibling;
    return sibling instanceof HTMLInputElement ? sibling.indeterminate : null;
  });
  expect(inputIndeterminate).toBe(true);

  expect(errors).toEqual([]);
});

test("RadioGroup selects one value with the keyboard and submits it", async ({ page, errors }) => {
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

test("Slider adjusts and reports its value from the keyboard", async ({ page, errors }) => {
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

test("the selection family holds one accent token in both themes", async ({ page, errors }) => {
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
  errors,
}) => {
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
    return document.elementFromPoint(rect.right - 4, rect.top + 4)?.closest("label") === element;
  });
  expect(hitAtRowEnd).toBe(true);

  expect(errors).toEqual([]);
});

test("expanded hit areas stay separate in rows at the library's own rhythm", async ({
  page,
  errors,
}) => {
  const first = page.getByRole("checkbox", { name: "First row" });
  const second = page.getByRole("checkbox", { name: "Second row" });

  await first.scrollIntoViewIfNeeded();
  const [firstBox, secondBox] = await Promise.all([first.boundingBox(), second.boundingBox()]);
  expect(firstBox).not.toBeNull();
  expect(secondBox).not.toBeNull();

  // Between two 24px marks in 48px rows the 44px targets cannot meet: the point in the gap
  // belongs to neither control, so a click aimed at one row can never land on its neighbour.
  const gapY = ((firstBox?.y ?? 0) + (firstBox?.height ?? 0) + (secondBox?.y ?? 0)) / 2;
  const gapHits = await page.evaluate(
    ({ x, y }) => {
      const element = document.elementFromPoint(x, y);
      return element?.closest('[role="checkbox"]') !== null;
    },
    { x: (firstBox?.x ?? 0) + (firstBox?.width ?? 0) / 2, y: gapY }
  );
  expect(gapHits).toBe(false);

  // And each control still answers across its own row's height.
  const rowHeight = (secondBox?.y ?? 0) - (firstBox?.y ?? 0);
  expect(rowHeight).toBeGreaterThanOrEqual(44);
  await first.click({ position: { x: 12, y: 12 } });
  await expect(first).toHaveAttribute("aria-checked", "true");
  await expect(second).toHaveAttribute("aria-checked", "false");

  expect(errors).toEqual([]);
});

test("a checkbox neither moves nor drifts off its line when its mark arrives", async ({
  page,
  errors,
}) => {
  const inline = page.getByRole("checkbox", { name: "Inline terms" });

  // The reported defect: the control sat on its text baseline, so its own mark changed the line
  // box it was laid out in and the box jumped a couple of pixels on every toggle.
  await inline.scrollIntoViewIfNeeded();
  const read = () =>
    inline.evaluate((element) => {
      const line = element.parentElement?.getBoundingClientRect();
      const box = element.getBoundingClientRect();
      return {
        lineHeight: +(line?.height ?? 0).toFixed(2),
        boxTop: +box.top.toFixed(2),
        boxCenter: +(box.top + box.height / 2).toFixed(2),
      };
    });

  const checked = await read();
  await inline.click();
  await expect(inline).toHaveAttribute("aria-checked", "false");
  const unchecked = await read();
  await inline.click();
  await expect(inline).toHaveAttribute("aria-checked", "true");
  const backToChecked = await read();

  expect(unchecked.boxTop).toBe(checked.boxTop);
  expect(backToChecked.boxTop).toBe(checked.boxTop);
  expect(unchecked.lineHeight).toBe(checked.lineHeight);
  expect(unchecked.boxCenter).toBe(checked.boxCenter);

  expect(errors).toEqual([]);
});

test("a selection mark's boundary does not move while it is pressed", async ({ page, errors }) => {
  // Measured during the press, which is the interval the earlier tests could not see: a zoom on a
  // control whose outline *is* the mark reads as the mark jumping.
  const measurePress = async (locator: ReturnType<typeof page.getByRole>) => {
    const well = locator.locator("span").first();
    await locator.scrollIntoViewIfNeeded();
    const before = await well.boundingBox();

    await locator.hover();
    await page.mouse.down();
    const pressed = await well.boundingBox();
    await page.mouse.up();

    return { before, pressed };
  };

  const radio = page
    .getByRole("radiogroup", { name: "Region", exact: true })
    .getByRole("radio", { name: "United States" });
  const radioWell = await measurePress(radio);
  expect(radioWell.pressed?.y).toBe(radioWell.before?.y);
  expect(radioWell.pressed?.height).toBe(radioWell.before?.height);

  const checkbox = page.getByRole("checkbox", { name: "Partial selection" });
  const checkboxWell = await measurePress(checkbox);
  expect(checkboxWell.pressed?.y).toBe(checkboxWell.before?.y);
  expect(checkboxWell.pressed?.height).toBe(checkboxWell.before?.height);

  expect(errors).toEqual([]);
});

test("a radio row keeps its circle on the text line in either state", async ({ page, errors }) => {
  const group = page.getByRole("radiogroup", { name: "Region", exact: true });

  const read = () =>
    group.evaluate((element) =>
      [...element.querySelectorAll("label")].map((label) => {
        const radio = label.querySelector('[role="radio"]');
        const well = radio?.querySelector("span");
        const text = [...label.querySelectorAll("span")].find(
          (candidate) => candidate.textContent.trim().length > 2
        );
        const wellBox = well?.getBoundingClientRect();
        const textBox = text?.getBoundingClientRect();
        const radioBox = radio?.getBoundingClientRect();
        return {
          selected: radio?.getAttribute("aria-checked") === "true",
          well: `${wellBox?.width.toFixed(1)}x${wellBox?.height.toFixed(1)}`,
          centerDelta: +(
            (wellBox?.top ?? 0) +
            (wellBox?.height ?? 0) / 2 -
            ((textBox?.top ?? 0) + (textBox?.height ?? 0) / 2)
          ).toFixed(2),
          top: +(radioBox?.top ?? 0).toFixed(2),
        };
      })
    );

  await group.scrollIntoViewIfNeeded();
  const before = await read();
  expect(before.length).toBeGreaterThan(1);

  await group.getByRole("radio", { name: "United States" }).click();
  const after = await read();

  for (const [index, row] of after.entries()) {
    expect(row.centerDelta, `row ${index} circle is off its text line`).toBeLessThanOrEqual(0.5);
    expect(row.well, `row ${index} circle changed size`).toBe(before[index].well);
    expect(row.top, `row ${index} moved on selection`).toBe(before[index].top);
  }
  expect(before.some((row) => row.selected)).toBe(true);
  expect(after.some((row) => row.selected)).toBe(true);

  expect(errors).toEqual([]);
});

test("NumberField types, steps and stops at its bounds", async ({ page, errors }) => {
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

  // A stepper that disabled itself at a bound must not keep a hover affordance.
  await increase.hover();
  const restingLayerOpacity = await increase.evaluate(
    (element) => getComputedStyle(element, "::before").opacity
  );
  expect(Number(restingLayerOpacity)).toBe(0);

  expect(errors).toEqual([]);
});

/* An unchecked box and an unselected radio have no fill of their own to identify them: the matte
   step and the recessed lip sit within a couple of percent of the surface around them, which is
   well under the 3:1 WCAG asks of the information that identifies a component. What closes that gap
   is the shared non-text detail rim, so this reads the *rendered* rim — its width, and the colour it
   actually paints — against the theme's own resolved tokens rather than against a class name. */
test("a resting selection mark draws its boundary in the non-text detail tone", async ({ page, errors }) => {
  await page.goto("/verification/interactions");
  await page.waitForFunction(() => document.documentElement.dataset.hydrated === "true");

  const readRim = (locator: ReturnType<Page["locator"]>) =>
    locator.evaluate((element) => {
      const rim = getComputedStyle(element, "::after");
      const resolved = (name: string) => {
        const probe = document.createElement("div");
        probe.style.color = `oklch(var(${name}))`;
        document.body.appendChild(probe);
        const value = getComputedStyle(probe).color;
        probe.remove();
        return value;
      };
      return {
        width: Number.parseFloat(rim.borderTopWidth),
        colour: rim.borderTopColor,
        detail: resolved("--sui-detail"),
        style: rim.borderTopStyle,
      };
    });

  for (const [name, locator] of [
    ["an unchecked box", page.locator('button[role="checkbox"][aria-checked="false"] span[aria-hidden="true"]').first()],
    ["an unselected radio", page.locator('[role="radio"][aria-checked="false"] span[aria-hidden="true"]').first()],
  ] as const) {
    await locator.scrollIntoViewIfNeeded();
    const rim = await readRim(locator);
    expect(rim.style, `${name} draws a boundary`).not.toBe("none");
    expect(rim.width, `${name}'s boundary is visible on a 1x display`).toBeGreaterThanOrEqual(2);
    expect(rim.colour, `${name} draws it in the detail tone`).toBe(rim.detail);
  }

  /* The rim belongs to the resting fill: a mark that holds a value is identified by that fill. */
  const checked = page.locator('button[role="checkbox"][aria-checked="true"] span[aria-hidden="true"]').first();
  const checkedRim = await readRim(checked);
  expect(checkedRim.colour, "a filled mark's rim takes its own fill").not.toBe(checkedRim.detail);

  expect(errors).toEqual([]);
});
