import { expect, test } from "@playwright/test";

test("passive native tables scroll from the keyboard without a host reset", async ({ page }) => {
  await page.goto("/");
  const fixture = page.getByTestId("presentation-table");
  const scroll = fixture.locator(".presentation-scroll");
  await expect(fixture.getByRole("table")).toHaveCSS("table-layout", "fixed");
  await expect(fixture.getByRole("columnheader", { name: "Component" })).toHaveClass(/presentation-component/);
  await expect(fixture.getByRole("cell", { name: "Button", exact: true })).toHaveClass(/presentation-component/);
  await scroll.focus();
  await expect(scroll).toBeFocused();
  await expect(scroll).toHaveCSS("outline-width", "2px");
  await page.keyboard.press("ArrowRight");
  await expect.poll(() => scroll.evaluate((element) => element.scrollLeft)).toBeGreaterThan(0);
});
