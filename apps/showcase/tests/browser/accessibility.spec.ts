import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "./fixtures";

/* WCAG A/AA plus the WCAG 2.2 target-size rule (`wcag22aa`, SC 2.5.8). Axe 4.13 still ships
   `target-size` disabled by default, so the tag set selects it but does not run it: the scan turns it
   on explicitly and asserts it executed. The library designs around the 24px pointer minimum. */
const WCAG_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];
const THEMES = ["light", "dark"] as const;
type Theme = (typeof THEMES)[number];

/* The scan runs in the theme by emulating the platform colour scheme *before* the document loads,
   rather than toggling the attribute afterwards. The package generates system dark and explicit
   dark from the same canonical object (`bun run test` asserts the two are identical), and a page
   loaded already in its theme has no stale descendant colour for a scan to read. */
const gotoTheme = async (page: Page, theme: Theme, url: string) => {
  await page.emulateMedia({ colorScheme: theme });
  await page.goto(url);
};

/* Every rule in the tag set is enabled: the gate has no authored-palette exception, and the
   contrast contract in `bun run test` is what keeps the theme able to satisfy it. The scan runs in
   both authored themes rather than one browser theme plus the mathematical contract, because a
   state the contract cannot see is a state a regression can hide in. */
const expectNoA11yViolations = async (page: Page, theme: Theme) => {
  /* Base UI wires every generated ARIA relationship on the client: the server-rendered shell
     carries none of them, so a field that is named a moment later looks unnamed to a scan that
     races hydration. The wait is for hydration itself — the marker the root layout sets once the
     whole tree below it has run its effects — rather than for any one attribute, which some other
     component on the page could satisfy while the component under test is still bare. */
  await page.waitForFunction(() => document.documentElement.dataset.hydrated === "true");

  /* And the page's own ink has to resolve to the emulated theme's ink before the scan, so a
     descendant is never read one style recalculation behind. */
  await page.waitForFunction(() => {
    const probe = document.createElement("div");
    probe.style.color = "oklch(var(--sui-ink))";
    document.body.appendChild(probe);
    const expected = getComputedStyle(probe).color;
    probe.remove();
    return getComputedStyle(document.body).color === expected;
  });

  const results = await new AxeBuilder({ page })
    .options({
      runOnly: { type: "tag", values: WCAG_TAGS },
      /* Axe 4.13 still ships `target-size` disabled, and `AxeBuilder.options()` replaces the whole
         option object, so the tag filter and the enabling override are set together. */
      rules: { "target-size": { enabled: true } },
    })
    .analyze();
  const summary = results.violations
    .map(
      (violation) =>
        `${violation.id}${violation.impact ? ` (${violation.impact})` : ""} [${violation.nodes
          .map((node) => node.target.join(" "))
          .join(", ")}]`
    )
    .join("\n");

  expect(results.violations, `axe violations in ${theme}:\n${summary}`).toEqual([]);

  /* A rule that never ran produces no result at all, so an empty `violations` array is not proof
     the target-size check executed: require it in one of the buckets that only hold rules that ran. */
  const targetSizeRan = [...results.passes, ...results.incomplete, ...results.violations].some(
    (result) => result.id === "target-size"
  );
  expect(targetSizeRan, `the target-size rule did not execute in ${theme}`).toBe(true);
};

/* The showcase is a page of interactive specimens, and it is the only place some states appear at
   all — a motion stage with a real control in it, the toast stack, an open drawer. Scanning it is
   what keeps a specimen from being the one thing no gate looks at.
   The content renderer must hydrate without replacing React-owned or host-owned markup. */

for (const theme of THEMES) {
  test(`the showcase itself has no automatically detectable WCAG A/AA violations (${theme})`, async ({
    page,
    errors,
  }) => {
    await gotoTheme(page, theme, "/");
    await expect(page.getByRole("heading", { name: "Design language", exact: true })).toBeVisible();

    await expectNoA11yViolations(page, theme);

    expect(errors).toEqual([]);
  });

  test(`core verification fixture has no automatically detectable WCAG A/AA violations (${theme})`, async ({
    page,
    errors,
  }) => {
    await gotoTheme(page, theme, "/verification/core");
    await expect(page.getByTestId("verification-core")).toBeVisible();

    await expectNoA11yViolations(page, theme);

    expect(errors).toEqual([]);
  });

  test(`interactions verification fixture has no automatically detectable WCAG A/AA violations (${theme})`, async ({
    page,
    errors,
  }) => {
    await gotoTheme(page, theme, "/verification/interactions");
    await expect(page.getByRole("textbox", { name: "Project name" })).toBeVisible();

    await expectNoA11yViolations(page, theme);

    expect(errors).toEqual([]);
  });

  test(`rich-content fixture has no automatically detectable WCAG A/AA violations (${theme})`, async ({
    page,
    errors,
  }) => {
    await gotoTheme(page, theme, "/verification/rich-content");
    await expect(page.getByTestId("verification-rich-content")).toBeVisible();
    await expect(page.getByText("A comment that has to stay readable")).toBeVisible();

    await expectNoA11yViolations(page, theme);

    expect(errors).toEqual([]);
  });

  test(`initially-open dialog has no automatically detectable WCAG A/AA violations (${theme})`, async ({
    page,
    errors,
  }) => {
    await gotoTheme(page, theme, "/verification/dialog");
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page.getByRole("button", { name: "Close dialog" })).toBeVisible();

    await expectNoA11yViolations(page, theme);

    expect(errors).toEqual([]);
  });

  test(`Select opened inside a dialog has no automatically detectable WCAG A/AA violations (${theme})`, async ({
    page,
    errors,
  }) => {
    await gotoTheme(page, theme, "/verification/interactions");
    await page.getByRole("button", { name: "Open dialog" }).click();
    await expect(page.getByRole("dialog")).toBeVisible();

    await page.getByRole("combobox", { name: "Dialog project type" }).click();
    await expect(page.getByRole("option", { name: "Design system" })).toBeVisible();

    await expectNoA11yViolations(page, theme);

    expect(errors).toEqual([]);
  });

  test(`AlertDialog opened over the interactions fixture has no automatically detectable WCAG A/AA violations (${theme})`, async ({
    page,
    errors,
  }) => {
    await gotoTheme(page, theme, "/verification/interactions");
    await page.getByRole("button", { name: "Delete workspace" }).click();
    await expect(page.getByRole("alertdialog")).toBeVisible();

    await expectNoA11yViolations(page, theme);

    expect(errors).toEqual([]);
  });

  test(`an open Menu has no automatically detectable WCAG A/AA violations (${theme})`, async ({ page, errors }) => {
    await gotoTheme(page, theme, "/verification/interactions");
    await page.getByRole("button", { name: "Open menu" }).click();
    await expect(page.getByRole("menuitem", { name: "Rename" })).toBeVisible();

    await expectNoA11yViolations(page, theme);

    await page.keyboard.press("Escape");
    expect(errors).toEqual([]);
  });

  test(`an open Combobox has no automatically detectable WCAG A/AA violations (${theme})`, async ({
    page,
    errors,
  }) => {
    await gotoTheme(page, theme, "/verification/interactions");
    const searchable = page.getByRole("combobox", { name: "Combobox project" });
    await searchable.click();
    await expect(page.getByRole("option", { name: "Design system" })).toBeVisible();

    await expectNoA11yViolations(page, theme);

    expect(errors).toEqual([]);
  });
}

test("an open Combobox preserves tab-order isolation for its full open lifetime", async ({
  page,
  errors,
}) => {
  await page.goto("/verification/interactions");
  const searchable = page.getByRole("combobox", { name: "Combobox project" });
  const outsideButton = page.getByTestId("menu-plain-trigger");
  const mutableTarget = page.getByTestId("combobox-focusability-target");
  const nativeSummary = page.getByTestId("combobox-native-summary");
  const lateButton = page.getByTestId("combobox-late-button");
  const explicitlyRemoved = page.getByTestId("combobox-explicit-negative");
  const firstRadio = page.getByTestId("combobox-radio-first");
  const secondRadio = page.getByTestId("combobox-radio-second");
  await expect(outsideButton).toHaveAttribute("tabindex", "0");

  await searchable.click();
  await expect(page.getByRole("option", { name: "Design system" })).toBeVisible();
  await expect(outsideButton).toHaveAttribute("tabindex", "-1");

  await outsideButton.evaluate((button) => {
    const hiddenRoot = button.closest('[aria-hidden="true"]');
    if (!hiddenRoot) throw new Error("Outside button is not inside Combobox isolation");
    const fixture = document.createElement("div");
    fixture.dataset.testid = "combobox-live-isolation";
    fixture.innerHTML = `
      <div data-testid="combobox-focusability-target">Becomes focusable while hidden</div>
      <details><summary data-testid="combobox-native-summary">Native summary</summary></details>
      <button data-testid="combobox-late-button">Mounted while hidden</button>
      <button data-testid="combobox-explicit-negative">Stops participating while hidden</button>
      <label><input data-testid="combobox-radio-first" type="radio" name="combobox-isolation" checked> First</label>
      <label><input data-testid="combobox-radio-second" type="radio" name="combobox-isolation"> Second</label>
    `;
    hiddenRoot.append(fixture);
  });
  await expect(nativeSummary).toHaveAttribute("tabindex", "-1");
  await expect(lateButton).toHaveAttribute("tabindex", "-1");
  await expect(explicitlyRemoved).toHaveAttribute("tabindex", "-1");
  await expect(firstRadio).toBeChecked();
  await expect(secondRadio).not.toBeChecked();
  await secondRadio.evaluate((element) => {
    if (!(element instanceof HTMLInputElement)) throw new Error("Expected a native radio input");
    element.checked = true;
  });
  await expect(firstRadio).not.toBeChecked();
  await expect(secondRadio).toBeChecked();
  await expect(firstRadio).toHaveAttribute("tabindex", "-1");
  await expect(secondRadio).toHaveAttribute("tabindex", "-1");

  await mutableTarget.evaluate((element) => {
    element.tabIndex = 0;
  });
  await expect(mutableTarget).toHaveAttribute("tabindex", "-1");
  await explicitlyRemoved.evaluate((element) => {
    element.tabIndex = -1;
  });

  await page.keyboard.press("Escape");
  await expect(outsideButton).toHaveAttribute("tabindex", "0");
  await expect(mutableTarget).toHaveAttribute("tabindex", "0");
  expect(await nativeSummary.getAttribute("tabindex")).toBeNull();
  expect(await lateButton.getAttribute("tabindex")).toBeNull();
  await expect(explicitlyRemoved).toHaveAttribute("tabindex", "-1");
  expect(await firstRadio.getAttribute("tabindex")).toBeNull();
  expect(await secondRadio.getAttribute("tabindex")).toBeNull();
  await expect(firstRadio).not.toBeChecked();
  await expect(secondRadio).toBeChecked();

  /* Removing a control from sequential focus must not make a non-modal popup inert: outside
     pointer interaction remains available and closes the list before running the clicked action. */
  await searchable.click();
  await expect(page.getByRole("option", { name: "Design system" })).toBeVisible();
  await outsideButton.click();
  await expect(page.getByRole("option", { name: "Design system" })).toHaveCount(0);
  await expect(page.getByRole("menuitem", { name: "Plain action" })).toBeVisible();

  expect(errors).toEqual([]);
});

test("an open Combobox publishes its own listbox relationships", async ({ page, errors }) => {
  await page.goto("/verification/interactions");

  const searchable = page.getByRole("combobox", { name: "Combobox project" });
  await searchable.click();

  const listbox = page.getByRole("listbox");
  await expect(listbox).toBeVisible();

  await expect(page.getByRole("option", { name: "Design system" })).toHaveAttribute("aria-selected", "true");
  await expect(page.getByRole("option", { name: "Dashboard" })).toHaveAttribute("aria-selected", "false");

  await searchable.fill("dash");
  await page.keyboard.press("ArrowDown");
  const active = await searchable.getAttribute("aria-activedescendant");
  expect(active, "navigating the listbox must expose the active option on the input").toBeTruthy();
  await expect(page.locator(`[id="${active}"]`)).toHaveAttribute("data-highlighted", "");
  await expect(page.locator(`[id="${active}"]`)).toHaveText("Dashboard");

  expect(errors).toEqual([]);
});

test("icon-only controls expose accessible names", async ({ page, errors }) => {
  await page.goto("/verification/dialog");
  const closeButton = page.getByRole("button", { name: "Close dialog" });
  await expect(closeButton).toBeVisible();
  await expect(closeButton).toHaveAccessibleName("Close dialog");

  // The name cannot come from visible text: the control renders only an icon, and
  // that icon must stay hidden from assistive technology.
  expect((await closeButton.innerText()).trim()).toBe("");
  await expect(closeButton.locator("svg")).toHaveAttribute("aria-hidden", "true");

  expect(errors).toEqual([]);
});

test("loading Search reports aria-busy without losing its accessible name", async ({ page, errors }) => {
  await page.goto("/verification/interactions");
  const search = page.getByRole("textbox", { name: "Loading search" });

  await expect(search).toHaveAttribute("aria-busy", "true");
  await expect(search).toBeEnabled();
  await expect(search).toHaveAccessibleName("Loading search");
  await expect(page.getByRole("button", { name: "Submit search" })).toBeDisabled();

  // The loading indicator must not steal the control's accessible name, and its own
  // glyph must stay hidden from assistive technology.
  await expect(page.getByRole("status")).toBeVisible();
  await expect(page.getByRole("status").locator("svg")).toHaveAttribute("aria-hidden", "true");

  expect(errors).toEqual([]);
});

test("keyboard focus is visible on a core control", async ({ page, errors }) => {
  await page.goto("/verification/core");
  const primary = page.getByRole("button", { name: "Primary" });
  await expect(primary).toBeVisible();

  await primary.focus();
  const focus = await primary.evaluate((element) => {
    const style = getComputedStyle(element);
    return { outlineStyle: style.outlineStyle, outlineWidth: style.outlineWidth };
  });

  expect(focus.outlineStyle).not.toBe("none");
  expect(parseFloat(focus.outlineWidth)).toBeGreaterThanOrEqual(2);

  expect(errors).toEqual([]);
});
