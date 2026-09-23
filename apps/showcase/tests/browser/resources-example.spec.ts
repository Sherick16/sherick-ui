import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "./fixtures";

test.beforeEach(async ({ page, errors }) => {
  await page.goto("/examples/resources");
  await page.waitForFunction(() => document.documentElement.dataset.hydrated === "true");
  expect(errors).toEqual([]);
});

test("search, filters, sorting and pagination form one list workflow", async ({ page, errors }) => {
  const search = page.getByRole("textbox", { name: "Search projects or owners" });
  await expect(page.getByRole("status").filter({ hasText: "13 projects" })).toBeVisible();
  await page.getByRole("navigation", { name: "Project pages" }).getByRole("button", { name: "Page 3" }).click();
  await expect(page.getByText("Showing 11–13 of 13")).toBeVisible();
  await search.fill("help");
  await expect(page.getByRole("row", { name: /Help center/ })).toBeVisible();
  await expect(page.getByRole("status").filter({ hasText: "1 of 13 projects" })).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Project pages" })).toHaveCount(0);

  await search.fill("");
  await page.getByRole("combobox", { name: "Status" }).click();
  await page.getByRole("option", { name: "Archived" }).click();
  await expect(page.getByRole("status").filter({ hasText: "4 of 13 projects" })).toBeVisible();
  await page.getByRole("combobox", { name: "Owner" }).click();
  await page.getByRole("option", { name: "Assigned to me" }).click();
  await expect(page.getByRole("status").filter({ hasText: "2 of 13 projects" })).toBeVisible();
  await page.getByRole("combobox", { name: "Sort by" }).click();
  await page.getByRole("option", { name: "Name A–Z" }).click();
  await expect(page.getByRole("row").nth(1)).toContainText("Migration planning");
  await page.getByRole("button", { name: "Clear filters" }).click();
  await expect(page.getByRole("status").filter({ hasText: "13 projects" })).toBeVisible();
  await expect(page.getByRole("row").nth(1)).toContainText("Account settings");

  await search.fill("no matching name");
  await expect(page.getByRole("heading", { name: "No matching projects" })).toBeVisible();
  await expect(page.getByRole("table")).toHaveCount(0);
  await page.getByRole("button", { name: "Clear search and filters" }).click();
  await expect(search).toHaveValue("");
  await expect(page.getByRole("table")).toBeVisible();
  expect(errors).toEqual([]);
});

test("archive adjusts the available pages and narrow tables remain scrollable", async ({ page, errors }) => {
  await page.getByRole("combobox", { name: "Status" }).click();
  await page.getByRole("option", { name: "Active" }).click();
  await expect(page.getByRole("status").filter({ hasText: "9 of 13 projects" })).toBeVisible();
  await page.getByRole("navigation", { name: "Project pages" }).getByRole("button", { name: "Page 2" }).click();
  for (let i = 0; i < 4; i++) {
    await page.getByRole("row").nth(1).getByRole("button", { name: /^Archive/ }).click();
  }
  await expect(page.getByRole("status").filter({ hasText: "5 of 13 projects" })).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Project pages" })).toHaveCount(0);
  await expect(page.getByRole("row", { name: /Customer portal/ })).toBeVisible();

  await page.setViewportSize({ width: 320, height: 700 });
  const table = page.getByRole("table");
  expect(await table.locator("..").evaluate((wrapper) => wrapper.scrollWidth > wrapper.clientWidth)).toBe(true);
  expect(await table.getByRole("row").nth(1).evaluate((row) => row.getBoundingClientRect().height)).toBeLessThan(90);
  const action = page.getByRole("button", { name: "Archive Customer portal" });
  await action.focus();
  await expect(action).toBeFocused();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
  expect(errors).toEqual([]);
});

test("a workspace without projects offers creation instead of filter advice", async ({ page, errors }) => {
  await page.goto("/examples/resources/empty");
  await page.waitForFunction(() => document.documentElement.dataset.hydrated === "true");
  await expect(page.getByRole("heading", { name: "No projects yet" })).toBeVisible();
  await expect(page.getByRole("table")).toHaveCount(0);
  await expect(page.getByRole("textbox", { name: "Search projects or owners" })).toHaveCount(0);
  await page.getByRole("button", { name: "Create a project" }).click();
  await expect(page.getByRole("row", { name: /Untitled project/ })).toBeVisible();
  await expect(page.getByRole("status").filter({ hasText: "1 project" })).toBeVisible();
  expect(errors).toEqual([]);
});

test("the populated list has no WCAG A/AA violations", async ({ page, errors }) => {
  const result = await new AxeBuilder({ page })
    .include(".resources-page")
    .options({
      runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"] },
      rules: { "target-size": { enabled: true } },
    })
    .analyze();
  expect(result.violations.map((violation) => violation.id)).toEqual([]);
  expect(errors).toEqual([]);
});
