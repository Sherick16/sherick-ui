import { expect, test, type Locator, type Page } from "./fixtures";

/* The state layer is a composited `::before` overlay, so its opacity is what carries hover and
   press. Reading it from the rendered element is the only check that proves the layer's step
   reached the browser at all: the class name can be in the DOM while the stylesheet has no rule
   for it, which is exactly how every hover tint in the library once shipped inert. */
const layerOpacity = (locator: ReturnType<Page["getByRole"]>) =>
  locator.evaluate((element) => {
    const style = getComputedStyle(element, "::before");
    return style.content === "none" ? "none" : style.opacity;
  });

/* Forced colours removes fills, shadows and the theme's tones, so the computed outline *style* says
   little: a zero-width outline has one, and paints nothing. A boundary is judged by what is drawn: a
   border or an outline with width, a line style, and a colour that differs from the element's own
   background. Reading that is the only check that a reader in forced colours sees an edge. */
const drawnBoundary = (element: Element) => {
  const style = getComputedStyle(element);
  const drawn = (width: string, lineStyle: string, colour: string) =>
    lineStyle !== "none" && parseFloat(width) > 0 && colour !== style.backgroundColor;
  return {
    outline: drawn(style.outlineWidth, style.outlineStyle, style.outlineColor),
    border: drawn(style.borderTopWidth, style.borderTopStyle, style.borderTopColor),
  };
};

const hasPaintedBoundary = async (locator: Locator) => {
  const boundary = await locator.evaluate(drawnBoundary);
  return boundary.outline || boundary.border;
};

/* A focus ring settles on the motion layer, so it is polled rather than read once. It must be a
   drawn outline at least 2px wide in a colour that is not the background. */
const expectFocusRing = async (locator: Locator, name: string) => {
  await expect
    .poll(() =>
      locator.evaluate((element) => {
        const style = getComputedStyle(element);
        return (
          style.outlineStyle !== "none" &&
          parseFloat(style.outlineWidth) >= 2 &&
          style.outlineColor !== style.backgroundColor
        );
      }),
      { message: `${name} needs a drawn focus ring` }
    )
    .toBe(true);
};

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

  /* The current destination holds the role's soft container, read from the token itself, and a
     resting destination holds nothing. */
  const tint = await page.evaluate(() => {
    const probe = document.createElement("div");
    probe.style.backgroundColor = "oklch(var(--sui-primary-soft))";
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
  await expectFocusRing(primary, "Primary");

  const selectedTab = page.getByRole("tab", { name: "Selected" });
  await expect(selectedTab).toHaveAttribute("aria-selected", "true");
  expect(await hasPaintedBoundary(selectedTab), "the selected tab needs a drawn boundary").toBe(true);

  const checkedSwitch = page.getByRole("switch", { name: "Success switch" });
  await expect(checkedSwitch).toHaveAttribute("aria-checked", "true");
  expect(await hasPaintedBoundary(checkedSwitch), "the checked switch needs a drawn boundary").toBe(true);

  // A selected mark's identity is carried by its fill, which forced colors removes, so it needs an
  // authored boundary. A *resting* checkbox or radio is identified by its own rim — a real border,
  // which forced colors repaints in CanvasText, component identity rather than selection — while
  // the focus ring still wins while the control is focused.
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
    const boundary = await mark.locator.evaluate((element) => {
      const rim = getComputedStyle(element.querySelector(':scope > span[aria-hidden="true"]') as Element, "::after");
      return { rim: rim.borderTopStyle, rimOpacity: rim.opacity, rimColour: rim.borderTopColor };
    });
    /* The control's own boundary, or the drawn rim of its mark: either one identifies the mark in
       forced colours, and the check passes if the reader can see one. */
    const control = await mark.locator.evaluate(drawnBoundary);
    const markRim = await mark.locator.locator(':scope > span[aria-hidden="true"]').evaluate(drawnBoundary);
    const painted = control.outline || control.border || markRim.border;
    if (mark.checked === "false") {
      expect(boundary.rim, `${mark.name} keeps its rim`).toBe("solid");
      expect(boundary.rimOpacity, `${mark.name}'s rim is drawn`).toBe("1");
      expect(boundary.rimColour, `${mark.name} should use CanvasText, not Highlight`).toBe(canvasText);
    } else {
      expect(painted, `${mark.name} needs a drawn forced-colors boundary`).toBe(true);
    }
  }

  // A focused resting mark still shows the canonical focus ring alongside its rim.
  const focusedUnchecked = page.getByRole("checkbox", { name: "Torture unchecked checkbox" });
  await focusedUnchecked.focus();
  await expectFocusRing(focusedUnchecked, "A focused unchecked checkbox");

  const thumb = page.getByRole("slider", { name: "Torture slider" }).locator("..");
  expect(await hasPaintedBoundary(thumb), "the slider thumb needs a drawn boundary").toBe(true);

  // A pressed toggle and a progress fill carry their meaning in tone alone, so forced colors has
  // to give each of them a boundary of its own.
  const pressedChip = page.getByRole("button", { name: "Alpha", exact: true });
  await expect(pressedChip).toHaveAttribute("aria-pressed", "true");
  expect(await hasPaintedBoundary(pressedChip), "the pressed chip needs a drawn boundary").toBe(true);

  const progressFill = page
    .getByRole("progressbar", { name: "Torture progress" })
    .locator("[data-sui-progress-indicator]");
  expect(await hasPaintedBoundary(progressFill), "the progress fill needs a drawn boundary").toBe(true);

  // A focused control keeps the canonical focus ring even when it is also selected: the focus rule
  // is emitted after the selection boundaries, which it shares its specificity with.
  const selectedSegment = page.getByRole("button", { name: "List", exact: true });
  await expect(selectedSegment).toHaveAttribute("aria-pressed", "true");
  await selectedSegment.focus();
  await expectFocusRing(selectedSegment, "A focused selected segment");

  await page.getByRole("button", { name: "Open torture dialog" }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  expect(await hasPaintedBoundary(dialog), "the dialog needs a drawn boundary").toBe(true);

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

  /* Opened from the keyboard, so focus inside it is keyboard focus: a ring is the keyboard's
     signal, and a pointer-opened dialog's programmatic focus rightly draws none. */
  await page.getByRole("button", { name: "Open torture alert" }).focus();
  await page.keyboard.press("Enter");
  const surface = page.getByRole("alertdialog");
  await expect(surface).toBeVisible();
  expect(await hasPaintedBoundary(surface), "the alert dialog needs a drawn boundary").toBe(true);

  const confirm = surface.getByRole("button", { name: "Torture confirm" });
  await confirm.focus();
  await expectFocusRing(confirm, "The alert dialog's confirm action");

  expect(errors).toEqual([]);
});

/* Forced colours is where a theme's fills and shadows are removed, so what remains to identify a
   control is the boundary the recipes draw in system colours. Three fixtures pin that as pixels:
   the core controls, the theme torture page where every semantic family meets the same mode, and
   one overlay, whose shell has no shadow to fall back on under forced colours. Each waits for hydration
   so the screenshot is the settled state, not a server-rendered shell. */
const forcedColoursPage = async (page: Page, url: string) => {
  await page.emulateMedia({ colorScheme: "light", forcedColors: "active" });
  await page.goto(url);
  await page.waitForFunction(() => document.documentElement.dataset.hydrated === "true");
};

test("core controls keep their drawn boundaries in forced colours", async ({ page, errors }) => {
  await forcedColoursPage(page, "/verification/core");
  await expect(page.getByTestId("verification-core")).toBeVisible();

  await expect(page).toHaveScreenshot("core-forced-colors.png", { fullPage: true });

  expect(errors).toEqual([]);
});

test("the theme torture fixture keeps its drawn boundaries in forced colours", async ({ page, errors }) => {
  await forcedColoursPage(page, "/verification/theme-torture");
  await expect(page.getByRole("button", { name: "Primary" })).toBeVisible();

  await expect(page).toHaveScreenshot("theme-torture-forced-colors.png", { fullPage: true });

  expect(errors).toEqual([]);
});

test("an open dialog keeps its drawn shell in forced colours", async ({ page, errors }) => {
  await forcedColoursPage(page, "/verification/dialog");
  await expect(page.getByRole("dialog")).toBeVisible();

  await expect(page).toHaveScreenshot("dialog-forced-colors.png", { fullPage: true });

  expect(errors).toEqual([]);
});
