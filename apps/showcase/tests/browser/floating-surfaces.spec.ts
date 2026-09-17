import { expect, isTopmost, test, type Locator, type Page } from "./fixtures";

/* Every floating surface on this fixture is portaled, so the shell classes are what the browser
   can be asked about. `.sui-scope` proves the portaled subtree established the private style
   scope; the elevation, shape and acrylic classes prove it composed the shared overlay recipe
   rather than reconstructing a sheet of its own. */
const floatingShell = (page: Page) => page.locator(".sui-scope.shadow-sherick-floating");

const tokenColor = (page: Page, variable: string) =>
  page.evaluate((name) => {
    const probe = document.createElement("div");
    probe.style.color = `oklch(var(${name}))`;
    document.body.appendChild(probe);
    const value = getComputedStyle(probe).color;
    probe.remove();
    return value;
  }, variable);

const openFixture = async (page: Page) => {
  await page.goto("/verification/interactions");
  await expect(page.getByRole("heading", { name: "Interaction verification" })).toBeVisible();
};

test.describe("Popover", () => {
  test("opens the shared floating shell above the page and keeps nested content interactive", async ({ page, errors }) => {
    await openFixture(page);

    await page.getByRole("button", { name: "Open popover" }).click();
    await expect(page.getByTestId("popover-state")).toHaveText("open");

    await expect(floatingShell(page)).toHaveCount(1);
    const shell = await floatingShell(page).evaluate((element) => {
      const style = getComputedStyle(element);
      return {
        portaled: element.closest("main") === null,
        radius: parseFloat(style.borderRadius),
        shadow: style.boxShadow,
        blur: style.backdropFilter,
      };
    });

    expect(shell.portaled, "the popover must be portaled out of the page subtree").toBe(true);
    expect(shell.radius).toBeGreaterThan(16);
    expect(shell.shadow).not.toBe("none");
    expect(shell.blur).toContain("blur");

    await page.getByRole("textbox", { name: "Popover owner" }).fill("Dana");
    await expect(page.getByTestId("popover-owner")).toHaveText("Dana");
    await page.getByRole("button", { name: "Apply" }).click();
    await expect(page.getByTestId("popover-state")).toHaveText("closed");

    expect(errors).toEqual([]);
  });

  test("dismisses on an outside press", async ({ page, errors }) => {
    await openFixture(page);

    await page.getByRole("button", { name: "Open popover" }).click();
    await expect(page.getByTestId("popover-state")).toHaveText("open");

    await page.getByRole("heading", { name: "Interaction verification" }).click();
    await expect(page.getByTestId("popover-state")).toHaveText("closed");
    await expect(page.getByRole("textbox", { name: "Popover owner" })).toHaveCount(0);

    expect(errors).toEqual([]);
  });

  test("consumes Escape and restores focus to its trigger", async ({ page, errors }) => {
    await openFixture(page);

    const trigger = page.getByRole("button", { name: "Open popover" });
    await trigger.click();
    await expect(page.getByTestId("popover-state")).toHaveText("open");

    await page.keyboard.press("Escape");
    await expect(page.getByTestId("popover-state")).toHaveText("closed");
    await expect(trigger).toBeFocused();

    expect(errors).toEqual([]);
  });

  test("settles fully visible while the overlay motion runs", async ({ page, errors }) => {
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await openFixture(page);

    await page.getByRole("button", { name: "Open popover" }).click();
    await expect(floatingShell(page)).toHaveCSS("opacity", "1");
    await expect(page.getByRole("textbox", { name: "Popover owner" })).toBeVisible();

    expect(errors).toEqual([]);
  });
});

test.describe("Menu", () => {
  const item = (page: Page, name: string | RegExp) => page.getByRole("menuitem", { name });

  const openMenu = async (page: Page) => {
    await page.getByRole("button", { name: "Open menu" }).click();
    await expect(item(page, "Rename")).toBeVisible();
  };

  test("navigates with the keyboard and refuses to activate a disabled action", async ({ page, errors }) => {
    await openFixture(page);
    await openMenu(page);

    await page.keyboard.press("Home");
    await expect(item(page, "Rename")).toHaveAttribute("data-highlighted", "");

    /* Base keeps a disabled action reachable rather than skipping it: a disabled `menuitem` is
       focusable so assistive technology can announce that it exists and is unavailable. What is
       skipped is *activation* — `Enter` on it does nothing and leaves the menu open. */
    await page.keyboard.press("ArrowDown");
    await expect(item(page, "Duplicate")).toHaveAttribute("data-disabled", "");
    await expect(item(page, "Duplicate")).toHaveAttribute("data-highlighted", "");

    await page.keyboard.press("Enter");
    await expect(page.getByTestId("menu-action")).toHaveText("");
    await expect(item(page, "Duplicate")).toBeVisible();

    await page.keyboard.press("ArrowDown");
    await expect(item(page, /Archive every deployment/)).toHaveAttribute("data-highlighted", "");
    await page.keyboard.press("Enter");
    await expect(page.getByTestId("menu-action")).toHaveText("archive");

    await openMenu(page);
    await page.keyboard.press("End");
    await expect(item(page, "Delete")).toHaveAttribute("data-highlighted", "");
    await page.keyboard.press("Enter");
    await expect(page.getByTestId("menu-action")).toHaveText("delete");

    expect(errors).toEqual([]);
  });

  test("matches typeahead against the action's own label", async ({ page, errors }) => {
    await openFixture(page);
    await openMenu(page);

    await page.keyboard.press("Home");
    await page.keyboard.type("arc");
    await expect(item(page, /Archive every deployment/)).toHaveAttribute("data-highlighted", "");

    await page.keyboard.press("Enter");
    await expect(page.getByTestId("menu-action")).toHaveText("archive");

    expect(errors).toEqual([]);
  });

  test("does not activate a disabled action", async ({ page, errors }) => {
    await openFixture(page);
    await openMenu(page);

    await item(page, "Duplicate").click({ force: true });
    await expect(page.getByTestId("menu-action")).toHaveText("");
    await expect(item(page, "Rename")).toBeVisible();

    expect(errors).toEqual([]);
  });

  test("consumes Escape, disposes of the popup and restores focus", async ({ page, errors }) => {
    await openFixture(page);

    const trigger = page.getByRole("button", { name: "Open menu" });
    await trigger.click();
    await expect(item(page, "Rename")).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(item(page, "Rename")).toHaveCount(0);
    await expect(trigger).toBeFocused();

    expect(errors).toEqual([]);
  });

  test("dismisses on an outside press", async ({ page, errors }) => {
    await openFixture(page);
    await openMenu(page);

    /* A menu is modal, so the press lands on the plane Base already lays outside the sheet rather
       than on the page beneath it. A raw pointer press is what reaches it: an ordinary click on a
       covered element would be refused by the actionability check instead. */
    await page.mouse.click(4, 4);
    await expect(item(page, "Rename")).toHaveCount(0);

    expect(errors).toEqual([]);
  });

  test("marks a destructive action with the danger role without retoning the sheet", async ({ page, errors }) => {
    await openFixture(page);
    await openMenu(page);

    const danger = await item(page, "Delete").evaluate((element) => getComputedStyle(element).color);
    const neutral = await item(page, "Rename").evaluate((element) => getComputedStyle(element).color);
    const sheet = await floatingShell(page).evaluate((element) => getComputedStyle(element).color);
    const expectedDanger = await tokenColor(page, "--sui-danger");

    expect(danger).toBe(expectedDanger);
    expect(neutral).not.toBe(expectedDanger);
    expect(sheet, "the danger tone belongs to the action, not to the popup").not.toBe(expectedDanger);

    expect(errors).toEqual([]);
  });
});

test.describe("Combobox", () => {
  const combobox = (page: Page, name: string) => page.getByRole("combobox", { name });

  test("keeps Select and Combobox semantics distinct", async ({ page, errors }) => {
    await openFixture(page);

    const select = page.getByRole("combobox", { name: "Project type" });
    const searchable = combobox(page, "Combobox project");

    expect(await select.evaluate((element) => element.tagName)).toBe("BUTTON");
    expect(await select.evaluate((element) => element.getAttribute("aria-autocomplete"))).toBeNull();

    expect(await searchable.evaluate((element) => element.tagName)).toBe("INPUT");
    await expect(searchable).toHaveAttribute("aria-autocomplete", "list");
    await expect(searchable).toHaveAttribute("aria-haspopup", "listbox");

    expect(errors).toEqual([]);
  });

  test("filters by the query and reports when nothing matches", async ({ page, errors }) => {
    await openFixture(page);

    const searchable = combobox(page, "Combobox project");
    await searchable.click();
    await expect(page.getByRole("option", { name: "Dashboard" })).toBeVisible();

    await searchable.fill("dash");
    await expect(page.getByRole("option", { name: "Design system" })).toHaveCount(0);
    await expect(page.getByRole("option", { name: "Dashboard" })).toBeVisible();

    await searchable.fill("nothing matches this");
    await expect(page.getByText("No results found.")).toBeVisible();
    await expect(page.getByRole("option")).toHaveCount(0);

    expect(errors).toEqual([]);
  });

  test("selects the highlighted option with the keyboard and reports the change", async ({ page, errors }) => {
    await openFixture(page);

    const searchable = combobox(page, "Combobox project");
    await searchable.click();
    await searchable.fill("dash");
    await expect(page.getByRole("option", { name: "Dashboard" })).toBeVisible();

    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Enter");

    await expect(page.getByTestId("combobox-value")).toHaveText("dashboard");
    await expect(searchable).toHaveValue("Dashboard");
    await expect(page.getByRole("option", { name: "Dashboard" })).toHaveCount(0);

    expect(errors).toEqual([]);
  });

  test("closes on Escape without losing the selection and clears on request", async ({ page, errors }) => {
    await openFixture(page);

    const searchable = combobox(page, "Combobox project");
    await searchable.click();
    await expect(page.getByRole("option", { name: "Design system" })).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(page.getByRole("option", { name: "Design system" })).toHaveCount(0);
    await expect(page.getByTestId("combobox-value")).toHaveText("design");
    await expect(searchable).toBeFocused();

    const clear = searchable.locator("xpath=..").getByRole("button", { name: "Clear selection" });
    await clear.click();
    await expect(page.getByTestId("combobox-value")).toHaveText("");
    await expect(searchable).toHaveValue("");

    expect(errors).toEqual([]);
  });

  test("cannot select a disabled option", async ({ page, errors }) => {
    await openFixture(page);

    const searchable = combobox(page, "Combobox language");
    await searchable.click();

    const disabledOption = page.getByRole("option", { name: "COBOL" });
    await expect(disabledOption).toHaveAttribute("aria-disabled", "true");

    await disabledOption.click({ force: true });
    await expect(searchable).toHaveValue("");

    expect(errors).toEqual([]);
  });

  test("participates in a form through its own hidden input", async ({ page, errors }) => {
    await openFixture(page);

    await page.getByRole("button", { name: "Submit combobox" }).click();
    await expect(page.getByTestId("combobox-form-result")).toHaveText("team=platform");

    const team = combobox(page, "Combobox team");
    await team.click();
    await page.getByRole("option", { name: "Design" }).click();

    await page.getByRole("button", { name: "Submit combobox" }).click();
    await expect(page.getByTestId("combobox-form-result")).toHaveText("team=design");

    expect(errors).toEqual([]);
  });

  test("composes with Field for its name, description and error", async ({ page, errors }) => {
    await openFixture(page);

    const searchable = combobox(page, "Combobox language");

    await expect(searchable).toHaveAccessibleName("Combobox language");
    await expect(searchable).toHaveAccessibleDescription(
      /Some options cannot be chosen\. Pick a language\./
    );
    await expect(searchable).toHaveAttribute("aria-required", "true");
    await expect(searchable.locator("xpath=..")).toHaveAttribute("data-invalid", "");

    expect(errors).toEqual([]);
  });

  test("is disabled by its own prop and by the field around it", async ({ page, errors }) => {
    await openFixture(page);

    await expect(combobox(page, "Disabled combobox")).toBeDisabled();
    await expect(combobox(page, "Locked combobox")).toBeDisabled();

    expect(errors).toEqual([]);
  });

  test("dismisses its popup before the dialog that contains it", async ({ page, errors }) => {
    await openFixture(page);

    await page.getByRole("button", { name: "Open dialog" }).click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();

    const inner = combobox(page, "Dialog combobox");
    await inner.click();
    const option = page.getByRole("option", { name: "Dashboard" });
    await expect(option).toBeVisible();
    expect(await isTopmost(option), "the popup must clear the dialog that owns it").toBe(true);

    /* The first Escape is the popup's. */
    await page.keyboard.press("Escape");
    await expect(page.getByRole("option", { name: "Dashboard" })).toHaveCount(0);
    await expect(dialog).toBeVisible();
    await expect(page.getByTestId("dialog-state")).toHaveText("open");

    /* The second is Base's combobox contract, not Sherick's: while the popup is closed an Escape
       on a filled input clears the value and stops there, so the dialog cannot be dismissed out
       from under a value the user is still deciding about. */
    await page.keyboard.press("Escape");
    await expect(inner).toHaveValue("");
    await expect(dialog).toBeVisible();

    /* With nothing left to clear, the third Escape reaches the dialog. */
    await page.keyboard.press("Escape");
    await expect(dialog).toHaveCount(0);
    await expect(page.getByTestId("dialog-state")).toHaveText("closed");

    expect(errors).toEqual([]);
  });
});

test.describe("AlertDialog", () => {
  const trigger = (page: Page) => page.getByRole("button", { name: "Delete workspace" });
  const surface = (page: Page) => page.getByRole("alertdialog");
  const action = (page: Page, name: string) => surface(page).getByRole("button", { name });

  test("asks before destroying and puts focus on the safe action", async ({ page, errors }) => {
    await openFixture(page);

    await trigger(page).click();
    await expect(surface(page)).toBeVisible();
    await expect(surface(page)).toHaveAccessibleName("Delete workspace?");
    await expect(surface(page)).toHaveAccessibleDescription(
      /Every project in this workspace is removed\. This action cannot be undone\./
    );
    await expect(page.getByTestId("alert-state")).toHaveText("open");

    /* The destructive action must never be what a stray `Enter` reaches. */
    await expect(action(page, "Keep workspace")).toBeFocused();
    await page.keyboard.press("Enter");

    await expect(surface(page)).toHaveCount(0);
    await expect(page.getByTestId("alert-state")).toHaveText("closed");
    await expect(page.getByTestId("alert-outcome")).toHaveText("cancelled");
    await expect(trigger(page)).toBeFocused();

    expect(errors).toEqual([]);
  });

  test("confirms through the action that carries the danger tone", async ({ page, errors }) => {
    await openFixture(page);

    const expectedDanger = await trigger(page).evaluate(
      (element) => getComputedStyle(element).backgroundColor
    );

    await trigger(page).click();
    const confirm = action(page, "Delete workspace");
    await expect(confirm).toBeVisible();
    await expect(confirm).toHaveCSS("background-color", expectedDanger);

    await confirm.click();
    await expect(page.getByTestId("alert-outcome")).toHaveText("confirmed");
    await expect(surface(page)).toHaveCount(0);

    expect(errors).toEqual([]);
  });

  test("cancels on Escape and refuses an outside press", async ({ page, errors }) => {
    await openFixture(page);

    await trigger(page).click();
    await expect(surface(page)).toBeVisible();

    await page.mouse.click(4, 4);
    await expect(surface(page)).toBeVisible();
    await expect(page.getByTestId("alert-state")).toHaveText("open");

    await page.keyboard.press("Escape");
    await expect(surface(page)).toHaveCount(0);
    await expect(page.getByTestId("alert-outcome")).toHaveText("");
    await expect(trigger(page)).toBeFocused();

    expect(errors).toEqual([]);
  });
});
