import { expect, isTopmost, test, type Locator, type Page } from "./fixtures";

const layerOf = (locator: Locator) =>
  locator.evaluate((element) => getComputedStyle(element, "::before").opacity);

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

  test("anchors its entrance to the resolved side, not to a default one", async ({ page, errors }) => {
    await openFixture(page);

    await page.getByRole("button", { name: "Open top popover" }).click();
    const shell = floatingShell(page);
    await expect(shell).toBeVisible();
    await expect(shell).toHaveAttribute("data-side", "top");

    const geometry = await shell.evaluate((element) => {
      const style = getComputedStyle(element);
      return {
        shiftY: style.getPropertyValue("--sui-overlay-from-shift-y").trim(),
        shiftX: style.getPropertyValue("--sui-overlay-from-shift-x").trim(),
      };
    });

    /* The origin is the anchor edge Base resolved: a surface above its trigger grows out of its
       *bottom* edge, where `origin-top` — the edge the recipe used to hard-code — grew it out of
       the top edge it is not attached to. Measured inside the popup's own box, so it holds
       whichever way the browser reports the value. */
    const originY = (shell: Locator) =>
      shell.evaluate((element) => {
        const { height } = element.getBoundingClientRect();
        const vertical = getComputedStyle(element).transformOrigin.split(" ").slice(1).join(" ");
        const percent = /([\d.]+)%/.exec(vertical);
        return {
          y: percent ? (Number(percent[1]) / 100) * height : Number.parseFloat(vertical),
          half: height / 2,
        };
      });

    const above = await originY(shell);
    expect(above.y).toBeGreaterThan(above.half);

    /* And it settles *down* into place, which is the opposite of the below-trigger default. */
    expect(geometry.shiftY).toBe("4px");
    expect(geometry.shiftX).toBe("");

    /* The same surface anchored below its trigger resolves the other edge from the same recipe. */
    await page.keyboard.press("Escape");
    await expect(shell).toHaveCount(0);
    await page.getByRole("button", { name: "Open popover" }).click();
    const below = page.locator('.sui-scope.shadow-sherick-floating[data-side="bottom"]');
    await expect(below).toBeVisible();
    const underneath = await originY(below);
    expect(underneath.y).toBeLessThan(underneath.half);
    expect(await below.evaluate((element) => getComputedStyle(element).getPropertyValue("--sui-overlay-from-shift-y").trim())).toBe("-4px");

    expect(errors).toEqual([]);
  });
});

/** What a row renders: its navigation highlight, whether the platform calls its focus visible, and
 *  whether it is painting a ring — read from the rendered `::before` opacity and `box-shadow`. */
const ringOf = (locator: Locator) =>
  locator.evaluate((element) => {
    const before = getComputedStyle(element, "::before");
    const style = getComputedStyle(element);
    const insetSpreads = style.boxShadow
      .split(/,\s*(?![^()]*\))/)
      .filter((layer) => /inset/.test(layer))
      .map((layer) => [...layer.matchAll(/(-?[\d.]+)px/g)].map((match) => Number.parseFloat(match[1])))
      .filter((widths) => widths.length === 4)
      .map((widths) => widths[3]);
    return {
      highlighted: Number(before.opacity) > 0,
      focusVisible: element.matches(":focus-visible"),
      ring: insetSpreads.some((spread) => spread > 0) ? "ringed" : "none",
    };
  });

test.describe("Menu", () => {
  const item = (page: Page, name: string | RegExp) => page.getByRole("menuitem", { name });
  const menu = (page: Page) => page.getByRole("menu");

  /* Opening a menu has two steps, and the keyboard only reaches the menu after the second: Base
     focuses the popup once it has positioned it, so a key sent while the trigger still owns focus
     goes to the trigger and moves nothing. The wait is for the state a key needs, not for the row
     to be painted — `toBeVisible` is satisfied by the first step alone. */
  const openMenu = async (page: Page) => {
    await page.getByRole("button", { name: "Open menu" }).click();
    await expect(item(page, "Rename")).toBeVisible();
    await expect(menu(page)).toBeFocused();
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

  /* A collection row answers two different questions and must answer them differently: which row
     the pointer is on, and which row the keyboard will act on. Base gives the active row real DOM
     focus either way, so the distinction the platform draws is `:focus-visible` — and these are the
     rendered states, read from the row's own box-shadow rather than from its class list. */
  test("a highlighted row rings for the keyboard and not for the pointer", async ({ page, errors }) => {
    await openFixture(page);

    /* the pointer opens the list and moves over a row: highlight only */
    await openMenu(page);
    await item(page, /Archive every deployment/).hover();
    const hovered = await ringOf(item(page, /Archive every deployment/));
    expect(hovered.highlighted, "the pointer's row carries the navigation highlight").toBe(true);
    expect(hovered.focusVisible, "and the platform does not call a pointer's focus visible").toBe(false);
    expect(hovered.ring, "so it carries no keyboard ring").toBe("none");

    await page.keyboard.press("Escape");
    await expect(menu(page)).toHaveCount(0);

    /* the keyboard opens the same list and steps down it: highlight and ring */
    const opener = page.getByRole("button", { name: "Open menu" });
    await opener.focus();
    await page.keyboard.press("Enter");
    await expect(item(page, "Rename")).toBeVisible();
    await page.keyboard.press("Home");

    const focused = await ringOf(item(page, "Rename"));
    expect(focused.focusVisible).toBe(true);
    expect(focused.ring).toBe("ringed");

    /* including a row that cannot be activated: it stays reachable, and it still shows where the
       navigation is rather than disappearing into the disabled tone */
    await page.keyboard.press("ArrowDown");
    const disabled = await ringOf(item(page, "Duplicate"));
    expect(await item(page, "Duplicate").getAttribute("data-disabled")).toBe("");
    expect(disabled.focusVisible, "a disabled command is still navigable").toBe(true);
    expect(disabled.ring, "and still shows the ring that says the keyboard is on it").toBe("ringed");

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

  test("gives a disabled action no pointer state but keeps it navigable", async ({ page, errors }) => {
    await openFixture(page);
    await openMenu(page);

    const disabled = item(page, "Duplicate");
    const enabled = item(page, "Rename");
    await expect(disabled).toHaveAttribute("data-disabled", "");
    /* Navigation still reaches the disabled row, and that highlight is what tells a reader which
       row it is on before hearing that the row cannot be used. Done before any pointer press: a
       press on an action that *can* run closes the menu, which is Base's contract. */
    await page.mouse.move(0, 0);
    await page.keyboard.press("Home");
    await page.keyboard.press("ArrowDown");
    await expect(disabled).toHaveAttribute("data-highlighted", "");
    expect(Number(await layerOf(disabled))).toBeGreaterThan(0);

    /* A row is a `div`: `:active` matches it while the pointer is down on it and `:disabled` never
       does, so the primitive's own marker is the only thing that can withhold the press step.
       Measured while the press is held, because the tint is gone again by the time the pointer
       comes back up. */
    const press = async (locator: Locator) => {
      const box = await locator.boundingBox();
      if (!box) throw new Error("the row has no box");
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      const hovered = await layerOf(locator);
      await page.mouse.down();
      const pressed = await locator.evaluate((element) => ({
        layer: getComputedStyle(element, "::before").opacity,
        transform: getComputedStyle(element).transform,
      }));
      await page.mouse.up();
      return { hovered, ...pressed };
    };

    const disabledPress = await press(disabled);
    expect(disabledPress.layer).toBe(disabledPress.hovered);
    /* A row does not travel at all — the sheet around it is the surface, and the row only tints —
       so there is no compression to withhold in the first place. */
    expect(disabledPress.transform).toBe("none");

    /* The press step is still there for a row that can act, which is what makes the equality
       above a statement about the marker and not about the measurement. */
    const enabledPress = await press(enabled);
    expect(Number(enabledPress.layer)).toBeGreaterThan(Number(enabledPress.hovered));
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

    /* Both paths have to reach the parts, not just the input: the trailing controls learn their
       state from the primitive's own markers, so a control disabled by the field around it takes
       the same unavailable cursor as one disabled by its own prop. A disabled button is also
       outside the accessibility tree, so the parts are addressed by their own label. */
    for (const name of ["Disabled combobox", "Locked combobox"]) {
      const control = combobox(page, name);
      await expect(control).toBeDisabled();
      const group = control.locator("xpath=..");
      await expect(group).toHaveAttribute("data-disabled", "");
      for (const label of ["Clear selection", "Show options"]) {
        const part = group.locator(`button[aria-label="${label}"]`);
        await expect(part).toHaveAttribute("data-disabled", "");
        await expect(part).toHaveCSS("cursor", "not-allowed");
      }
    }

    expect(errors).toEqual([]);
  });

  test("stays browsable while read-only and gives up only its clear control", async ({ page, errors }) => {
    await openFixture(page);

    const control = combobox(page, "Read-only combobox");
    const group = control.locator("xpath=..");
    await expect(group).toHaveAttribute("data-readonly", "");
    await expect(control).not.toBeDisabled();

    /* Read-only is not disabled. The trigger keeps its affordance because the list still opens,
       and the only part that goes away is the one that would change the value. */
    const trigger = group.locator('button[aria-label="Show options"]');
    await expect(trigger).not.toHaveAttribute("data-disabled", "");
    await expect(trigger).toHaveCSS("cursor", "pointer");

    const clear = group.locator('button[aria-label="Clear selection"]');
    await expect(clear).toHaveAttribute("data-disabled", "");
    await expect(clear).toHaveCSS("cursor", "not-allowed");

    await trigger.click();
    const option = page.getByRole("option", { name: "Dashboard" });
    await expect(option).toBeVisible();

    /* Browsing is allowed; changing the value is what read-only refuses. */
    await option.click();
    await expect(control).toHaveValue("Design system");

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
    /* Escape is a cancellation, so the application is told about it: the keyboard and the cancel
       button report the same decision rather than one of them silently differing. */
    await expect(page.getByTestId("alert-outcome")).toHaveText("cancelled");
    await expect(trigger(page)).toBeFocused();

    expect(errors).toEqual([]);
  });
});
