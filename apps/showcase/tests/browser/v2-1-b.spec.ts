import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Locator, type Page } from "./fixtures";

/* WCAG A/AA plus the WCAG 2.2 target-size rule, enabled explicitly for the same reason
   `accessibility.spec.ts` enables it: Axe 4.13 still ships it disabled by default. */
const WCAG_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

const openFixture = async (page: Page, colorScheme: "light" | "dark" = "light") => {
  await page.emulateMedia({ colorScheme });
  await page.goto("/verification/v2-1-b");
  await expect(page.getByRole("heading", { name: "Command verification" })).toBeVisible();
  /* Base wires every relationship that a scan reads — the active descendant, the listbox
     ownership, the dialog's description — on the client, so the wait is for hydration and not
     for any one attribute. */
  await page.waitForFunction(() => document.documentElement.dataset.hydrated === "true");
};

const expectNoA11yViolations = async (page: Page) => {
  const results = await new AxeBuilder({ page })
    .options({
      runOnly: { type: "tag", values: WCAG_TAGS },
      rules: { "target-size": { enabled: true } },
    })
    .analyze();
  const summary = results.violations
    .map(
      (violation) =>
        `${violation.id} [${violation.nodes.map((node) => node.target.join(" ")).join(", ")}]`
    )
    .join("\n");

  expect(results.violations, `axe violations:\n${summary}`).toEqual([]);
};

const band = (page: Page, name: string) => page.locator(`[data-band="${name}"]`);
const field = (page: Page, name: string) => page.getByRole("combobox", { name });

test.describe("Command", () => {
  test("names its field natively and keeps a grouped, inline listbox on screen", async ({ page, errors }) => {
    await openFixture(page);

    const search = field(page, "Search commands");
    expect(await search.evaluate((element) => element.tagName)).toBe("INPUT");
    await expect(search).toHaveAccessibleName("Search commands");
    await expect(search).toHaveAttribute("aria-haspopup", "listbox");
    await expect(search).toHaveAttribute("aria-autocomplete", "list");
    await expect(search).toHaveAttribute("aria-expanded", "true");

    const standalone = band(page, "Standalone");
    await expect(standalone.getByRole("listbox")).toHaveCount(1);
    await expect(standalone.getByRole("option")).toHaveCount(7);
    /* The data declares its structure: two named groups, and the ungrouped command keeps a
       group of its own rather than being dropped from a grouped list. */
    await expect(standalone.getByRole("group", { name: "Navigation" }).getByRole("option")).toHaveCount(2);
    await expect(standalone.getByRole("group", { name: "Appearance" }).getByRole("option")).toHaveCount(4);
    await expect(standalone.getByRole("option", { name: "Create a quick note" })).toBeVisible();
    await expect(standalone.getByRole("option", { name: "Delete workspace" })).toHaveAttribute("aria-disabled", "true");

    expect(errors).toEqual([]);
  });

  test("filters against the query and the command's own keywords", async ({ page, errors }) => {
    await openFixture(page);

    const standalone = band(page, "Standalone");
    const search = field(page, "Search commands");
    const options = standalone.getByRole("option");

    await search.fill("workspace");
    await expect(options).toHaveCount(2);
    await expect(options.first()).toHaveText(/Go to workspace/);

    await search.fill("switch");
    await expect(options).toHaveCount(2);
    await expect(standalone.getByRole("group", { name: "Navigation" })).toHaveCount(0);

    await search.fill("night");
    await expect(options).toHaveCount(1);
    await expect(options.first()).toHaveText(/Switch to dark theme/);

    await search.fill("zzzz");
    await expect(options).toHaveCount(0);
    await expect(standalone.getByText("No commands found.")).toBeVisible();

    await search.fill("");
    await expect(options).toHaveCount(7);

    expect(errors).toEqual([]);
  });

  test("runs a command once, keeping the query, the list and the field's focus", async ({ page, errors }) => {
    await openFixture(page);

    const standalone = band(page, "Standalone");
    const search = field(page, "Search commands");

    await search.fill("switch");
    await standalone.getByRole("option", { name: "Switch to dark theme" }).click();

    await expect(page.getByTestId("command-action")).toHaveText("dark");
    await expect(page.getByTestId("command-actions")).toHaveText("1");
    /* A command performs an action rather than choosing a value: the query it was found by and
       the list it was found in stay exactly as they were, and a second command can run. */
    await expect(search).toHaveValue("switch");
    await expect(standalone.getByRole("option")).toHaveCount(2);
    await expect(search).toBeFocused();

    await standalone.getByRole("option", { name: "Switch to light theme" }).click();
    await expect(page.getByTestId("command-action")).toHaveText("light");
    await expect(page.getByTestId("command-actions")).toHaveText("2");

    expect(errors).toEqual([]);
  });

  test("runs the highlighted command with Enter and keeps the highlight reachable", async ({ page, errors }) => {
    await openFixture(page);

    const standalone = band(page, "Standalone");
    const search = field(page, "Search commands");

    await search.fill("switch");
    const active = await search.getAttribute("aria-activedescendant");
    expect(active, "the highlighted command is published on the field").toBeTruthy();
    await expect(page.locator(`[id="${active}"]`)).toHaveAttribute("data-highlighted", "");
    await expect(page.locator(`[id="${active}"]`)).toHaveText(/Switch to dark theme/);

    await page.keyboard.press("Enter");
    await expect(page.getByTestId("command-action")).toHaveText("dark");
    await expect(page.getByTestId("command-actions")).toHaveText("1");
    await expect(search).toHaveValue("switch");
    await expect(search).toBeFocused();

    await page.keyboard.press("ArrowDown");
    const moved = await search.getAttribute("aria-activedescendant");
    expect(moved).not.toBe(active);
    await page.keyboard.press("Enter");
    await expect(page.getByTestId("command-action")).toHaveText("light");
    await expect(page.getByTestId("command-actions")).toHaveText("2");

    expect(errors).toEqual([]);
  });

  test("discovers a disabled command without letting it activate", async ({ page, errors }) => {
    await openFixture(page);

    const standalone = band(page, "Standalone");
    const disabled = standalone.getByRole("option", { name: "Delete workspace" });

    await expect(disabled).toHaveAttribute("aria-disabled", "true");
    await disabled.click({ force: true });
    await expect(page.getByTestId("command-actions")).toHaveText("0");

    await field(page, "Search commands").fill("delete");
    /* A disabled command stays reachable by the keyboard — it can be found and announced as
       unavailable — and Enter on it still performs nothing. */
    const active = await field(page, "Search commands").getAttribute("aria-activedescendant");
    await expect(page.locator(`[id="${active}"]`)).toHaveText(/Delete workspace/);
    await expect(page.locator(`[id="${active}"]`)).toHaveAttribute("data-highlighted", "");
    await page.keyboard.press("Enter");
    await expect(page.getByTestId("command-actions")).toHaveText("0");
    await expect(page.getByTestId("command-action")).toHaveText("none");

    expect(errors).toEqual([]);
  });

  test("never submits the form it sits in and stays usable after Escape", async ({ page, errors }) => {
    await openFixture(page);

    const standalone = band(page, "Standalone");
    const search = field(page, "Search commands");

    await search.fill("switch");
    await page.keyboard.press("Enter");
    await expect(page.getByTestId("command-action")).toHaveText("dark");
    await expect(page.getByTestId("command-submitted"), "a command never submits its form").toHaveText("0");

    await page.keyboard.press("Escape");
    await expect(standalone.getByRole("option"), "an inline list has nothing to dismiss").toHaveCount(2);
    await expect(search).toHaveValue("switch");
    await expect(search).toBeFocused();

    expect(errors).toEqual([]);
  });

  test("matches by the caller's own filter, or by nothing at all", async ({ page, errors }) => {
    await openFixture(page);

    const custom = band(page, "Custom filter").getByRole("combobox", { name: "Commands matched by their value" });
    const customOptions = band(page, "Custom filter").getByRole("option");

    await custom.fill("de");
    await expect(customOptions).toHaveCount(1);
    await expect(customOptions.first()).toHaveText(/Delete workspace/);

    /* The caller's rule replaced the default label matching: "Open settings" matches on its label
       but not on its value. */
    await custom.fill("Open");
    await expect(customOptions).toHaveCount(0);

    const unfiltered = band(page, "No filter").getByRole("combobox", { name: "Commands with no filter" });
    await unfiltered.fill("zzzz");
    await expect(band(page, "No filter").getByRole("option")).toHaveCount(7);

    expect(errors).toEqual([]);
  });

  test("honours the caller's id, root classes, input classes and row content", async ({ page, errors }) => {
    await openFixture(page);

    const narrow = page.getByTestId("command-narrow");
    const input = narrow.getByRole("combobox", { name: "Commands in a narrow column" });

    await expect(input).toHaveAttribute("id", "narrow-command-input");
    await expect(input).toHaveCSS("font-size", "14px");
    await expect(narrow.locator(":scope > div")).toHaveCSS("row-gap", "16px");
    await expect(
      narrow.getByRole("option", { name: "Open settings" }).locator('[data-custom-row="settings"]')
    ).toHaveText("Open settings");

    expect(errors).toEqual([]);
  });

  test("dims a disabled control once and leaves it inert", async ({ page, errors }) => {
    await openFixture(page);

    const disabledBand = band(page, "Disabled");
    const search = field(page, "Search disabled commands");
    await expect(search).toBeDisabled();

    const opacity = await disabledBand
      .getByRole("option")
      .first()
      .evaluate((element) => {
        let dimmedAncestors = 0;
        let node = element.parentElement;
        while (node) {
          if (parseFloat(getComputedStyle(node).opacity) < 1) dimmedAncestors += 1;
          node = node.parentElement;
        }
        return { own: parseFloat(getComputedStyle(element).opacity), dimmedAncestors };
      });
    expect(opacity.own).toBeCloseTo(0.45, 2);
    expect(opacity.dimmedAncestors, "a disabled subtree dims once").toBe(0);

    await search.click({ force: true });
    await page.keyboard.press("ArrowDown");
    expect(await search.getAttribute("aria-activedescendant")).toBeFalsy();

    expect(errors).toEqual([]);
  });

  test("keeps a controlled query the consumer's own", async ({ page, errors }) => {
    await openFixture(page);

    const controlled = band(page, "Controlled query");
    const search = field(page, "Controlled query");

    await expect(page.getByTestId("command-query")).toHaveText("initial");
    await search.fill("switch");
    await expect(page.getByTestId("command-query")).toHaveText("switch");

    await controlled.getByRole("option", { name: "Switch to dark theme" }).click();
    await expect(search).toHaveValue("switch");
    await expect(page.getByTestId("command-query")).toHaveText("switch");

    expect(errors).toEqual([]);
  });

  test("scrolls a long list inside itself and never widens a narrow column", async ({ page, errors }) => {
    await openFixture(page);

    const sheet = band(page, "Standalone").getByRole("listbox").locator("xpath=..");
    const geometry = await sheet.evaluate((element) => ({
      overflowY: getComputedStyle(element).overflowY,
      maxHeight: getComputedStyle(element).maxHeight,
      clientHeight: element.clientHeight,
      scrollHeight: element.scrollHeight,
    }));
    expect(geometry.overflowY).toBe("auto");
    expect(geometry.maxHeight).not.toBe("none");
    expect(geometry.scrollHeight).toBeGreaterThanOrEqual(geometry.clientHeight);

    const narrow = page.getByTestId("command-narrow");
    const narrowBox = await narrow.evaluate((element) => ({
      width: element.getBoundingClientRect().width,
      scrollWidth: element.scrollWidth,
    }));
    expect(narrowBox.width).toBeLessThanOrEqual(241);
    expect(narrowBox.scrollWidth, "long content yields inside the column").toBeLessThanOrEqual(241);

    const pageOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth
    );
    expect(pageOverflow).toBeLessThanOrEqual(1);

    expect(errors).toEqual([]);
  });

  test("mirrors in a right-to-left page", async ({ page, errors }) => {
    await openFixture(page);

    const rtl = page.getByTestId("command-rtl");
    /* The command that carries both a leading mark and a trailing shortcut: which side of the row
       each one lands on is the whole question. */
    const row = rtl.getByRole("option", { name: /Switch to dark theme/ });
    const layout = await row.evaluate((element) => {
      const spans = [...element.querySelectorAll("span")];
      const mark = element.querySelector('[aria-hidden="true"]')!;
      const label = spans.find((span) => span.textContent?.startsWith("Switch to dark theme"))!;
      const shortcut = spans.find((span) => span.textContent === "\u2318D")!;
      return {
        direction: getComputedStyle(element).direction,
        mark: mark.getBoundingClientRect(),
        label: label.getBoundingClientRect(),
        shortcut: shortcut.getBoundingClientRect(),
      };
    });

    expect(layout.direction).toBe("rtl");
    expect(layout.mark.left, "the leading mark leads the row").toBeGreaterThan(layout.label.left);
    expect(layout.shortcut.right, "the shortcut sits at the row's inline end").toBeLessThanOrEqual(layout.label.left);

    expect(errors).toEqual([]);
  });

  test("has no accessibility violations", async ({ page, errors }) => {
    await openFixture(page);
    await expectNoA11yViolations(page);

    expect(errors).toEqual([]);
  });
});

test.describe("CommandPalette", () => {
  const paletteField = (page: Page) => field(page, "Search palette commands");

  test("opens as a dialog that focuses its search field and dismisses on the first Escape", async ({ page, errors }) => {
    await openFixture(page);

    const trigger = page.getByRole("button", { name: "Open command palette" });
    await trigger.click();

    const dialog = page.getByRole("dialog", { name: "Command palette" });
    await expect(dialog).toBeVisible();
    await expect(dialog).toHaveAccessibleName("Command palette");
    await expect(dialog).toHaveAttribute("aria-describedby", /.+/);
    await expect(page.getByTestId("palette-state")).toHaveText("open");
    await expect(dialog.getByRole("button", { name: "Close command palette" })).toBeVisible();
    await expect(paletteField(page)).toBeFocused();
    await expect(dialog.getByRole("listbox")).toHaveCount(1);
    expect(await dialog.evaluate((element) => element.closest("main") === null)).toBe(true);

    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await expect(page.getByTestId("palette-state")).toHaveText("closed");
    await expect(trigger).toBeFocused();

    expect(errors).toEqual([]);
  });

  test("runs a command, dismisses itself and resets an uncontrolled query", async ({ page, errors }) => {
    await openFixture(page);

    const trigger = page.getByRole("button", { name: "Open command palette" });
    await trigger.click();

    const dialog = page.getByRole("dialog", { name: "Command palette" });
    const search = paletteField(page);
    await search.fill("switch");
    await dialog.getByRole("option", { name: "Switch to dark theme" }).click();

    await expect(page.getByRole("dialog")).toHaveCount(0);
    await expect(page.getByTestId("command-action")).toHaveText("dark");
    await expect(trigger).toBeFocused();

    await trigger.click();
    await expect(paletteField(page)).toHaveValue("");

    expect(errors).toEqual([]);
  });

  test("reports a controlled palette's own open state", async ({ page, errors }) => {
    await openFixture(page);

    const trigger = page.getByRole("button", { name: "Open controlled palette" });
    await trigger.click();

    await expect(page.getByRole("dialog", { name: "Controlled command palette" })).toBeVisible();
    await expect(page.getByTestId("controlled-palette-state")).toHaveText("open");

    await page.keyboard.press("Escape");
    await expect(page.getByTestId("controlled-palette-state")).toHaveText("closed");
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await expect(trigger).toBeFocused();

    expect(errors).toEqual([]);
  });

  test("has no accessibility violations while open", async ({ page, errors }) => {
    await openFixture(page);

    await page.getByRole("button", { name: "Open command palette" }).click();
    await expect(page.getByRole("dialog", { name: "Command palette" })).toBeVisible();
    await expectNoA11yViolations(page);

    expect(errors).toEqual([]);
  });

  test("has no accessibility violations in the dark theme", async ({ page, errors }) => {
    await openFixture(page, "dark");
    await page.getByRole("button", { name: "Open command palette" }).click();
    await expect(page.getByRole("dialog", { name: "Command palette" })).toBeVisible();
    await expectNoA11yViolations(page);

    expect(errors).toEqual([]);
  });
});
