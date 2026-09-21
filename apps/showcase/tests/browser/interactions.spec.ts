import { expect, isTopmost, test, type Page } from "./fixtures";

test.beforeEach(async ({ page, errors }) => {
  await page.goto("/verification/interactions");
});

test("fields expose Base-owned description and error relationships", async ({ page, errors }) => {
  const input = page.getByRole("textbox", { name: "Project name" });

  await expect(input).toBeVisible();
  await expect(input).toHaveAttribute("aria-invalid", "true");
  await expect(input).toHaveAccessibleDescription(
    /Visible to everyone in the workspace\. Project names must be unique\./
  );
  expect(errors).toEqual([]);
});

test("Search remains editable while loading and keeps immediate and submitted values separate", async ({ page, errors }) => {
  const search = page.getByRole("textbox", { name: "Loading search" });

  await expect(search).toBeEnabled();
  await search.fill("agents");
  await expect(page.getByTestId("query-value")).toHaveText("agents");
  await expect(page.getByTestId("last-search")).toHaveText("agents");
  await expect(page.getByRole("button", { name: "Submit search" })).toBeDisabled();
  expect(errors).toEqual([]);
});

test("controlled Tabs and Base form participation compose through the public API", async ({ page, errors }) => {

  await expect(page.getByRole("tab", { name: "Disabled" })).toBeDisabled();
  await page.getByRole("tab", { name: "Details" }).click();
  await expect(page.getByTestId("tab-value")).toHaveText("details");
  await expect(page.getByText("Details panel")).toBeVisible();

  await page.getByRole("switch", { name: "Enabled" }).click();
  await page.getByRole("combobox", { name: "Project type" }).click();
  await page.getByRole("option", { name: "Dashboard" }).click();
  await page.getByRole("button", { name: "Submit form" }).click();

  await expect(page.getByTestId("form-result")).toHaveText("enabled=yes&project=dashboard");
  expect(errors).toEqual([]);
});

test("nested Select consumes Escape before Dialog", async ({ page, errors }) => {

  await page.getByRole("button", { name: "Open dialog" }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await expect(dialog).toHaveAccessibleDescription(
    "Child overlays must dismiss before their parent dialog."
  );
  await expect(page.getByTestId("dialog-state")).toHaveText("open");

  const select = page.getByRole("combobox", { name: "Dialog project type" });
  await select.click();
  const option = page.getByRole("option", { name: "Design system" });
  await expect(option).toBeVisible();
  expect(await isTopmost(option), "a popup opened from inside a dialog must sit above it").toBe(true);
  await page.keyboard.press("Escape");
  await expect(option).toHaveCount(0);
  await expect(dialog).toBeVisible();

  /* A tooltip belongs to the dialog it was opened in, so it has to clear the dialog too. */
  await page.getByRole("button", { name: "Help" }).hover();
  const tooltip = page.getByText("Helpful context");
  await expect(tooltip).toBeVisible();
  expect(await isTopmost(tooltip)).toBe(true);
  /* Park the pointer so the hint is gone before the dismissal order is exercised. */
  await page.mouse.move(2, 2);
  await expect(tooltip).toHaveCount(0);

  await select.click();
  await expect(option).toBeVisible();

  await page.keyboard.press("Escape");
  await expect(page.getByRole("option", { name: "Design system" })).toHaveCount(0);
  await expect(dialog).toBeVisible();

  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
  await expect(page.getByTestId("dialog-state")).toHaveText("closed");
  expect(errors).toEqual([]);
});

test("public callbacks keep Base's event details", async ({ page, errors }) => {
  await page.goto("/verification/interactions");


  /* And a public callback is Base's callback: the event details arrive with the value. */
  await page.getByRole("button", { name: "Open popover" }).click();
  await expect(page.getByTestId("popover-state")).toHaveText("open");
  await expect(page.getByTestId("popover-reason")).not.toHaveText("");

  await page.keyboard.press("Escape");
  await expect(page.getByTestId("popover-state")).toHaveText("closed");
  await expect(page.getByTestId("popover-reason")).toHaveText("escape-key");

  expect(errors).toEqual([]);
});

/* A reusable navigation group cannot know where it sits in the host document's heading hierarchy,
   so the level is the consumer's to choose — and the default is only a default. */
test("a navigation group takes the heading level its document needs", async ({ page, errors }) => {
  await page.goto("/verification/interactions");
  await page.waitForFunction(() => document.documentElement.dataset.hydrated === "true");

  /* The fixture places its group under the page's own h1, so it asks for level 2. */
  await expect(page.getByRole("heading", { level: 2, name: "Sections" })).toHaveCount(1);
  await expect(page.getByRole("heading", { level: 3, name: "Sections" })).toHaveCount(0);

  /* The rows it labels are destinations, not controls: each one is a link, and the current one says
     so on itself rather than by tone alone. */
  const group = page.getByTestId("nav-group");
  await expect(group.getByRole("link")).toHaveCount(3);
  await expect(group.getByRole("link", { name: "Current section" })).toHaveAttribute("aria-current", "page");

  expect(errors).toEqual([]);
});
