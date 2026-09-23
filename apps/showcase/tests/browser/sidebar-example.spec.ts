import { expect, test } from "./fixtures";

test("sidebar routes and mobile navigation remain accessible", async ({ page, errors }) => {
  await page.goto("/examples/sidebar/overview");
  await expect(page.getByRole("navigation", { name: "Main navigation" })).toHaveCount(1);
  await expect(page.getByRole("link", { name: "Overview" })).toHaveAttribute("aria-current", "page");
  await page.getByRole("link", { name: "Projects" }).click();
  await expect(page.getByRole("heading", { name: "Projects", level: 1 })).toBeVisible();
  await expect(page.getByRole("link", { name: "Projects" })).toHaveAttribute("aria-current", "page");

  await page.setViewportSize({ width: 375, height: 667 });
  const trigger = page.getByRole("button", { name: "Open navigation" });
  await trigger.focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("dialog", { name: "Atlas" })).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Main navigation" })).toHaveCount(1);
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog", { name: "Atlas" })).toHaveCount(0);
  await expect(trigger).toBeFocused();

  await trigger.click();
  await page.getByRole("dialog", { name: "Atlas" }).getByRole("link", { name: "Team" }).click();
  await expect(page.getByRole("heading", { name: "Team", level: 1 })).toBeVisible();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Team" })).toHaveCount(0);
  expect(errors).toEqual([]);
});
