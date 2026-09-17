import { expect, test, type Locator, type Page } from "./fixtures";

const NARROW_VIEWPORT = { width: 320, height: 800 };

/* The measured field controls: native inputs, the textarea, the Select trigger and the
   Wave A family. Each must be laid out within the narrow wrapper it sits in. */
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
