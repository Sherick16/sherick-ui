import { expect, test, type Page } from "./fixtures";

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
  await expect(page.getByRole("option", { name: "Design system" })).toBeVisible();

  await page.keyboard.press("Escape");
  await expect(page.getByRole("option", { name: "Design system" })).toHaveCount(0);
  await expect(dialog).toBeVisible();

  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
  await expect(page.getByTestId("dialog-state")).toHaveText("closed");
  expect(errors).toEqual([]);
});
