import { expect, test, type Page } from "./fixtures";

test("hostile custom theme keeps semantic on-colors distinct across components and portals", async ({ page, errors }) => {
  await page.goto("/verification/theme-torture");
  await expect(page.getByTestId("theme-torture")).toBeVisible();

  const primary = page.getByRole("button", { name: "Primary" });
  const danger = page.getByRole("button", { name: "Danger" });
  const warning = page.getByRole("button", { name: "Warning" });
  const success = page.getByRole("button", { name: "Success" });

  const styles = await Promise.all(
    [primary, danger, warning, success].map((locator) =>
      locator.evaluate((element) => {
        const style = getComputedStyle(element);
        return { background: style.backgroundColor, color: style.color };
      })
    )
  );

  expect(new Set(styles.map((style) => style.background)).size).toBe(4);
  expect(styles[0].color).not.toBe(styles[1].color);
  expect(styles[2].color).not.toBe(styles[3].color);

  // A selected surface in the family holds the same accent as the primary action, so the
  // custom theme reaches it through the token rather than through a local color.
  const selectedSurface = await page
    .getByRole("checkbox", { name: "Torture checkbox" })
    .locator("span")
    .first()
    .evaluate((element) => getComputedStyle(element).backgroundColor);
  expect(selectedSurface).toBe(styles[0].background);

  await page.getByRole("combobox", { name: "Torture select" }).click();
  await expect(page.getByRole("option", { name: "Alpha" })).toBeVisible();
  await page.keyboard.press("Escape");

  await page.getByRole("button", { name: "Open torture dialog" }).click();
  const dialogDanger = page.getByRole("button", { name: "Dialog danger" });
  await expect(dialogDanger).toBeVisible();
  const portalBackground = await dialogDanger.evaluate((element) => getComputedStyle(element).backgroundColor);
  expect(portalBackground).toBe(styles[1].background);

  expect(errors).toEqual([]);
});

test("forced-colors preserves canonical focus and important state boundaries", async ({ page, errors }) => {
  await page.emulateMedia({ forcedColors: "active" });
  await page.goto("/verification/theme-torture");

  const primary = page.getByRole("button", { name: "Primary" });
  await primary.focus();
  const focus = await primary.evaluate((element) => {
    const style = getComputedStyle(element);
    return { style: style.outlineStyle, width: style.outlineWidth };
  });
  expect(focus.style).not.toBe("none");
  expect(parseFloat(focus.width)).toBeGreaterThanOrEqual(2);

  const selectedTab = page.getByRole("tab", { name: "Selected" });
  await expect(selectedTab).toHaveAttribute("aria-selected", "true");
  expect(await selectedTab.evaluate((element) => getComputedStyle(element).outlineStyle)).not.toBe("none");

  const checkedSwitch = page.getByRole("switch", { name: "Success switch" });
  await expect(checkedSwitch).toHaveAttribute("aria-checked", "true");
  expect(await checkedSwitch.evaluate((element) => getComputedStyle(element).outlineStyle)).not.toBe("none");

  // A selected checkbox, a selected radio and a slider thumb all carry their meaning in
  // tone or depth alone, both of which forced colors removes.
  for (const selected of [
    page.getByRole("checkbox", { name: "Torture checkbox" }),
    page.getByRole("radio", { name: "Alpha" }),
  ]) {
    await expect(selected).toHaveAttribute("aria-checked", "true");
    expect(await selected.evaluate((element) => getComputedStyle(element).outlineStyle)).not.toBe("none");
  }

  const thumb = page.getByRole("slider", { name: "Torture slider" }).locator("..");
  expect(await thumb.evaluate((element) => getComputedStyle(element).borderStyle)).not.toBe("none");

  await page.getByRole("button", { name: "Open torture dialog" }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  expect(await dialog.evaluate((element) => getComputedStyle(element).borderStyle)).not.toBe("none");

  expect(errors).toEqual([]);
});
