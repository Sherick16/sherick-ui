import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "./fixtures";

test.beforeEach(async ({ page, errors }) => {
  await page.goto("/examples/resources/customer-portal");
  await page.waitForFunction(() => document.documentElement.dataset.hydrated === "true");
  expect(errors).toEqual([]);
});

test("breadcrumb, stable identity and distinct project views", async ({ page, errors }) => {
  const breadcrumb = page.getByRole("navigation", { name: "Breadcrumb" });
  await expect(breadcrumb.getByRole("link", { name: "Projects" })).toHaveAttribute("href", "/examples/resources");
  await expect(breadcrumb.getByText("Details")).toHaveAttribute("aria-current", "page");
  await expect(breadcrumb.getByText("Customer portal")).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "Customer portal", level: 1 })).toBeVisible();
  await expect(page.getByText("Active", { exact: true })).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "About this project" })).toBeVisible();
  await expect(page.getByText("Team members")).toBeVisible();

  const overview = page.getByRole("tab", { name: "Overview" });
  const activity = page.getByRole("tab", { name: "Activity" });
  await overview.focus();
  await page.keyboard.press("ArrowRight");
  await expect(activity).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(activity).toHaveAttribute("aria-selected", "true");
  await expect(page.getByRole("heading", { name: "Recent activity" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Current priorities" })).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "Customer portal", level: 1 })).toBeVisible();
  await expect(page.getByRole("button", { name: "Edit project" })).toBeVisible();
  await expect(page.getByRole("complementary", { name: "Project details" })).toBeVisible();

  await breadcrumb.getByRole("link", { name: "Projects" }).click();
  await expect(page).toHaveURL(/\/examples\/resources$/);
  await expect(page.getByRole("heading", { name: "Projects", level: 1 })).toBeVisible();
  expect(errors).toEqual([]);
});

test("editing validates, cancels and saves without losing the selected view", async ({ page, errors }) => {
  const edit = page.getByRole("button", { name: "Edit project" });
  await page.getByRole("tab", { name: "Activity" }).click();
  await edit.click();
  const dialog = page.getByRole("dialog", { name: "Edit project" });
  await expect(dialog).toBeVisible();
  const name = dialog.getByRole("textbox", { name: "Project name" });
  const summary = dialog.getByRole("textbox", { name: "Summary" });
  await name.fill(" ");
  await dialog.getByRole("button", { name: "Save changes" }).click();
  await expect(name).toHaveAttribute("aria-invalid", "true");
  await expect(name).toBeFocused();
  await expect(dialog.getByText("Enter at least three characters.")).toBeVisible();
  await dialog.getByRole("button", { name: "Cancel" }).click();
  await expect(dialog).toHaveCount(0);
  await expect(edit).toBeFocused();
  await expect(page.getByRole("heading", { name: "Customer portal", level: 1 })).toBeVisible();

  await edit.click();
  await name.fill("Member portal");
  await summary.fill("Shared work for the customer team.");
  await dialog.getByRole("button", { name: "Save changes" }).click();
  await expect(dialog).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "Member portal", level: 1 })).toBeVisible();
  await expect(page.getByText("Shared work for the customer team.")).toBeVisible();
  await expect(page.getByRole("dialog", { name: "Project updated" })).toBeVisible();
  await expect(page.getByRole("tab", { name: "Activity" })).toHaveAttribute("aria-selected", "true");
  expect(errors).toEqual([]);
});

test("narrow overflow actions and link copying stay usable", async ({ page, context, errors }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.setViewportSize({ width: 320, height: 700 });
  const trigger = page.getByRole("button", { name: "More project actions" });
  await trigger.click();
  const menu = page.getByRole("menu");
  await expect(menu.getByRole("menuitem", { name: "Delete project" })).toBeVisible();
  await menu.getByRole("menuitem", { name: "Copy link" }).click();
  await expect(page.getByRole("dialog", { name: "Link copied" })).toBeVisible();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(page.url());
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
  await page.getByRole("button", { name: "Edit project" }).click();
  await expect(page.getByRole("dialog", { name: "Edit project" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog", { name: "Edit project" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Edit project" })).toBeFocused();
  expect(errors).toEqual([]);
});

test("delete requires confirmation and leaves a useful local result", async ({ page, errors }) => {
  const trigger = page.getByRole("button", { name: "More project actions" });
  await trigger.click();
  await page.getByRole("menuitem", { name: "Delete project" }).click();
  const dialog = page.getByRole("alertdialog", { name: "Delete project?" });
  await expect(dialog).toBeVisible();
  await expect(dialog).toContainText("cannot be undone");
  await expect(dialog.getByRole("button", { name: "Keep project" })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "Customer portal", level: 1 })).toBeVisible();
  await trigger.click();
  await page.getByRole("menuitem", { name: "Delete project" }).click();
  await dialog.getByRole("button", { name: "Delete project" }).click();
  await expect(dialog).toHaveCount(0);
  const heading = page.getByRole("heading", { name: "Project deleted", level: 1 });
  await expect(heading).toBeVisible();
  await expect(heading).toBeFocused();
  await expect(page.getByRole("dialog", { name: "Project deleted" })).toBeVisible();
  await expect(page.getByRole("tablist")).toHaveCount(0);
  await expect(page.getByRole("navigation", { name: "Breadcrumb" }).getByRole("link", { name: "Projects" })).toHaveAttribute("href", "/examples/resources");
  expect(errors).toEqual([]);
});

test("the detail page has no WCAG A/AA violations", async ({ page, errors }) => {
  const result = await new AxeBuilder({ page })
    .include(".detail-page")
    .options({
      runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"] },
      rules: { "target-size": { enabled: true } },
    })
    .analyze();
  expect(result.violations.map((violation) => violation.id)).toEqual([]);
  expect(errors).toEqual([]);
});
