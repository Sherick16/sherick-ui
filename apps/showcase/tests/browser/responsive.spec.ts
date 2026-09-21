import { expect, test, type Locator, type Page } from "./fixtures";

const NARROW_VIEWPORT = { width: 320, height: 800 };

/* The measured field controls must be laid out within the narrow wrapper they sit in. */
const fieldControls = (page: Page): Array<[string, Locator]> => [
  ["narrow project name", page.getByRole("textbox", { name: "Narrow project name" })],
  ["narrow notes", page.getByRole("textbox", { name: "Narrow notes" })],
  ["narrow search", page.getByRole("textbox", { name: "Narrow search" })],
  ["narrow project type", page.getByRole("combobox", { name: "Narrow project type" })],
  ["narrow notifications", page.getByRole("checkbox", { name: "Narrow notifications" })],
  ["narrow region", page.getByRole("radiogroup", { name: "Narrow region" })],
  ["narrow budget", page.getByRole("slider", { name: "Narrow budget" })],
  ["narrow seats", page.getByRole("textbox", { name: "Narrow seats" })],
  ["narrow seats stepper", page.getByRole("button", { name: "Increase" })],
];

const openFixture = async (page: Page) => {
  await page.setViewportSize(NARROW_VIEWPORT);
  await page.goto("/verification/responsive");
  await expect(page.getByTestId("verification-responsive")).toBeVisible();
};

const assertNoPageOverflow = async (page: Page, context: string) => {
  const { scrollWidth, clientWidth } = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));

  expect(
    scrollWidth,
    `${context}: document.documentElement.scrollWidth ${scrollWidth} exceeds clientWidth ${clientWidth}`
  ).toBeLessThanOrEqual(clientWidth);
};

const assertControlsFitNarrowContainer = async (page: Page, context: string) => {
  const narrow = await page.getByTestId("narrow-container").evaluate((element) => ({
    scrollWidth: element.scrollWidth,
    clientWidth: element.clientWidth,
  }));

  expect(
    narrow.scrollWidth,
    `${context}: narrow container scrollWidth ${narrow.scrollWidth} exceeds clientWidth ${narrow.clientWidth}`
  ).toBeLessThanOrEqual(narrow.clientWidth + 1);

  for (const [name, control] of fieldControls(page)) {
    const width = await control.first().evaluate((element) => element.getBoundingClientRect().width);
    expect(width, `${context}: "${name}" is ${width}px wide inside a ${narrow.clientWidth}px container`).toBeLessThanOrEqual(
      narrow.clientWidth
    );
  }
};

test("narrow controls fit without widening the page", async ({ page, errors }) => {

  await openFixture(page);
  await assertNoPageOverflow(page, "default narrow layout");
  await assertControlsFitNarrowContainer(page, "default narrow layout");

  expect(errors).toEqual([]);
});

test("the dialog opens without widening the page at the narrow viewport", async ({ page, errors }) => {

  await openFixture(page);
  await page.getByRole("button", { name: "Open narrow dialog" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page.getByTestId("narrow-dialog-state")).toHaveText("open");

  await assertNoPageOverflow(page, "open narrow dialog");

  expect(errors).toEqual([]);
});

test("a tab row wider than its container scrolls inside itself, not in the page", async ({
  page,
  errors,
}) => {
  await openFixture(page);

  const list = page.getByRole("tablist", { name: "Narrow sections" });
  const scroller = list.locator("xpath=..");

  const geometry = await scroller.evaluate((element) => {
    const box = element.getBoundingClientRect();
    return {
      overflowX: getComputedStyle(element).overflowX,
      width: box.width,
      scrollWidth: element.scrollWidth,
      clientWidth: element.clientWidth,
    };
  });

  /* The row is wider than the space it was given, so the difference belongs to the scroller the
     tab row owns; the page keeps its own width, and no consumer has to remember a wrapper. */
  expect(geometry.overflowX).toBe("auto");
  expect(geometry.scrollWidth).toBeGreaterThan(geometry.clientWidth);

  const narrow = await page.getByTestId("narrow-container").evaluate((element) => element.clientWidth);
  expect(
    geometry.width,
    `the tab scroller is ${geometry.width}px wide inside a ${narrow}px column`
  ).toBeLessThanOrEqual(narrow);

  /* A tab nests inside a scrolling track. Its shared inset ring remains inside the target even
     at the track's scrolled edge, without reserving extra space for an outer outline. */
  await page.keyboard.press("Tab");
  const lastTab = list.getByRole("tab").last();
  await lastTab.scrollIntoViewIfNeeded();
  await lastTab.focus();
  const focus = await lastTab.evaluate((element) => {
    const css = getComputedStyle(element);
    const box = element.getBoundingClientRect();
    const clip = element.closest('[role="tablist"]')!.parentElement!.getBoundingClientRect();
    return { visible: element.matches(":focus-visible"), shadow: css.boxShadow,
      left: box.left, right: box.right, clipLeft: clip.left, clipRight: clip.right };
  });
  expect(focus.visible).toBe(true);
  expect(focus.shadow).toContain("inset");
  expect(focus.left, JSON.stringify(focus)).toBeGreaterThanOrEqual(focus.clipLeft);
  expect(focus.right, JSON.stringify(focus)).toBeLessThanOrEqual(focus.clipRight);

  await assertNoPageOverflow(page, "narrow tab row");

  expect(errors).toEqual([]);
});

test("controls stay contained when the document direction is RTL", async ({ page, errors }) => {

  await openFixture(page);
  await page.evaluate(() => {
    document.documentElement.dir = "rtl";
  });

  try {
    await assertNoPageOverflow(page, "RTL narrow layout");
    await assertControlsFitNarrowContainer(page, "RTL narrow layout");
  } finally {
    await page.evaluate(() => {
      document.documentElement.removeAttribute("dir");
    });
  }

  expect(errors).toEqual([]);
});

test("anchored popups stay inside a narrow viewport with long labels", async ({ page, errors }) => {
  await page.setViewportSize(NARROW_VIEWPORT);
  await page.goto("/verification/responsive");
  await expect(page.getByTestId("edge-surfaces")).toBeVisible();

  /* A popup is clamped to what the viewport leaves rather than to its own preferred width, and a
     label longer than that space truncates inside the sheet instead of widening the page. */
  const assertContained = async (name: string, locator: ReturnType<Page["getByRole"]>) => {
    await expect(locator).toBeVisible();
    const metrics = await locator.evaluate((element) => {
      const box = element.getBoundingClientRect();
      return {
        left: box.left,
        right: box.right,
        overflow: element.scrollWidth - element.clientWidth,
      };
    });

    expect(metrics.left, `${name} starts left of the viewport: ${metrics.left}px`).toBeGreaterThanOrEqual(0);
    expect(
      metrics.right,
      `${name} ends right of the viewport: ${metrics.right}px of ${NARROW_VIEWPORT.width}px`
    ).toBeLessThanOrEqual(NARROW_VIEWPORT.width);
    expect(metrics.overflow, `${name} overflows its own sheet by ${metrics.overflow}px`).toBeLessThanOrEqual(1);
  };

  await page.getByRole("combobox", { name: "Long option select" }).click();
  await assertContained("long select popup", page.getByRole("option", { name: /A project name long enough/ }));
  await page.keyboard.press("Escape");

  /* A control's own list follows the control, and is clamped to the viewport rather than to its
     own preferred width — a long option truncates inside the sheet. */
  await page.getByRole("combobox", { name: "Narrow project type" }).click();
  await assertContained(
    "select popup",
    page.getByRole("option", { name: /A project type whose name is longer/ })
  );
  await page.keyboard.press("Escape");

  await page.getByRole("button", { name: "Edge menu" }).click();
  await assertContained("menu popup", page.getByRole("menuitem", { name: /A menu label long enough/ }));
  await page.keyboard.press("Escape");

  await page.getByRole("button", { name: "Edge popover" }).click();
  await assertContained("popover sheet", page.getByText("Anchored to the edges of a narrow viewport."));

  await assertNoPageOverflow(page, "open anchored popups");

  expect(errors).toEqual([]);
});
