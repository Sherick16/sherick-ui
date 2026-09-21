import { expect, test, type Locator, type Page } from "./fixtures";

const ready = async (page: Page, path = "/verification/visual-consistency") => {
  await page.goto(path);
  await page.waitForFunction(() => document.documentElement.dataset.hydrated === "true");
};

// Opt-in review artifacts, not silently re-recorded pixel baselines. The same production build and
// real interactions as the regression suite; inspect the resulting images before accepting changes.
for (const theme of ["light", "dark"] as const) {
  test(`rendered review ${theme}`, async ({ page }, testInfo) => {
    test.skip(!process.env.VISUAL_REVIEW, "Run with VISUAL_REVIEW=1 for the full rendered review");
    test.setTimeout(120_000);
    await page.emulateMedia({ colorScheme: theme });
    await ready(page);
    const capture = async (name: string) => page.screenshot({path: testInfo.outputPath(`${name}.png`), animations: "disabled"});
    for (const name of ["Actions", "Fields", "Selection", "Rows", "Surfaces"]) {
      await page.locator(`[data-band="${name}"]`).screenshot({path: testInfo.outputPath(`${name}.png`)});
    }
    const actions = page.locator('[data-band="Actions"]');
    const action = actions.getByRole("button", {name:"Export",exact:true}).first();
    await action.hover();
    await actions.screenshot({path:testInfo.outputPath("Actions-hover.png")});
    await page.mouse.down();
    await actions.screenshot({path:testInfo.outputPath("Actions-pressed.png")});
    await page.mouse.up();
    await page.keyboard.press("Tab");
    await action.focus();
    await actions.screenshot({path:testInfo.outputPath("Actions-focus.png")});
    const reviewOverlays = async (suffix = "") => {
      const overlays = page.locator('[data-band="Overlays"]');
      for (const name of ["Commands", "Details", "Dialog", "Confirmation", "top sheet", "right sheet", "bottom sheet", "left sheet"]) {
        await overlays.getByRole("button", {name, exact: true}).click();
        const surface = name === "Commands" ? page.getByRole("menu") : name === "Details" ? page.getByText("Workspace details", {exact:true}).locator("..") : page.getByRole(name === "Confirmation" ? "alertdialog" : "dialog");
        await expect(surface).toBeVisible();
        await expect(surface).toHaveCSS("opacity", "1");
        await capture(name + suffix);
        await page.keyboard.press("Escape");
        await expect(surface).toBeHidden();
      }
      for (const name of ["Options", "Filtered options"]) {
        await overlays.getByRole("combobox", {name, exact: true}).click();
        await expect(page.getByRole("listbox")).toBeVisible();
        await expect(page.getByRole("listbox")).toHaveCSS("opacity", "1");
        await capture(name + suffix);
        await page.keyboard.press("Escape");
        await expect(page.getByRole("listbox")).toBeHidden();
      }
      await overlays.getByRole("button", {name:"Hint",exact:true}).hover();
      await expect(page.getByText("Workspace hint", {exact:true})).toBeVisible();
      await expect(page.getByText("Workspace hint", {exact:true})).toHaveCSS("opacity", "1");
      await capture("Hint" + suffix);
      await overlays.getByRole("button", {name:"Toast",exact:true}).click();
      const toast = page.getByRole("dialog", {name:"Workspace update"});
      await expect(toast).toBeVisible();
      await expect(toast).toHaveCSS("opacity", "1");
      await capture("Toast" + suffix);
      await toast.hover();
      await toast.getByRole("button", {name:"Dismiss",exact:true}).click();
      await expect(toast).toBeHidden();
    };
    await reviewOverlays();
    await page.getByRole("textbox", {name:"Invalid input",exact:true}).focus();
    await page.locator('[data-field-state="Invalid"]').screenshot({path: testInfo.outputPath("Fields-focus-invalid.png")});
    await page.getByRole("button", {name:"Mirror direction"}).click();
    await page.locator('[data-band="Rows"]').screenshot({path: testInfo.outputPath("Rows-rtl.png")});
    await page.setViewportSize({width:375,height:900});
    await page.locator('[data-field-state="Default"]').screenshot({path: testInfo.outputPath("Fields-narrow-rtl.png")});
    for (const band of ["Actions", "Selection", "Rows", "Surfaces"]) {
      await page.locator(`[data-band="${band}"]`).screenshot({path: testInfo.outputPath(`${band}-narrow-rtl.png`)});
    }
    await reviewOverlays("-narrow-rtl");
    await page.setViewportSize({width:1440,height:1000});
    await ready(page, "/");
    for (const section of ["design-language","buttons","fields","selection","feedback","disclosure","display","floating","content"]) {
      await page.locator(`#${section}`).screenshot({path: testInfo.outputPath(`showcase-${section}.png`)});
    }
  });
}

const style = (control: Locator) => control.evaluate(el => {
  const css = getComputedStyle(el);
  return {height: el.getBoundingClientRect().height, fontSize:css.fontSize, fill:css.backgroundColor, opacity:css.opacity, shadow:css.boxShadow, radius:parseFloat(css.borderTopLeftRadius), align:css.textAlign};
});
const layer = (control: Locator) => control.evaluate(el => Number(getComputedStyle(el, "::before").opacity));
const fieldSurfaces = (page: Page, state: string) => [
  page.getByRole("textbox", {name:`${state} input`,exact:true}),
  page.getByRole("combobox", {name:`${state} select`,exact:true}),
  page.getByRole("combobox", {name:`${state} combobox`,exact:true}).locator(".."),
  page.getByRole("textbox", {name:`${state} number`,exact:true}).locator(".."),
  page.getByRole("textbox", {name:`${state} search`,exact:true}).locator(".."),
];

for (const theme of ["light", "dark"] as const) {
  test.describe(`visual invariants ${theme}`, () => {
    test.beforeEach(async ({page}) => {
      await page.emulateMedia({colorScheme:theme});
      await ready(page);
    });

    test("normal fields share geometry, invalid tone, and one disabled step", async ({page, errors}) => {
      const defaults = await Promise.all(fieldSurfaces(page, "Default").map(style));
      for (const sibling of defaults) {
        expect(sibling.height).toBe(defaults[0].height);
        expect(sibling.fontSize).toBe(defaults[0].fontSize);
        expect(sibling.fill).toBe(defaults[0].fill);
      }
      const invalid = await Promise.all(fieldSurfaces(page, "Invalid").slice(0,4).map(style));
      for (const sibling of invalid) expect(sibling.fill).toBe(invalid[0].fill);
      expect(invalid[0].fill).not.toBe(defaults[0].fill);
      const disabled = fieldSurfaces(page, "Disabled");
      for (const sibling of disabled) {
        const rest = await style(sibling);
        expect(rest.opacity).toBe("0.45");
        await sibling.hover();
        expect((await style(sibling)).fill).toBe(rest.fill);
        for (const part of await sibling.locator("button").all()) expect((await style(part)).opacity).toBe("1");
      }
      // A bound disables the part, not the whole field.
      const number = page.getByRole("textbox", {name:"Default number",exact:true});
      await number.fill("10");
      await number.blur();
      expect((await style(number.locator("..").getByRole("button", {name:"Increase"}))).opacity).toBe("0.45");
      expect(errors).toEqual([]);
    });

    test("engaged invalid fields keep one tone while open and hovered", async ({page}) => {
      const fills: string[] = [];
      for (const name of ["Invalid select", "Invalid combobox"]) {
        const control = page.getByRole("combobox", {name, exact:true});
        const surface = name.endsWith("select") ? control : control.locator("..");
        const rest = (await style(surface)).fill;
        await control.click();
        await expect(page.getByRole("listbox")).toBeVisible();
        await page.mouse.move(0, 0);
        const engaged = (await style(surface)).fill;
        expect(engaged).not.toBe(rest);
        await control.hover();
        expect((await style(surface)).fill).toBe(engaged);
        fills.push(engaged);
        await page.keyboard.press("Escape");
        await expect(page.getByRole("listbox")).toBeHidden();
      }
      expect(fills[0]).toBe(fills[1]);
    });

    test("narrow RTL siblings stay contained and toast actions follow their copy", async ({page}) => {
      await page.getByRole("button", {name:"Mirror direction"}).click();
      await page.setViewportSize({width:320,height:900});
      const layout = await page.evaluate(() => ({
        width: document.documentElement.scrollWidth,
        bands: Array.from(document.querySelectorAll('[data-band]')).map(el => ({
          name: el.getAttribute('data-band'), width: el.scrollWidth,
          children: Array.from(el.children).map(child => ({tag: child.tagName, width: child.getBoundingClientRect().width})),
        })),
      }));
      expect(layout.width, JSON.stringify(layout)).toBeLessThanOrEqual(320);
      await page.getByRole("button", {name:"Toast",exact:true}).click();
      const toast = page.getByRole("dialog", {name:"Workspace update"});
      await expect(toast).toBeVisible();
      const description = (await toast.getByText("Supporting copy that wraps beneath a first-line status mark.").boundingBox())!;
      const action = (await toast.getByRole("button", {name:"Undo",exact:true}).boundingBox())!;
      expect(action.y).toBeGreaterThanOrEqual(description.y + description.height);
      const box = (await toast.boundingBox())!;
      expect(box.x).toBeGreaterThanOrEqual(0);
      expect(box.x + box.width).toBeLessThanOrEqual(320);
    });

    test("loading and disabled tactile siblings preserve their resting depth", async ({page}) => {
      const buttons = page.locator('[data-appearance="tonal"]').getByRole("button", {name:"Export",exact:true});
      const resting = await style(buttons.first());
      expect(resting.shadow).not.toBe("none");
      for (const sibling of [buttons.nth(1),buttons.nth(2)]) {
        const result = await style(sibling);
        expect(result.shadow).toBe(resting.shadow);
        expect(result.height).toBe(resting.height);
        expect((await sibling.boundingBox())?.width).toBe((await buttons.first().boundingBox())?.width);
      }
      expect((await style(page.getByRole("button", {name:"tonal loading icon",exact:true}))).shadow).toBe(resting.shadow);
    });

    test("held destinations and segments retain the quiet hover and press steps", async ({page}) => {
      const controls = [page.getByRole("tab", {name:"Workspace",exact:true}),page.getByRole("link", {name:"Workspace",exact:true}),page.getByRole("group", {name:"Segments",exact:true}).getByRole("button", {name:"Workspace",exact:true})];
      for (const control of controls) {
        await control.hover();
        expect(await layer(control)).toBe(0.05);
        await page.mouse.down();
        expect(await layer(control)).toBe(0.09);
        await page.mouse.up();
      }
      await page.keyboard.press("Tab");
      await controls[0].focus();
      expect((await style(controls[0])).shadow).toContain("inset");
    });

    test("selection lists share their row rhythm; menu rules follow the content band", async ({page}) => {
      const gaps: number[] = [];
      for (const name of ["Options","Filtered options"]) {
        await page.getByRole("combobox", {name,exact:true}).click();
        const rows = page.getByRole("option");
        await expect(rows).toHaveCount(3);
        const first = (await rows.nth(0).boundingBox())!;
        const second = (await rows.nth(1).boundingBox())!;
        gaps.push(second.y - first.y - first.height);
        await page.keyboard.press("Escape");
        await expect(page.getByRole("listbox")).toBeHidden();
      }
      expect(gaps[0]).toBe(gaps[1]);
      expect(gaps[0]).toBeGreaterThan(0);
      await page.getByRole("button", {name:"Commands",exact:true}).click();
      const menu = page.getByRole("menu");
      const rule = menu.getByRole("separator");
      await expect(rule).toBeVisible();
      const inset = await menu.evaluate(el => {
        const row = el.querySelector('[role="menuitem"]')!;
        const line = el.querySelector('[role="separator"]')!;
        return {content:row.getBoundingClientRect().left + parseFloat(getComputedStyle(row).paddingLeft), line:line.getBoundingClientRect().left};
      });
      expect(inset.line).toBeCloseTo(inset.content,1);
    });

    test("shape reflects the nested object, not an oversized capsule", async ({page}) => {
      const tab = page.getByRole("tab", {name:"Workspace",exact:true});
      const outer = await style(page.getByRole("tablist", {name:"Sections"}));
      const inner = await style(tab);
      expect(inner.radius).toBeLessThan(inner.height/2);
      expect(outer.radius).toBeGreaterThan(inner.radius);
      const group = page.getByRole("group", {name:"Segments",exact:true});
      expect((await style(group)).radius).toBeGreaterThan((await style(group.getByRole("button").first())).radius);
      await page.getByRole("button", {name:"Hint",exact:true}).hover();
      const hint = page.getByText("Workspace hint", {exact:true});
      await expect(hint).toBeVisible();
      const corner = await style(hint);
      expect(corner.radius).toBeLessThan(corner.height/2);
    });

    test("logical alignment and switch geometry mirror together", async ({page}) => {
      const offset = () => page.getByRole("switch", {name:"On",exact:true}).evaluate(el => {
        const track = el.firstElementChild!;
        const thumb = track.firstElementChild!;
        const a = track.getBoundingClientRect(), b = thumb.getBoundingClientRect();
        return [b.left-a.left,a.right-b.right];
      });
      const ltr = await offset();
      await page.getByRole("button", {name:"Mirror direction"}).click();
      const rtl = await offset();
      expect(rtl[0]).toBeCloseTo(ltr[1],1);
      expect(rtl[1]).toBeCloseTo(ltr[0],1);
      const disclosure = page.getByRole("button", {name:"Workspace settings with a label that can wrap"}).first();
      expect((await style(disclosure)).align).toBe("start");
      await page.getByRole("combobox", {name:"Options",exact:true}).click();
      expect((await style(page.getByRole("option").first())).align).toBe("start");
    });

    test("disabled composite fields do not compress under a held pointer", async ({page}) => {
      await page.emulateMedia({reducedMotion:"no-preference"});
      for (const control of fieldSurfaces(page,"Disabled").slice(1,3)) {
        const target = control.getByRole("combobox").or(control.and(page.locator('[role="combobox"]')));
        const box = (await control.boundingBox())!;
        await page.mouse.move(box.x + box.width/2,box.y + box.height/2);
        await page.mouse.down();
        // Finish transitions instead of reading an arbitrary frame of the press.
        await page.evaluate(() => document.getAnimations().filter(animation => animation instanceof CSSTransition).forEach(animation => animation.finish()));
        expect((await control.boundingBox())!.width).toBe(box.width);
        await expect(target).toBeDisabled();
        await page.mouse.up();
      }
    });
  });
}
