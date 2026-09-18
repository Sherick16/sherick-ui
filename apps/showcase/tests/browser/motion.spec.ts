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
  const triggerMotion = await motionOf(trigger);
  expect(triggerMotion.property).toContain("transform");
  await expectDuration(page, trigger, "--sui-duration-release");

  const chevron = trigger.locator("svg");
  expect((await motionOf(chevron)).property).toBe("transform");
  await expectTiming(page, chevron, "--sui-ease-release");

  await trigger.click();
  const popup = page.locator(".sui-scope.shadow-sherick-floating");
  await expect(popup).toBeVisible();
  await expect(popup).toHaveAttribute("data-side", "bottom");

  const presence = await motionOf(popup);
  expect(presence.property).toContain("opacity");
  expect(presence.property).toContain("transform");
  await expectDuration(page, popup, "--sui-duration-overlay");

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
  const input = page.getByRole("combobox", { name: "Combobox project", exact: true });

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

    /* Lighter than an anchored popup: it settles on the local timing rather than the overlay
       timing, and it never bounces. */
    await expectDuration(page, popup, "--sui-duration-release");
    expect(firstTiming((await motionOf(popup)).timing)).toBe(firstTiming(await token(page, "--sui-ease-release")));

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

  const recorded = await entrances(page);
  expect(recorded.length, "the entrance lifecycle still runs").toBeGreaterThan(0);
  expect(recorded.every((entry) => entry.transform === "none"), "no reduced entrance travels").toBe(true);

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
  const labShell = page.locator(".sui-scope.shadow-sherick-floating");
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
