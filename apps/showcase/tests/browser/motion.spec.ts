import { expect, test, type Locator, type Page } from "./fixtures";

/*
 Motion invariants
 =================
 The style-contract gate pins what `ui.motion.ts` writes. This suite pins what the rendered
 component does with it: which physical event a part answers with, that a stable boundary
 stays put, that a direct manipulation is never interpolated, and that presence is Base's
 lifecycle rather than a component-local timer.

 Every assertion reads a computed style, a state attribute or a geometry — never a
 screenshot — because the subject is a physical contract, not a pixel.

 The suite runs with motion enabled; the reduced-motion tests emulate the preference
 themselves, because the host stylesheet also answers that preference.
 */

test.use({ reducedMotion: "no-preference" });

const fixture = "/verification/interactions";

const motionOf = (locator: Locator) =>
  locator.evaluate((element) => {
    const style = getComputedStyle(element);
    return {
      property: style.transitionProperty,
      duration: style.transitionDuration,
      timing: style.transitionTimingFunction,
      transform: style.transform,
      animation: style.animationName,
    };
  });

const token = (page: Page, variable: string) =>
  page.evaluate((name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim(), variable);

/** A computed transition is a list; the first entry is the one the part answers with. Curves are
 *  compared numerically, because a browser may print `.16` where the token says `0.16`. */
const firstTiming = (value: string) => {
  const match = /^[a-z-]+\(([^)]*)\)/i.exec(value.trim());
  const args = (match?.[1] ?? value).split(",").map((part) => Number(part));
  return args.some(Number.isNaN) ? value.trim().toLowerCase() : args.map((part) => part.toFixed(3)).join(",");
};

const firstDuration = (value: string) => value.split(",")[0].trim();

const toMs = (value: string) => (value.endsWith("ms") ? Number.parseFloat(value) : Number.parseFloat(value) * 1000);

/** A computed duration equals the canonical token it was authored from. */
const expectDuration = async (page: Page, locator: Locator, variable: string) => {
  const { duration } = await motionOf(locator);
  expect(toMs(firstDuration(duration))).toBe(toMs(await token(page, variable)));
};

/** A computed curve equals the canonical token it was authored from. */
const expectTiming = async (page: Page, locator: Locator, variable: string) => {
  const { timing } = await motionOf(locator);
  expect(firstTiming(timing)).toBe(firstTiming(await token(page, variable)));
};

/**
 * The geometry a transition starts from, read from frame 0 of the transition itself.
 *
 * A transition that has already begun cannot be inspected at its `from` value through the
 * cascade — the running animation outranks it — so the animation is paused and seeked to 0,
 * which is the state the entrance really paints first. The decomposed matrix gives the scale and
 * the translation separately, because a growing surface and a sliding one can share an element.
 */
const startingGeometry = async (locator: Locator) => {
  await locator.evaluate((element) =>
    element.getAnimations().forEach((animation) => {
      animation.pause();
      animation.currentTime = 0;
    })
  );
  const geometry = await locator.evaluate((element) => {
    const style = getComputedStyle(element);
    const matrix = new DOMMatrix(style.transform === "none" ? "" : style.transform);
    return {
      scale: Number(matrix.a.toFixed(3)),
      translateX: Number(matrix.e.toFixed(2)),
      translateY: Number(matrix.f.toFixed(2)),
      side: element.getAttribute("data-side"),
      origin: style.transformOrigin,
      duration: style.transitionDuration.split(",")[0].trim(),
      timing: style.transitionTimingFunction.split(/,(?=[^)]*(?:\(|$))/)[0].trim(),
      width: Math.round(element.getBoundingClientRect().width),
    };
  });
  await locator.evaluate((element) => element.getAnimations().forEach((animation) => animation.play()));
  return geometry;
};

/** Whether a part is painting a focus ring: the recipes suppress the user agent's outline with a
 *  transparent one, so a solid style on its own proves nothing. */
const paintedRing = (locator: Locator) =>
  locator.evaluate((element) => {
    const style = getComputedStyle(element);
    const painted =
      style.outlineStyle !== "none" &&
      style.outlineColor !== "rgba(0, 0, 0, 0)" &&
      Number.parseFloat(style.outlineWidth) > 0;
    return painted ? "ringed" : "none";
  });

/** The scale a part is painted at right now. */
const scaleOf = (locator: Locator) =>
  locator.evaluate((element) => {
    const transform = getComputedStyle(element).transform;
    return Number(new DOMMatrix(transform === "none" ? "" : transform).a.toFixed(3));
  });

/** Presses a part and reports how much its painted geometry moved while it was held. */
const pressDelta = async (page: Page, press: Locator, measured: Locator, alsoMeasured?: Locator) => {
  await measured.scrollIntoViewIfNeeded();
  await page.mouse.move(0, 0);
  await press.hover();
  const atRest = await measured.boundingBox();
  await page.mouse.down();
  /* Wait for the press to *settle* rather than guessing a delay: a fixed wait reads a
     mid-transition scale whenever the browser is busy, which reports a coincidence as a
     measurement. The element that compresses is the one the press propagates to, which is a
     co-measured field when the press target is an affordance inside it; the compression counts as
     settled once a transform is applied and nothing is animating it, and at rest the transform is
     `none`, so this cannot pass early. */
  const compressing = alsoMeasured ?? measured;
  await expect
    .poll(
      () =>
        compressing.evaluate((element) => {
          const transform = getComputedStyle(element).transform;
          return transform !== "none" && element.getAnimations().length === 0;
        }),
      { message: "the press lands and settles" }
    )
    .toBe(true);
  const pressed = await measured.boundingBox();
  const pressedScale = await scaleOf(measured);
  const alsoScale = alsoMeasured ? await scaleOf(alsoMeasured) : null;
  await page.mouse.up();
  if (!atRest || !pressed) throw new Error("the part has no box");
  return {
    restWidth: Number(atRest.width.toFixed(1)),
    pressedWidth: Number(pressed.width.toFixed(1)),
    compressionPercent: Number((((atRest.width - pressed.width) / atRest.width) * 100).toFixed(2)),
    pressedScale,
    alsoScale,
  };
};

type Entrance = { transform: string };

/**
 * Records every element that entered the presence lifecycle, and the geometry it entered
 * with.
 *
 * `data-starting-style` exists for the single frame before an entrance runs and is applied
 * imperatively, to a node that is not yet in the document, so neither a mutation observer
 * nor a read at write time can see it. The attribute write is therefore observed directly,
 * and the style is read one microtask later — after React has committed the subtree to the
 * document, and before the primitive clears the attribute on the next frame.
 */
const watchEntrances = (page: Page) =>
  page.addInitScript(() => {
    const recorded: Entrance[] = [];
    (window as unknown as { __entrances: Entrance[] }).__entrances = recorded;

    const setAttribute = Element.prototype.setAttribute;
    Element.prototype.setAttribute = function setAttributeWithEntranceWatch(name, value) {
      const result = setAttribute.call(this, name, value);
      if (name === "data-starting-style") {
        const element = this;
        queueMicrotask(() => recorded.push({ transform: getComputedStyle(element).transform }));
      }
      return result;
    };
  });

const entrances = (page: Page) =>
  page.evaluate(() => (window as unknown as { __entrances?: Entrance[] }).__entrances ?? []);

const openFixture = async (page: Page) => {
  await page.goto(fixture);
  await expect(page.getByRole("heading", { name: "Interaction verification" })).toBeVisible();
};

test.beforeEach(async ({ page }) => {
  await openFixture(page);
});

test("a checkbox boundary never moves while its mark arrives", async ({ page, errors }) => {
  const checkbox = page.getByRole("checkbox", { name: "First row" });
  const boundary = checkbox.locator("span").first();

  /* Bring it into view before measuring: a bounding box is viewport-relative, and hovering
     scrolls. */
  await checkbox.scrollIntoViewIfNeeded();
  await checkbox.hover();
  const atRest = await boundary.boundingBox();
  await page.mouse.down();
  const held = await boundary.boundingBox();
  await page.mouse.up();
  const released = await boundary.boundingBox();

  /* The boundary is the control's identity. Expression happens inside it, so its box is the
     same before, during and after the press that changes what is inside it. */
  expect(held, "the checkbox box must not move under the pointer").toEqual(atRest);
  expect(released, "the checkbox box must not move when the press is released").toEqual(atRest);

  await expect(checkbox).toHaveAttribute("aria-checked", "true");
  const mark = checkbox.locator("span > span").first();
  expect((await motionOf(mark)).property).toContain("transform");
  await expectTiming(page, mark, "--sui-ease-spring");
  await expectDuration(page, mark, "--sui-duration-release");

  expect(errors).toEqual([]);
});

test("a radio boundary never moves and its dot arrives on the spring", async ({ page, errors }) => {
  const group = page.getByRole("radiogroup", { name: "Region", exact: true });
  const radio = group.getByRole("radio", { name: "Europe", exact: true });
  const boundary = radio.locator("span").first();

  await radio.scrollIntoViewIfNeeded();
  await radio.hover();
  const atRest = await boundary.boundingBox();
  await page.mouse.down();
  const held = await boundary.boundingBox();
  await page.mouse.up();

  expect(held, "the radio circle must not move under the pointer").toEqual(atRest);

  const dot = radio.locator("span span").first();
  expect((await motionOf(dot)).property).toContain("transform");
  await expectTiming(page, dot, "--sui-ease-spring");

  expect(errors).toEqual([]);
});

test("a tab indicator travels on every axis it changes", async ({ page, errors }) => {
  const indicator = page.getByRole("tablist").locator(":scope > span");
  const { property } = await motionOf(indicator);

  /* A partial relocation is the failure this pins: every property the indicator changes is
     the same list it is interpolated on, so nothing snaps while the rest travels. */
  for (const axis of ["left", "top", "width", "height"]) {
    expect(property, `the indicator must relocate ${axis}`).toContain(axis);
  }
  await expectDuration(page, indicator, "--sui-duration-release");

  const geometry = () =>
    indicator.evaluate((element) => {
      const style = getComputedStyle(element);
      return { left: style.left, width: style.width };
    });

  const overview = await geometry();
  await page.getByRole("tab", { name: "Details" }).click();
  await expect(page.getByTestId("tab-value")).toHaveText("details");
  await expect.poll(async () => (await geometry()).left).not.toBe(overview.left);

  /* Keyboard selection relocates the indicator and activates the tab without simulating a
     pointer press: the newly selected tab carries no press geometry. */
  await page.getByRole("tab", { name: "Overview" }).click();
  await expect(page.getByTestId("tab-value")).toHaveText("overview");
  await page.getByRole("tab", { name: "Overview" }).focus();
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("ArrowRight");
  await expect(page.getByRole("tab", { name: "Details" })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("tab", { name: "Details" })).toHaveAttribute("aria-selected", "true");
  await expect(page.getByTestId("tab-value")).toHaveText("details");
  expect(
    await page.getByRole("tab", { name: "Details" }).evaluate((element) => getComputedStyle(element).transform)
  ).toBe("none");

  expect(errors).toEqual([]);
});

test("a dragged slider handle is never interpolated", async ({ page, errors }) => {
  const thumb = page.getByTestId("budget-slider").locator("[data-sui-slider-thumb]");
  const track = page.getByTestId("budget-slider").locator("div", { has: page.getByRole("slider") }).first();

  /* A step owned by the keyboard or the programmatic value settles. */
  expect((await motionOf(thumb)).property).toContain("inset-inline-start");

  await thumb.scrollIntoViewIfNeeded();
  const trackBox = await track.boundingBox();
  const thumbBox = await thumb.boundingBox();
  if (!trackBox || !thumbBox) throw new Error("the slider has no box");

  await page.mouse.move(thumbBox.x + thumbBox.width / 2, thumbBox.y + thumbBox.height / 2);
  await page.mouse.down();

  const target = trackBox.x + trackBox.width * 0.8;
  await page.mouse.move(target, trackBox.y + trackBox.height / 2, { steps: 6 });

  /* While the pointer owns the geometry, the positional property is not in the transition
     list at all — so the handle cannot lag behind the pointer. */
  expect((await motionOf(thumb)).property).not.toContain("inset-inline-start");

  const dragged = await thumb.boundingBox();
  if (!dragged) throw new Error("the slider handle has no box");
  expect(Math.abs(dragged.x + dragged.width / 2 - target)).toBeLessThan(4);

  await page.mouse.up();
  expect((await motionOf(thumb)).property).toContain("inset-inline-start");

  expect(errors).toEqual([]);
});

test("Select carries tactile, orientation, arrival and anchored presence", async ({ page, errors }) => {
  const trigger = page.getByRole("combobox", { name: "Project type", exact: true });
  const field = trigger.locator("xpath=..");
  const fieldMotion = await motionOf(field);
  expect(fieldMotion.property, "the field is what presses").toContain("transform");
  await expectDuration(page, field, "--sui-duration-release");
  expect((await motionOf(trigger)).property, "the trigger itself only carries tone").not.toContain("transform");

  const chevron = trigger.locator("svg");
  expect((await motionOf(chevron)).property).toBe("transform");
  await expectTiming(page, chevron, "--sui-ease-release");

  await trigger.click();
  const popup = page.locator(".sui-scope.shadow-sherick-floating[data-base-ui-focusable]");
  await expect(popup).toBeVisible();
  await expect(popup).toHaveAttribute("data-side", "bottom");

  const presence = await motionOf(popup);
  expect(presence.property).toContain("opacity");
  expect(presence.property).toContain("transform");
  await expectDuration(page, popup, "--sui-duration-overlay");
  await expectTiming(page, popup, "--sui-ease-glide");

  /* The entrance really grows: it paints a surface six percent smaller and four pixels closer
     to its anchor, and the growth of the painted edge is larger than the travel that supports
     it — which is what makes the surface appear to open out of the trigger rather than slide. */
  const start = await startingGeometry(popup);
  expect(start.scale).toBe(0.94);
  expect(Math.abs(start.translateY)).toBe(4);
  expect(start.width * (1 - start.scale)).toBeGreaterThan(4 * Math.abs(start.translateY));

  const selected = page.getByRole("option", { name: "Design system" });
  await expect(selected).toHaveAttribute("aria-selected", "true");
  await expectTiming(page, selected.locator("svg"), "--sui-ease-spring");

  await page.keyboard.press("Escape");
  /* Select keeps its popup in the document once it has closed, so the contract is that it is
     gone from the page — hidden, and with no options left in it. */
  await expect(popup).toBeHidden();
  await expect(page.getByRole("option")).toHaveCount(0);

  expect(errors).toEqual([]);
});

test("Combobox matches Select and filtering does not choreograph the list", async ({ page, errors }) => {
  /* Addressed by its label rather than by role: while the listbox is open Base marks the page
     around it `aria-hidden`, so a role locator stops resolving exactly when the query has to be
     typed into it. */
  const input = page.getByLabel("Combobox project").and(page.locator('input[role="combobox"]'));

  /* The primitive hides its trigger from the accessibility tree while the list is open, so the
     trigger and its chevron are addressed by their own attributes. */
  const trigger = page.locator('button[aria-label="Show options"]').first();
  const chevron = trigger.locator("svg");

  expect((await motionOf(chevron)).property).toBe("transform");
  expect((await motionOf(chevron)).transform).toBe("none");

  await trigger.click();
  const popup = page.locator(".sui-scope.shadow-sherick-floating");
  await expect(popup).toBeVisible();
  await expectDuration(page, popup, "--sui-duration-overlay");

  /* Orientation: the same affordance reaches the open orientation it reaches in `Select`. */
  await expect.poll(async () => (await motionOf(chevron)).transform).not.toBe("none");

  /* A row answers with tone only, in both families. */
  const row = page.getByRole("option", { name: "Dashboard" });
  const rowMotion = await motionOf(row);
  expect(rowMotion.property).not.toContain("transform");
  expect(rowMotion.property).not.toContain("height");

  /* Filtering replaces the rows immediately: no stagger, no row entrance, no height dance. */
  await input.fill("dash");
  await expect(page.getByRole("option", { name: "Design system" })).toHaveCount(0);
  await expect(page.getByRole("option")).toHaveCount(1);
  expect((await motionOf(page.getByRole("option"))).property).not.toContain("height");

  await page.keyboard.press("Escape");
  await expect(page.getByRole("option")).toHaveCount(0);

  expect(errors).toEqual([]);
});

test("Menu items answer with tone and the sheet carries the presence", async ({ page, errors }) => {
  await page.getByRole("button", { name: "Open menu" }).click();
  const menu = page.getByRole("menu");
  await expect(menu).toBeVisible();

  const presence = await motionOf(menu);
  expect(presence.property).toContain("opacity");
  expect(presence.property).toContain("transform");
  await expectDuration(page, menu, "--sui-duration-overlay");

  expect((await motionOf(page.getByRole("menuitem", { name: "Rename" }))).property).not.toContain("transform");

  expect(errors).toEqual([]);
});

test("Popover and Menu inject no motion into a consumer-rendered trigger", async ({ page, errors }) => {
  const surfaces = [
    { trigger: "popover-plain-trigger", opened: page.getByText("The trigger moves however the caller says it moves.") },
    { trigger: "menu-plain-trigger", opened: page.getByRole("menuitem", { name: "Plain action" }) },
  ];

  for (const { trigger: id, opened } of surfaces) {
    const trigger = page.getByTestId(id);
    const before = (await trigger.getAttribute("class")) ?? "";

    expect(before, `${id} must carry no authored motion`).not.toMatch(/(?:^|\s)(?:transition|duration|ease|animate)-/);

    await trigger.click();
    await expect(opened).toBeVisible();
    expect((await trigger.getAttribute("class")) ?? "").toBe(before);
    await page.keyboard.press("Escape");
    await expect(opened).toHaveCount(0);
  }

  expect(errors).toEqual([]);
});

test("Tooltip resolves the same side-aware entrance on every edge", async ({ page, errors }) => {
  const expected: Record<string, { y: string; x: string }> = {
    top: { y: "4px", x: "" },
    right: { y: "0px", x: "-4px" },
    bottom: { y: "-4px", x: "" },
    left: { y: "0px", x: "4px" },
  };

  for (const side of Object.keys(expected)) {
    await page.getByTestId(`tooltip-${side}`).hover();

    const popup = page.getByText(`Hint ${side}`);
    await expect(popup).toBeVisible();
    await expect(popup, `the tooltip must resolve the ${side} edge`).toHaveAttribute("data-side", side);

    const geometry = await popup.evaluate((element) => {
      const style = getComputedStyle(element);
      return {
        y: style.getPropertyValue("--sui-overlay-from-shift-y").trim(),
        x: style.getPropertyValue("--sui-overlay-from-shift-x").trim(),
      };
    });
    expect(geometry).toEqual(expected[side]);

    /* Lighter than an anchored popup: the same grow on the local timing rather than the overlay
       timing, and it never bounces. */
    await expectDuration(page, popup, "--sui-duration-release");
    expect(firstTiming((await motionOf(popup)).timing)).toBe(firstTiming(await token(page, "--sui-ease-glide")));
    expect(toMs(firstDuration((await motionOf(popup)).duration))).toBeLessThan(
      toMs(await token(page, "--sui-duration-overlay"))
    );

    await page.mouse.move(2, 2);
    await expect(popup).toHaveCount(0);
  }

  expect(errors).toEqual([]);
});

test("Dialog and AlertDialog share one modal and one scrim presence", async ({ page, errors }) => {
  const scrim = page.locator('[class*="--sui-scrim-blur"]');

  await page.getByRole("button", { name: "Open dialog" }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();

  const modal = await motionOf(dialog);
  expect(modal.property).toContain("opacity");
  expect(modal.property).toContain("transform");
  await expectDuration(page, dialog, "--sui-duration-overlay");

  await expect(scrim).toHaveCount(1);
  await expectDuration(page, scrim, "--sui-duration-overlay");
  expect((await motionOf(scrim)).property).toBe("opacity");

  /* Static anatomy inside the surface: nothing in the dialog is staggered or choreographed. */
  const heading = page.getByRole("heading", { name: "Nested composition" });
  const headingMotion = await motionOf(heading);
  expect(headingMotion.property).toBe("all");
  expect(headingMotion.duration).toBe("0s");

  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);

  await page.getByRole("button", { name: "Delete workspace" }).click();
  const alert = page.getByRole("alertdialog");
  await expect(alert).toBeVisible();
  const alertPresence = await motionOf(alert);
  expect(alertPresence.property).toBe(modal.property);
  expect(alertPresence.duration).toBe(modal.duration);
  expect(alertPresence.timing).toBe(modal.timing);

  expect(errors).toEqual([]);
});

test("reduced motion drops every spatial entrance and keeps the state response", async ({ page, errors }) => {
  await watchEntrances(page);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await openFixture(page);

  await page.getByRole("button", { name: "Open popover" }).click();
  await expect(page.getByTestId("popover-state")).toHaveText("open");

  const popup = page.locator(".sui-scope.shadow-sherick-floating");
  await expect(popup).toBeVisible();
  expect((await motionOf(popup)).property, "reduced presence is opacity only").toBe("opacity");

  /* Arrival is a spatial entrance too: a mark that arrived from half scale would be an instant
     50% → 100% jump once its transition was gone, which is why the recipe needs a state-specific
     override rather than a plain `transform: none`. Checkbox, radio and a select's mark all take
     the same recipe, so all three are exercised here. */
  await page.getByRole("checkbox", { name: "First row" }).click();
  await page.getByRole("radiogroup", { name: "Region", exact: true }).getByRole("radio", { name: "United States", exact: true }).click();
  await page.getByRole("combobox", { name: "Project type", exact: true }).click();
  await page.getByRole("option", { name: "Dashboard" }).click();
  await page.waitForTimeout(200);

  const recorded = await entrances(page);
  expect(recorded.length, "the entrance lifecycle still runs").toBeGreaterThan(0);
  /* A mark that arrived from half scale would still paint an identity transform rather than
     `none`, so both are spatial stillness. */
  const still = (transform: string) => transform === "none" || transform.replace(/\s+/g, "") === "matrix(1,0,0,1,0,0)";
  expect(recorded.every((entry) => still(entry.transform)), "no reduced entrance travels").toBe(true);

  /* A press is spatial, so reduced motion removes the compression while keeping the tone that
     reports it — measured on both forms of the same field. */
  const reducedSelect = page.getByRole("combobox", { name: "Project type", exact: true });
  const reducedSelectField = reducedSelect.locator("xpath=..");
  const reducedPress = await pressDelta(page, reducedSelect, reducedSelectField);
  expect(reducedPress.pressedScale, "the select field does not compress").toBe(1);
  expect(reducedPress.compressionPercent).toBe(0);
  await page.keyboard.press("Escape");

  await expect(page.getByTestId("popover-reason")).not.toHaveText("");

  const reducedCombobox = page.locator('input[role="combobox"]').first();
  const reducedComboboxField = reducedCombobox.locator("xpath=..");
  const reducedComboboxPress = await pressDelta(page, reducedCombobox, reducedComboboxField);
  expect(reducedComboboxPress.pressedScale, "the combobox field does not compress either").toBe(1);
  await page.keyboard.press("Escape");
  await page.locator("body").click({ position: { x: 4, y: 4 } });

  /* The response to an event is not motion: a control still reports hover. */
  const primary = page.getByRole("button", { name: "Submit form" });
  await primary.hover();
  await expect
    .poll(() => primary.evaluate((element) => getComputedStyle(element, "::before").opacity))
    .not.toBe("0");

  /* Neither is a positioning transform. A switch thumb keeps the translate that centres it in
     its track while the press that would scale it is neutralised — a blanket `transform: none`
     would move the thumb off centre instead of leaving it alone. */
  const thumb = page.getByRole("switch", { name: "Enabled" }).locator(".shadow-sherick-control").first();
  expect((await motionOf(thumb)).transform).not.toBe("none");
  const centring = await thumb.evaluate((element) => {
    const thumbBox = element.getBoundingClientRect();
    const trackBox = element.parentElement!.getBoundingClientRect();
    return Math.abs(thumbBox.top + thumbBox.height / 2 - (trackBox.top + trackBox.height / 2));
  });
  expect(centring).toBeLessThan(1);

  /* Continuous activity becomes a static status glyph rather than a loop. */
  await page.goto("/verification/motion");
  await expect(page.getByTestId("motion-lab")).toBeVisible();
  expect((await motionOf(page.getByTestId("lab-spinner").locator("svg"))).animation).toBe("none");
  expect((await motionOf(page.getByTestId("lab-skeleton").locator("div"))).animation).toBe("none");

  expect(errors).toEqual([]);
});

test("an initially-open surface does not replay its entrance", async ({ page, errors }) => {
  await watchEntrances(page);

  await page.goto("/verification/dialog");
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await expect(dialog).toHaveCSS("opacity", "1");

  expect(await entrances(page), "an initially-open surface never enters").toEqual([]);
  expect(await dialog.evaluate((element) => element.getAnimations().length)).toBe(0);

  /* The recorder is not vacuous: a surface the user opens does go through the lifecycle. */
  await openFixture(page);
  await page.getByRole("button", { name: "Open popover" }).click();
  await expect(page.getByTestId("popover-state")).toHaveText("open");
  const recorded = await entrances(page);
  expect(recorded.length).toBeGreaterThan(0);
  expect(recorded.some((entry) => entry.transform !== "none"), "a real entrance travels").toBe(true);

  expect(errors).toEqual([]);
});

test("a repositioned or rapidly reversed surface never replays or queues", async ({ page, errors }) => {
  await watchEntrances(page);
  await openFixture(page);

  await page.getByRole("button", { name: "Open popover" }).click();
  await expect(page.getByTestId("popover-state")).toHaveText("open");

  const shell = page.locator(".sui-scope.shadow-sherick-floating");
  await expect(shell).toBeVisible();
  const settled = (await entrances(page)).length;

  /* Collision handling is placement, not presence: re-placing the surface must not run its
     entrance again. */
  await page.setViewportSize({ width: 860, height: 640 });
  await expect(shell).toBeVisible();
  expect(await entrances(page), "a reposition must not replay the entrance").toHaveLength(settled);

  /* Open → close → open, in slow motion, so the reversal really lands mid-transition. */
  await page.goto("/verification/motion");
  await page.getByTestId("motion-speed-slow").click();
  await page.getByTestId("lab-popover-trigger").click();
  const labShell = page.locator(".sui-scope.shadow-sherick-floating[data-base-ui-focusable]");
  await expect(labShell).toBeVisible();

  /* Let the entrance make progress before it is interrupted, so the reversal has a painted
     value to retarget from. */
  await expect
    .poll(async () => Number(await labShell.evaluate((element) => getComputedStyle(element).opacity)))
    .toBeGreaterThan(0.2);

  await page.keyboard.press("Escape");
  await expect(labShell).toHaveAttribute("data-ending-style", "");
  await page.getByTestId("lab-popover-trigger").click();

  await expect(labShell).toHaveCount(1);
  await expect(labShell).not.toHaveAttribute("data-ending-style");
  await expect.poll(async () => labShell.evaluate((element) => getComputedStyle(element).opacity)).toBe("1");

  await page.keyboard.press("Escape");
  await expect(labShell).toHaveCount(0);

  expect(errors).toEqual([]);
});

/*
 The tests below prove geometry rather than taxonomy: that the anchored family really shares one
 entrance, that a press really moves a control, and that a relocation really travels between its
 two destinations without overshooting.
*/

const lab = "/verification/motion";
const labPopupSelector = ".sui-scope.shadow-sherick-floating[data-base-ui-focusable]";

const openLab = async (page: Page) => {
  await page.goto(lab);
  await page.getByTestId("motion-lab").waitFor();
};

test("the anchored family opens with one shared entrance geometry", async ({ page, errors }) => {
  /* Select is the reference implementation: the other anchored surfaces have to open with the
     same physics, and only the anchor resolution — side, origin, travel direction — may differ. */
  const cases: { name: string; open: () => Promise<void> }[] = [
    { name: "select", open: () => page.getByRole("combobox", { name: "Select", exact: true }).click() },
    { name: "combobox", open: () => page.locator('[aria-label="Show options"]').first().click() },
    { name: "menu", open: () => page.getByRole("button", { name: "Open menu", exact: true }).click() },
    { name: "popover", open: () => page.getByTestId("lab-popover-trigger").click() },
    { name: "dialog", open: () => page.getByRole("button", { name: "Dialog", exact: true }).click() },
  ];

  const geometry: Record<string, Awaited<ReturnType<typeof startingGeometry>>> = {};
  for (const { name, open } of cases) {
    await openLab(page);
    await open();
    const popup = page.locator(labPopupSelector);
    await expect(popup).toBeVisible();
    geometry[name] = await startingGeometry(popup);
  }

  const reference = geometry.select;
  expect(reference.scale, "the reference surface must grow visibly").toBe(0.94);

  for (const name of ["combobox", "menu", "popover"]) {
    expect(geometry[name].scale, `${name} must grow like Select`).toBe(reference.scale);
    expect(geometry[name].translateY, `${name} must travel like Select`).toBe(reference.translateY);
    expect(geometry[name].side, `${name} must resolve the same side`).toBe(reference.side);
    expect(geometry[name].origin, `${name} must grow from the same anchor edge`).toBe(reference.origin);
    expect(geometry[name].duration, `${name} must enter on the same timing`).toBe(reference.duration);
    expect(geometry[name].timing, `${name} must enter on the same curve`).toBe(reference.timing);
  }

  /* A modal is the large-surface variant: the same family, its own restrained scale and a
     vertical settle, and it never grows from a side. */
  expect(geometry.dialog.scale).toBe(0.96);
  expect(geometry.dialog.translateY).toBe(12);
  expect(geometry.dialog.side).toBeNull();

  expect(errors).toEqual([]);
});

test("a tooltip is the same physical idea on the lighter timing", async ({ page, errors }) => {
  await openLab(page);
  await page.getByRole("button", { name: "Hover", exact: true }).hover();
  const popup = page.locator(labPopupSelector);
  await expect(popup).toBeVisible();

  const tooltip = await startingGeometry(popup);
  expect(tooltip.scale).toBe(0.94);
  expect(Math.abs(tooltip.translateY)).toBe(4);
  expect(toMs(tooltip.duration)).toBeLessThan(toMs(await token(page, "--sui-duration-overlay")));
  expect(firstTiming(tooltip.timing)).toBe(firstTiming(await token(page, "--sui-ease-glide")));

  expect(errors).toEqual([]);
});

test("a press moves a control by the amplitude its role owns", async ({ page, errors }) => {
  await openLab(page);

  /* A full control compresses four percent, which is about two pixels at the size of the ink it
     moves. A control whose ink is smaller than its target is the other case, asserted separately:
     its target is stable and its mark takes the press. */
  const button = await pressDelta(page, page.getByRole("button", { name: "Filled", exact: true }), page.getByRole("button", { name: "Filled", exact: true }));
  expect(button.compressionPercent).toBeGreaterThan(3);
  expect(button.compressionPercent).toBeLessThan(5);

  const icon = await pressDelta(page, page.getByRole("button", { name: "Copy", exact: true }), page.getByRole("button", { name: "Copy", exact: true }));
  expect(icon.compressionPercent).toBeGreaterThan(3);
  expect(icon.compressionPercent).toBeLessThan(5);

  expect(errors).toEqual([]);
});


test("Select and Combobox are the same control in two forms", async ({ page, errors }) => {
  /* The same physical event has to produce the same response, measured as geometry rather than
     inferred from a class name: a press on a select's trigger and a press on an editable
     combobox's field both compress the *whole field*, by the same amount, through the same recipe
     and the same timing. */
  await openLab(page);
  const selectTrigger = page.getByRole("combobox", { name: "Select", exact: true });
  const selectField = selectTrigger.locator("xpath=..");
  expect((await motionOf(selectField)).property, "the field is what presses").toContain("transform");
  await expectDuration(page, selectField, "--sui-duration-release");
  expect((await motionOf(selectTrigger)).property, "the trigger itself only carries tone").not.toContain("transform");
  const selectPress = await pressDelta(page, selectTrigger, selectField);

  await openLab(page);
  const comboboxInput = page.locator('input[role="combobox"]').first();
  const comboboxField = comboboxInput.locator("xpath=..");
  expect((await motionOf(comboboxField)).property, "the field is what presses").toContain("transform");
  await expectDuration(page, comboboxField, "--sui-duration-release");
  const comboboxPress = await pressDelta(page, comboboxInput, comboboxField);

  expect(selectPress.pressedScale, "a select compresses its whole field").toBe(0.96);
  expect(comboboxPress.pressedScale, "and the combobox reaches the same scale on the same press").toBe(0.96);
  expect(comboboxPress.compressionPercent, "the amplitudes match").toBeCloseTo(selectPress.compressionPercent, 1);
  expect(comboboxPress.restWidth).toBeCloseTo(selectPress.restWidth, 0);
  expect(comboboxPress.restWidth - comboboxPress.pressedWidth).toBeGreaterThan(10);

  /* The field's own affordances add nothing: they answer with tone, because a second compression
     nested inside the field's would read as two events for one press. Their measured box still
     shrinks with the field around them, so the assertion is about their own geometry. */
  await page.locator("body").click({ position: { x: 4, y: 4 } });
  await openLab(page);
  const disclosure = page.locator('[aria-label="Show options"]').first();
  const fieldOfDisclosure = disclosure.locator("xpath=..");
  const disclosurePress = await pressDelta(page, disclosure, disclosure, fieldOfDisclosure);
  expect(disclosurePress.pressedScale, "the disclosure control does not deform itself").toBe(1);
  expect(disclosurePress.alsoScale, "the field it sits in takes the press").toBe(0.96);

  /* And once the press has completed, the field is a text field: typing does not move it. */
  await openLab(page);
  const field = page.locator('input[role="combobox"]').first().locator("xpath=..");
  const atRest = await field.boundingBox();
  await comboboxInput.click();
  await comboboxInput.fill("dash");
  await expect(comboboxInput).toHaveValue("dash");
  await expect.poll(() => scaleOf(field), { message: "typing is not a press" }).toBe(1);
  expect(await field.boundingBox(), "typing does not move the field").toEqual(atRest);

  expect(errors).toEqual([]);
});

test("a press inside a field's text is the same press", async ({ page, errors }) => {
  /* A caret click and a drag across a word activate the field's ancestor chain exactly as a press
     on its disclosure control does, so the field compresses for them too. That is deliberate:
     telling the two apart would take pointer bookkeeping or an interaction state machine inside a
     component, and one press is one press. What must stay still is the field used *as a text
     field* — typing and focus, asserted above. */
  await openLab(page);
  const input = page.locator('input[role="combobox"]').first();
  const field = input.locator("xpath=..");
  const atRest = await field.boundingBox();
  const textBox = await input.boundingBox();
  if (!atRest || !textBox) throw new Error("the field has no box");

  await page.mouse.move(textBox.x + 12, textBox.y + textBox.height / 2);
  await page.mouse.down();
  await page.mouse.move(textBox.x + 90, textBox.y + textBox.height / 2, { steps: 5 });
  await page.waitForTimeout(320);
  expect(await scaleOf(field), "pressing the text presses the field").toBe(0.96);

  await page.mouse.up();
  await page.keyboard.press("Escape");
  await expect.poll(() => scaleOf(field), { message: "and it settles back" }).toBe(1);
  expect(await field.boundingBox(), "with the field back at rest").toEqual(atRest);

  expect(errors).toEqual([]);
});

test("a selection mark starts small and lands with an overshoot", async ({ page, errors }) => {
  await openLab(page);
  await page.getByRole("checkbox", { name: "Motion lab checkbox" }).click();
  await page.waitForTimeout(60);

  const mark = page.locator('[aria-label="Motion lab checkbox"] span span').first();
  const flight = await mark.evaluate((element) => {
    const animations = element.getAnimations();
    const scaleAt = (fraction: number) => {
      for (const animation of animations) {
        animation.pause();
        animation.currentTime = fraction * (animation.effect?.getTiming().duration as number);
      }
      const transform = getComputedStyle(element).transform;
      return Number(new DOMMatrix(transform === "none" ? "" : transform).a.toFixed(3));
    };
    const start = scaleAt(0);
    const middle = scaleAt(0.65);
    const end = scaleAt(1);
    for (const animation of animations) animation.cancel();
    return { start, middle, end };
  });

  /* A mark is made, not faded: it arrives from half its size, passes slightly beyond it and
     settles — and the boundary it lands inside never moves. */
  expect(flight.start).toBe(0.5);
  expect(flight.middle).toBeGreaterThan(1);
  expect(flight.end).toBe(1);

  expect(errors).toEqual([]);
});

test("a switch thumb relocates in place without overshooting", async ({ page, errors }) => {
  await openLab(page);
  const control = page.getByRole("switch", { name: "Motion lab switch" });
  const thumb = control.locator(".shadow-sherick-control");

  const atRest = await thumb.boundingBox();
  await control.click();
  await page.waitForTimeout(80);
  const moving = await thumb.boundingBox();
  if (!atRest || !moving) throw new Error("the switch thumb has no box");

  /* The thumb has to actually travel — the primitive holds the state, so an uncontrolled switch
     is styled from the primitive's own marker rather than from a prop. */
  expect(await control.getAttribute("aria-checked")).toBe("true");
  expect(moving.x).toBeGreaterThan(atRest.x);
  expect(moving.width).toBeGreaterThan(atRest.width);

  const travel = await thumb.evaluate((element) => {
    const animations = element.getAnimations();
    const translateAt = (fraction: number) => {
      for (const animation of animations) {
        animation.pause();
        animation.currentTime = fraction * (animation.effect?.getTiming().duration as number);
      }
      const transform = getComputedStyle(element).transform;
      return Number(new DOMMatrix(transform === "none" ? "" : transform).e.toFixed(2));
    };
    const start = translateAt(0);
    const middle = translateAt(0.5);
    const end = translateAt(1);
    for (const animation of animations) animation.cancel();
    return { start, middle, end };
  });

  expect(travel.start).toBeLessThan(travel.middle);
  expect(travel.middle).toBeLessThan(travel.end);
  expect(firstTiming((await motionOf(thumb)).timing)).toBe(firstTiming(await token(page, "--sui-ease-glide")));
  expect(firstTiming((await motionOf(thumb)).timing)).not.toBe(firstTiming(await token(page, "--sui-ease-spring")));

  expect(errors).toEqual([]);
});

test("a relocated indicator is mid-travel in the middle of its own motion", async ({ page, errors }) => {
  await openFixture(page);
  const indicator = page.getByRole("tablist").locator(":scope > span");

  const leftAt = (fraction: number) =>
    indicator.evaluate((element, f) => {
      const animations = element.getAnimations();
      for (const animation of animations) {
        animation.pause();
        animation.currentTime = (f as number) * (animation.effect?.getTiming().duration as number);
      }
      const value = Number.parseFloat(getComputedStyle(element).left);
      for (const animation of animations) animation.cancel();
      return value;
    }, fraction);

  const before = await leftAt(1);
  await page.getByRole("tab", { name: "Details" }).click();
  await page.waitForTimeout(40);
  const middle = await leftAt(0.5);
  const after = await leftAt(1);

  /* The indicator is somewhere between its two destinations halfway through, and never beyond
     the one it is heading for — a travel, not a snap and not a bounce. */
  expect(middle).toBeGreaterThan(before);
  expect(middle).toBeLessThan(after);
  expect(firstTiming((await motionOf(indicator)).timing)).toBe(firstTiming(await token(page, "--sui-ease-glide")));

  expect(errors).toEqual([]);
});

test("a value control looks ringed while it is being used, and only then", async ({ page, errors }) => {
  /* A select trigger and an editable combobox field are the same control in two forms, and the
     ring is the one part of that pair the platform treats differently: a focused text field always
     matches `:focus-visible`, while a button does not. The rule the library states instead is that
     a control which *holds a value* wears the ring while it holds focus or while its surface is
     open — so the two are ringed in exactly the same states. */
  await openLab(page);

  const ringOf = paintedRing;

  const selectTrigger = page.getByRole("combobox", { name: "Select", exact: true });
  const comboboxField = page.locator('input[role="combobox"]').first().locator("xpath=..");

  expect(await ringOf(selectTrigger), "at rest, neither is ringed").toBe("none");
  expect(await ringOf(comboboxField), "at rest, neither is ringed").toBe("none");

  /* used by pointer */
  await selectTrigger.click();
  await expect(selectTrigger).toHaveAttribute("data-popup-open", "");
  expect(await ringOf(selectTrigger), "a select is ringed while its list is open").toBe("ringed");
  await page.keyboard.press("Escape");
  await expect(page.getByRole("option")).toHaveCount(0);
  expect(await ringOf(selectTrigger), "and it stays ringed while it holds focus").toBe("ringed");

  await page.locator("body").click({ position: { x: 4, y: 4 } });
  expect(await ringOf(selectTrigger), "and loses it when focus moves away").toBe("none");

  const input = page.locator('input[role="combobox"]').first();
  await input.click();
  expect(await ringOf(comboboxField), "a combobox field is ringed while its list is open").toBe("ringed");
  await page.keyboard.press("Escape");
  expect(await ringOf(comboboxField), "and it stays ringed while it holds focus").toBe("ringed");
  await page.locator("body").click({ position: { x: 4, y: 4 } });
  expect(await ringOf(comboboxField), "and loses it when focus moves away").toBe("none");

  /* keyboard focus rings both, and a plain button keeps the quieter rule: it does not announce
     itself to a pointer. */
  await page.keyboard.press("Tab");
  await input.focus();
  expect(await ringOf(comboboxField)).toBe("ringed");

  const button = page.getByRole("button", { name: "Filled", exact: true });
  await button.click();
  expect(await ringOf(button), "a button is not ringed by a pointer press").toBe("none");
  await page.keyboard.press("Tab");
  await button.focus();
  await page.keyboard.press("Shift+Tab");
  await page.keyboard.press("Tab");
  expect(await ringOf(button), "and is ringed by keyboard focus").toBe("ringed");

  expect(errors).toEqual([]);
});

test("a slider handle rings for the keyboard, not for a drag", async ({ page, errors }) => {
  /* The handle answers a pointer with its own engagement — it grows and takes the accent — so a
     ring on top of that is noise while the pointer owns it. The ring is still what tells a keyboard
     user where the arrow keys will act, and the platform draws the line for us: a range input is
     `:focus-visible` only for the keyboard, where a text field always is. */
  await openLab(page);
  const thumb = page.locator("[data-sui-slider-thumb]");
  await thumb.scrollIntoViewIfNeeded();

  expect(await paintedRing(thumb), "at rest").toBe("none");

  const box = await thumb.boundingBox();
  if (!box) throw new Error("the slider handle has no box");
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await expect.poll(() => scaleOf(thumb), { message: "the handle answers the pointer itself" }).toBe(1.1);
  await page.mouse.move(box.x + 110, box.y + box.height / 2, { steps: 6 });
  expect(await paintedRing(thumb), "a drag is not a keyboard focus").toBe("none");
  await page.mouse.up();
  await page.waitForTimeout(400);
  expect(await paintedRing(thumb), "and the ring does not appear on release either").toBe("none");

  await page.locator("body").click({ position: { x: 4, y: 4 } });
  await page.waitForTimeout(300);
  await page.locator('input[type="range"]').first().focus();
  await page.keyboard.press("Tab");
  await page.keyboard.press("Shift+Tab");
  await page.keyboard.press("ArrowRight");
  await page.waitForTimeout(200);
  expect(await paintedRing(thumb), "keyboard focus rings it").toBe("ringed");

  /* and the fields are untouched: a text field rings the moment it is used */
  await page.locator("body").click({ position: { x: 4, y: 4 } });
  await page.waitForTimeout(300);
  const comboboxField = page.locator('input[role="combobox"]').first().locator("xpath=..");
  await page.locator('input[role="combobox"]').first().click();
  expect(await paintedRing(comboboxField), "a field still rings on a pointer press").toBe("ringed");
  await page.keyboard.press("Escape");

  expect(errors).toEqual([]);
});

test("a logical side travels toward its anchor in both directions", async ({ page, errors }) => {
  /* `inline-start` means the anchor's inline-start edge, which is physical *left* on a
     left-to-right page and physical *right* on a right-to-left one, so the four pixels that travel
     toward the anchor change sign with the page. The primitive resolves the side from the
     direction it is told about, so each specimen declares its own direction to Base while the
     document's `dir` drives the CSS — the pair a real right-to-left application sets. */
  const read = async (direction: string, side: string) => {
    const trigger = page.getByTestId(`logical-${direction}-${side}`);
    const triggerBox = await trigger.boundingBox();
    await trigger.click();
    const popup = page.locator(labPopupSelector).last();
    await expect(popup).toBeVisible();
    await page.waitForTimeout(120);
    const popupBox = await popup.boundingBox();
    if (!triggerBox || !popupBox) throw new Error("the surface has no box");
    const geometry = await popup.evaluate((element) => {
      const style = getComputedStyle(element);
      return {
        side: element.getAttribute("data-side"),
        shiftX: Number.parseFloat(style.getPropertyValue("--sui-overlay-from-shift-x")),
      };
    });
    await page.keyboard.press("Escape");
    await page.waitForTimeout(700);
    return {
      ...geometry,
      placed:
        popupBox.x + popupBox.width / 2 < triggerBox.x + triggerBox.width / 2 ? "left" : "right",
    };
  };

  await page.goto(fixture);
  await expect(page.getByRole("heading", { name: "Interaction verification" })).toBeVisible();

  /* left-to-right: inline-start is the popup's left edge, and the travel moves right into place */
  expect(await read("ltr", "inline-start")).toEqual({ side: "inline-start", shiftX: 4, placed: "left" });
  expect(await read("ltr", "inline-end")).toEqual({ side: "inline-end", shiftX: -4, placed: "right" });

  await page.evaluate(() => {
    document.documentElement.dir = "rtl";
  });
  await page.waitForTimeout(200);

  /* right-to-left: the same logical side is the popup's right edge, and the travel follows it */
  expect(await read("rtl", "inline-start")).toEqual({ side: "inline-start", shiftX: -4, placed: "right" });
  expect(await read("rtl", "inline-end")).toEqual({ side: "inline-end", shiftX: 4, placed: "left" });

  await page.evaluate(() => {
    document.documentElement.removeAttribute("dir");
  });

  expect(errors).toEqual([]);
});

test("a compact control keeps its target stable while its mark takes the press", async ({ page, errors }) => {
  /* A control whose visible ink is much smaller than the target it is aimed at must not compress
     the target: the pointer is already on it, and a 44px target that became 38.7px while held
     would move the ground under a near-edge release. The mark inside carries the press instead. */
  await openLab(page);

  const cases: { name: string; target: () => Locator; position: string; prepare?: () => Promise<void> }[] = [
    {
      name: "stepper",
      target: () => page.locator('[aria-label="Stepper"]').locator("xpath=..").locator("button").first(),
      /* `relative` is the state layer's own, and carries no offset: the control is not moved. */
      position: "relative",
    },
    { name: "alert dismiss", target: () => page.getByRole("button", { name: "Dismiss alert" }), position: "relative" },
    {
      name: "search submit",
      target: () => page.getByRole("button", { name: "Submit search" }),
      position: "absolute",
    },
    {
      name: "dialog close",
      target: () => page.getByRole("button", { name: "Close dialog" }),
      position: "absolute",
      prepare: async () => {
        await page.getByRole("button", { name: "Dialog", exact: true }).click();
        await page.getByRole("dialog").waitFor();
        /* The surface is scaled while its entrance runs, so "at rest" has to mean settled. */
        await page.waitForFunction(() => document.querySelector('[role="dialog"]')?.getAnimations().length === 0);
      },
    },
  ];

  for (const { name, target, position, prepare } of cases) {
    await openLab(page);
    if (prepare) await prepare();

    const control = target().first();
    /* A control that places itself must keep its own position: the state layer is `relative`, and
       a position written before it in the class list is merged away by `tailwind-merge`. */
    expect(
      await control.evaluate((element) => getComputedStyle(element).position),
      `${name} keeps its own position`
    ).toBe(position);
    await control.scrollIntoViewIfNeeded();
    const atRest = await control.boundingBox();
    if (!atRest) throw new Error(`${name} has no box`);
    const box = await control.boundingBox();
    if (!box) throw new Error(`${name} has no box`);
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    /* Once the mark has landed, the press is settled — and only then is "the target while held"
       a state worth measuring. */
    const mark = control.locator("span").first();
    await expect.poll(() => scaleOf(mark), { message: `${name} compresses its mark` }).toBe(0.88);

    expect(await control.boundingBox(), `${name} keeps its target`).toEqual(atRest);
    expect(await scaleOf(control), `${name} does not deform itself`).toBe(1);
    await page.mouse.up();
  }

  expect(errors).toEqual([]);
});
