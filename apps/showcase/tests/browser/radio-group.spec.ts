import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Locator, type Page } from "./fixtures";

const openFixture = async (page: Page) => {
  await page.goto("/verification/radio-group");
  await page.waitForFunction(() => document.documentElement.dataset.hydrated === "true");
};

const group = (page: Page, name: string) => page.getByRole("radiogroup", { name, exact: true });

const rowFor = (radio: Locator) => radio.locator("xpath=ancestor::label[1]").locator("..");

test.beforeEach(async ({ page }) => {
  await openFixture(page);
});

test("surface rows keep the rich label and the whole padded row selects and submits", async ({
  page,
  errors,
}) => {
  const journal = group(page, "Journal delivery");
  const daily = journal.getByRole("radio", { name: /Daily field notes/ });
  const weekly = journal.getByRole("radio", { name: /Weekly journal/ });
  const dailyRow = rowFor(daily);

  await expect(journal).toBeVisible();
  await expect(daily).toHaveAccessibleName(/Daily field notes A short digest of recent observations/);
  await expect(weekly).toHaveAttribute("aria-checked", "true");

  const selectedSurface = await rowFor(weekly).evaluate((element) => {
    const style = getComputedStyle(element);
    return { background: style.backgroundColor, shadow: style.boxShadow };
  });
  expect(selectedSurface.background).not.toBe("rgba(0, 0, 0, 0)");
  expect(selectedSurface.shadow).not.toBe("none");

  await dailyRow.hover();
  const hoverOpacity = await dailyRow.evaluate((element) =>
    getComputedStyle(element, "::before").opacity
  );
  expect(hoverOpacity).toBe("0.05");

  const paddedRow = await dailyRow.boundingBox();
  expect(paddedRow).not.toBeNull();
  await dailyRow.click({
    position: { x: paddedRow!.width - 2, y: paddedRow!.height - 2 },
  });
  await expect(daily).toHaveAttribute("aria-checked", "true");
  await page.getByRole("button", { name: "Save cadence" }).click();
  await expect(page.getByTestId("radio-form-value")).toHaveText("daily");
  const accessibility = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(accessibility.violations).toEqual([]);

  expect(errors).toEqual([]);
});

test("controlled surface rows update with Space and arrow navigation and keep visible focus", async ({
  page,
  errors,
}) => {
  const publication = group(page, "Publication timing");
  const draft = publication.getByRole("radio", { name: "Keep as a draft" });
  const scheduled = publication.getByRole("radio", { name: "Publish on schedule" });

  await expect(scheduled).toHaveAttribute("aria-checked", "true");
  await draft.focus();
  await page.keyboard.press("Space");
  await expect(draft).toHaveAttribute("aria-checked", "true");
  await expect(page.getByTestId("controlled-radio-value")).toHaveText("draft");

  await page.keyboard.press("ArrowDown");
  await expect(scheduled).toHaveAttribute("aria-checked", "true");
  await expect(page.getByTestId("controlled-radio-value")).toHaveText("scheduled");

  const focus = await rowFor(scheduled).evaluate((element) => {
    const style = getComputedStyle(element);
    return {
      visible: element.querySelector('[role="radio"]')?.matches(":focus-visible"),
      outlineStyle: style.outlineStyle,
      outlineWidth: style.outlineWidth,
    };
  });
  expect(focus.visible).toBe(true);
  expect(focus.outlineStyle).toBe("solid");
  expect(focus.outlineWidth).toBe("2px");
  // The surface is the focus owner; the mark keeps its own selection boundary only.
  expect(await scheduled.locator('[aria-hidden="true"]').first().evaluate((element) => getComputedStyle(element).outlineStyle)).toBe("none");

  expect(errors).toEqual([]);
});

test("disabled and read-only surface choices cannot be changed and do not answer a press", async ({
  page,
  errors,
}) => {
  const journal = group(page, "Journal delivery");
  const unavailableOption = journal.getByRole("radio", { name: /Monthly archive/ });
  const unavailableRow = rowFor(unavailableOption);

  await expect(unavailableOption).toBeDisabled();
  await unavailableRow.hover();
  await expect(unavailableRow).toHaveCSS("opacity", "0.45");
  expect(
    await unavailableRow.evaluate((element) => getComputedStyle(element, "::before").opacity)
  ).toBe("0");
  await unavailableRow.click();
  await expect(unavailableOption).not.toBeChecked();
  const weekly = journal.getByRole("radio", { name: /Weekly journal/ });
  await expect(weekly).toBeChecked();
  await weekly.focus();
  await page.keyboard.press("ArrowDown");
  await expect(journal.getByRole("radio", { name: /Daily field notes/ })).toBeChecked();

  const locked = group(page, "Locked archive period");
  const lockedQuarter = locked.getByRole("radio", { name: "Quarterly" });
  await expect(lockedQuarter).toBeDisabled();
  await expect(lockedQuarter).toHaveAttribute("aria-checked", "true");

  const saved = group(page, "Saved print setting");
  const singleSided = saved.getByRole("radio", { name: "Single-sided" });
  const doubleSided = saved.getByRole("radio", { name: "Double-sided" });
  const readOnlyRow = rowFor(doubleSided);
  await expect(singleSided).toHaveAttribute("aria-checked", "true");
  await expect(doubleSided).not.toBeDisabled();

  await readOnlyRow.hover();
  expect(await readOnlyRow.evaluate((element) => getComputedStyle(element, "::before").opacity)).toBe("0");
  await readOnlyRow.click();
  await doubleSided.focus();
  await page.keyboard.press("Space");
  await page.keyboard.press("ArrowDown");

  await expect(singleSided).toHaveAttribute("aria-checked", "true");
  await expect(doubleSided).toHaveAttribute("aria-checked", "false");

  expect(errors).toEqual([]);
});

test("label content wraps inside a narrow row and RTL keeps the mark at inline start", async ({
  page,
  errors,
}) => {
  await page.setViewportSize({ width: 320, height: 800 });

  const journal = group(page, "Journal delivery");
  const wrapper = page.getByTestId("narrow-radio-container");
  const weekly = journal.getByRole("radio", { name: /Weekly journal/ });
  const weeklyRow = rowFor(weekly);
  const geometry = await Promise.all([
    wrapper.boundingBox(),
    weeklyRow.boundingBox(),
    page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    })),
  ]);
  const [wrapperBox, rowBox, viewport] = geometry;

  expect(wrapperBox).not.toBeNull();
  expect(rowBox).not.toBeNull();
  expect(rowBox!.width).toBeLessThanOrEqual(wrapperBox!.width);
  expect(rowBox!.height).toBeGreaterThan(48);
  expect(viewport.scrollWidth).toBeLessThanOrEqual(viewport.clientWidth);

  const rtlGroup = page.getByTestId("rtl-radio-group");
  const morning = rtlGroup.getByRole("radio", { name: "Morning summary" });
  const morningLabel = page.getByText("Morning summary", { exact: true });
  const [radioBox, labelBox] = await Promise.all([morning.boundingBox(), morningLabel.boundingBox()]);
  expect(radioBox).not.toBeNull();
  expect(labelBox).not.toBeNull();
  expect(radioBox!.x).toBeGreaterThan(labelBox!.x);

  await morning.focus();
  await page.keyboard.press("ArrowDown");
  await expect(rtlGroup.getByRole("radio", { name: "Evening summary" })).toHaveAttribute(
    "aria-checked",
    "true"
  );

  expect(errors).toEqual([]);
});

test("forced colors retain radio boundaries and one focus ring on the control", async ({
  page,
  errors,
}) => {
  await page.emulateMedia({ forcedColors: "active" });

  const journal = group(page, "Journal delivery");
  const weekly = journal.getByRole("radio", { name: /Weekly journal/ });
  const daily = journal.getByRole("radio", { name: /Daily field notes/ });
  const selectedBoundary = await weekly.evaluate((element) => {
    const style = getComputedStyle(element);
    return { outline: style.outlineStyle, width: style.outlineWidth };
  });
  const restingBoundary = await daily.evaluate((element) => {
    const style = getComputedStyle(element);
    return { outline: style.outlineStyle, width: style.outlineWidth };
  });

  expect(selectedBoundary.outline).toBe("solid");
  expect(restingBoundary.outline).toBe("solid");
  expect(restingBoundary.width).toBe("1px");

  await daily.focus();
  const focusOutline = await rowFor(daily).evaluate((element) => {
    const style = getComputedStyle(element);
    return { style: style.outlineStyle, width: style.outlineWidth };
  });
  expect(focusOutline.style).toBe("none");
  await expect(daily).toHaveCSS("outline-style", "solid");
  await expect(daily).toHaveCSS("outline-width", "2px");

  expect(errors).toEqual([]);
});
