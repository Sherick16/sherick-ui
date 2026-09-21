import { expect, test, type Page } from "./fixtures";

/* The state layer is a composited `::before` overlay, so its opacity is what carries hover and
   press. Reading it from the rendered element is the only check that proves the layer's step
   reached the browser at all: the class name can be in the DOM while the stylesheet has no rule
   for it, which is exactly how every hover tint in the library once shipped inert. */
const layerOpacity = (locator: ReturnType<Page["getByRole"]>) =>
  locator.evaluate((element) => {
    const style = getComputedStyle(element, "::before");
    return style.content === "none" ? "none" : style.opacity;
  });

test("interactive surfaces tint on hover and stay inert while disabled", async ({ page, errors }) => {
  await page.goto("/verification/core");

  for (const [name, step] of [
    ["Primary", "0.18"],
    ["Tonal", "0.09"],
    ["Quiet", "0.05"],
  ] as const) {
    const button = page.getByRole("button", { name, exact: true });
    await expect(button).toBeVisible();
    await page.mouse.move(0, 0);
    expect(await layerOpacity(button), `${name} must rest without a state layer`).toBe("0");
    await button.hover();
    await expect
      .poll(() => layerOpacity(button), { message: `${name} must tint on hover` })
      .toBe(step);
  }

  /* A disabled control composes no interactive state at all — no layer is rendered, so it cannot
     tint even under the pointer. */
  await page.goto("/verification/interactions");
  const disabled = page.getByRole("button", { name: "Disabled action" });
  await disabled.hover();
  expect(await layerOpacity(disabled)).toBe("none");

  expect(errors).toEqual([]);
});

test("a current destination is a row carrying the quiet tint, not a pill or a card", async ({
  page,
  errors,
}) => {
  await page.goto("/verification/interactions");

  const group = page.getByTestId("nav-group");
  const current = group.getByRole("link", { name: "Current section" });
  const resting = group.getByRole("link", { name: "Overview" });

  /* Which destination is current is published rather than implied by colour alone. */
  await expect(current).toHaveAttribute("aria-current", "page");
  await expect(resting).not.toHaveAttribute("aria-current", "page");

  const surface = await current.evaluate((element) => {
    const style = getComputedStyle(element);
    return {
      radius: Number.parseFloat(style.borderTopLeftRadius),
      height: element.getBoundingClientRect().height,
      shadow: style.boxShadow,
    };
  });
  /* A row, not a control the size of a field: the corner stays proportional to the row's own
     height instead of reaching its half-extent, so a compact row never becomes a capsule. */
  expect(surface.radius).toBeLessThan(surface.height / 2);
  /* And flat: depth never announces which page you are on. */
  expect(surface.shadow).toBe("none");

  /* The current destination holds the lightest accent tint there is, read from the token itself,
     and a resting destination holds nothing. */
  const tint = await page.evaluate(() => {
    const probe = document.createElement("div");
    probe.style.backgroundColor = "oklch(var(--sui-primary) / 0.12)";
    document.body.appendChild(probe);
    const value = getComputedStyle(probe).backgroundColor;
    probe.remove();
    return value;
  });
  const background = (locator: ReturnType<Page["getByRole"]>) =>
    locator.evaluate((element) => getComputedStyle(element).backgroundColor);
  expect(await background(current)).toBe(tint);
  expect(await background(resting)).toBe("rgba(0, 0, 0, 0)");

  /* Hover is the shared quiet layer on top of that, not a change of fill. */
  await page.mouse.move(0, 0);
  expect(await layerOpacity(resting)).toBe("0");
  await resting.hover();
  await expect.poll(() => layerOpacity(resting)).toBe("0.05");

  expect(errors).toEqual([]);
});

test("a hovered row and a keyboard-navigated row carry the same tone", async ({ page, errors }) => {
  await page.goto("/verification/interactions");
  const item = (name: string) => page.getByRole("menuitem", { name });

  await page.getByRole("button", { name: "Open menu" }).click();
  const row = item("Rename");
  await expect(row).toBeVisible();

  /* Keyboard first, with the pointer parked away from the list, so that measurement is the
     highlight step on its own. */
  await page.mouse.move(0, 0);
  await page.getByRole("menu").press("Home");
  await expect(row).toHaveAttribute("data-highlighted", "");
  const byKeyboard = await layerOpacity(row);

  /* Then the pointer on the same row: if the two steps ever diverged, adding the hover to the
     highlight would change what is rendered. */
  await row.hover();
  const byPointer = await layerOpacity(row);

  /* One strength for one state. The two steps are written separately in the recipe because a class
     name has to be literal to be compiled, so the equality is asserted where it is rendered
     rather than assumed from the source. */
  expect(Number(byKeyboard)).toBeGreaterThan(0);
  expect(byPointer).toBe(byKeyboard);

  expect(errors).toEqual([]);
});


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

  // A mark's identity is carried by tone or depth alone, both of which forced colors removes, so
  // both a selected and a *resting* checkbox and radio need an authored boundary. The resting
  // boundary is CanvasText — component identity rather than selection — while the focus ring
  // still wins while the control is focused.
  const marks = [
    { name: "a checked checkbox", locator: page.getByRole("checkbox", { name: "Torture checkbox" }), checked: "true" },
    { name: "an unchecked checkbox", locator: page.getByRole("checkbox", { name: "Torture unchecked checkbox" }), checked: "false" },
    { name: "a checked radio", locator: page.getByRole("radio", { name: "Alpha" }), checked: "true" },
    { name: "an unchecked radio", locator: page.getByRole("radio", { name: "Beta" }), checked: "false" },
  ];
  const canvasText = await page.evaluate(() => {
    const probe = document.createElement("div");
    probe.style.color = "CanvasText";
    document.body.appendChild(probe);
    const value = getComputedStyle(probe).color;
    probe.remove();
    return value;
  });
  for (const mark of marks) {
    await expect(mark.locator, `${mark.name} should be ${mark.checked}`).toHaveAttribute("aria-checked", mark.checked);
    const outline = await mark.locator.evaluate((element) => {
      const style = getComputedStyle(element);
      return { style: style.outlineStyle, color: style.outlineColor };
    });
    expect(outline.style, `${mark.name} needs a forced-colors boundary`).not.toBe("none");
    if (mark.checked === "false") {
      expect(outline.color, `${mark.name} should use CanvasText, not Highlight`).toBe(canvasText);
    }
  }

  // A focused resting mark still shows the canonical focus ring rather than losing it to the
  // resting boundary the rule above draws: while the keyboard is on the control the boundary is
  // excluded, and the ring is polled because the outline settles on the motion layer.
  const focusedUnchecked = page.getByRole("checkbox", { name: "Torture unchecked checkbox" });
  await focusedUnchecked.focus();
  await expect
    .poll(async () => parseFloat(await focusedUnchecked.evaluate((element) => getComputedStyle(element).outlineWidth)))
    .toBeGreaterThanOrEqual(2);

  const thumb = page.getByRole("slider", { name: "Torture slider" }).locator("..");
  expect(await thumb.evaluate((element) => getComputedStyle(element).borderStyle)).not.toBe("none");

  // A pressed toggle and a progress fill carry their meaning in tone alone, so forced colors has
  // to give each of them a boundary of its own.
  const pressedChip = page.getByRole("button", { name: "Alpha", exact: true });
  await expect(pressedChip).toHaveAttribute("aria-pressed", "true");
  expect(
    await pressedChip.evaluate((element) => getComputedStyle(element).outlineStyle)
  ).not.toBe("none");

  const progressFill = page
    .getByRole("progressbar", { name: "Torture progress" })
    .locator("[data-sui-progress-indicator]");
  expect(await progressFill.evaluate((element) => getComputedStyle(element).borderStyle)).not.toBe(
    "none"
  );

  // A focused control keeps the canonical focus ring even when it is also selected: the focus rule
  // is emitted after the selection boundaries, which it shares its specificity with.
  const selectedSegment = page.getByRole("button", { name: "List", exact: true });
  await expect(selectedSegment).toHaveAttribute("aria-pressed", "true");
  await selectedSegment.focus();
  const segmentFocus = await selectedSegment.evaluate((element) => {
    const style = getComputedStyle(element);
    return { style: style.outlineStyle, width: style.outlineWidth };
  });
  expect(segmentFocus.style).not.toBe("none");
  expect(parseFloat(segmentFocus.width)).toBeGreaterThanOrEqual(2);

  await page.getByRole("button", { name: "Open torture dialog" }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  expect(await dialog.evaluate((element) => getComputedStyle(element).borderStyle)).not.toBe("none");

  expect(errors).toEqual([]);
});

test("the Wave B family reads its semantics from the theme, not from local color", async ({ page, errors }) => {
  await page.goto("/verification/theme-torture");
  await expect(page.getByTestId("theme-torture")).toBeVisible();

  const primaryBackground = await page
    .getByRole("button", { name: "Primary" })
    .evaluate((element) => getComputedStyle(element).backgroundColor);
  const dangerBackground = await page
    .getByRole("button", { name: "Danger" })
    .evaluate((element) => getComputedStyle(element).backgroundColor);
  const onPrimary = await page.evaluate(() => {
    const probe = document.createElement("div");
    probe.style.color = "oklch(var(--sui-on-primary))";
    document.body.appendChild(probe);
    const value = getComputedStyle(probe).color;
    probe.remove();
    return value;
  });

  /* A destructive menu action wears the danger role on its own label; the sheet it sits on stays
     neutral, so the tone marks the action rather than the whole popup. */
  await page.getByRole("button", { name: "Open torture menu" }).click();
  const dangerItem = page.getByRole("menuitem", { name: "Delete deployment" });
  await expect(dangerItem).toBeVisible();

  const dangerLabel = await dangerItem.evaluate((element) => getComputedStyle(element).color);
  const neutralLabel = await page
    .getByRole("menuitem", { name: "Rename" })
    .evaluate((element) => getComputedStyle(element).color);
  const sheetLabel = await page
    .locator(".sui-scope.shadow-sherick-floating")
    .evaluate((element) => getComputedStyle(element).color);
  const expectedDanger = await page.evaluate(() => {
    const probe = document.createElement("div");
    probe.style.color = "oklch(var(--sui-danger))";
    document.body.appendChild(probe);
    const value = getComputedStyle(probe).color;
    probe.remove();
    return value;
  });

  expect(dangerLabel).toBe(expectedDanger);
  expect(neutralLabel).not.toBe(expectedDanger);
  expect(sheetLabel).not.toBe(expectedDanger);
  await page.keyboard.press("Escape");

  /* A selected option holds the accent as a tint of the sheet, not as the opaque accent fill with
     its on-color, so a custom theme cannot make the two roles collapse into each other. */
  await page.getByRole("combobox", { name: "Torture combobox" }).click();
  const selected = page.getByRole("option", { name: "Alpha" });
  await expect(selected).toHaveAttribute("aria-selected", "true");

  const selectedStyle = await selected.evaluate((element) => {
    const style = getComputedStyle(element);
    return { background: style.backgroundColor, color: style.color };
  });

  expect(selectedStyle.background).not.toBe(primaryBackground);
  expect(selectedStyle.color).not.toBe(onPrimary);
  await page.keyboard.press("Escape");

  /* The confirmation carries the danger role on the one control that destroys something. */
  await page.getByRole("button", { name: "Open torture alert" }).click();
  const confirm = page.getByRole("alertdialog").getByRole("button", { name: "Torture confirm" });
  await expect(confirm).toHaveCSS("background-color", dangerBackground);
  const alertSurface = await page
    .getByRole("alertdialog")
    .evaluate((element) => getComputedStyle(element).backgroundColor);
  expect(alertSurface).not.toBe(dangerBackground);

  expect(errors).toEqual([]);
});

test("forced-colors gives an alert dialog its boundary and its confirm action its state", async ({ page, errors }) => {
  await page.emulateMedia({ forcedColors: "active" });
  await page.goto("/verification/theme-torture");

  await page.getByRole("button", { name: "Open torture alert" }).click();
  const surface = page.getByRole("alertdialog");
  await expect(surface).toBeVisible();
  expect(await surface.evaluate((element) => getComputedStyle(element).borderStyle)).not.toBe("none");

  const confirm = surface.getByRole("button", { name: "Torture confirm" });
  await confirm.focus();
  const focus = await confirm.evaluate((element) => {
    const style = getComputedStyle(element);
    return { style: style.outlineStyle, width: style.outlineWidth };
  });
  expect(focus.style).not.toBe("none");
  expect(parseFloat(focus.width)).toBeGreaterThanOrEqual(2);

  expect(errors).toEqual([]);
});
