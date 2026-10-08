import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Locator, type Page } from "./fixtures";

const WCAG_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

const openFixture = async (page: Page) => {
  await page.goto("/verification/forms");
  await page.waitForFunction(() => document.documentElement.dataset.hydrated === "true");
};

const scan = async (page: Page) => {
  const results = await new AxeBuilder({ page })
    .options({ runOnly: { type: "tag", values: WCAG_TAGS }, rules: { "target-size": { enabled: true } } })
    .analyze();
  const summary = results.violations
    .map((violation) => `${violation.id}: ${violation.nodes.map((node) => node.target.join(" ")).join(", ")}`)
    .join("\n");
  expect(results.violations, summary).toEqual([]);
};

/** The composite field a combobox input sits in: the element that carries the rim. */
const fieldOf = (input: Locator) => input.locator("xpath=ancestor::div[contains(@class,'group/field')][1]");
const chipsOf = (input: Locator) => fieldOf(input).locator("[data-sui-value-chip]");
/** The visible report a creatable field makes beneath itself. */
const noticeOf = (input: Locator) => fieldOf(input).locator("xpath=following-sibling::div[@role='status'][1]");

test.beforeEach(async ({ page }) => {
  await openFixture(page);
});

test("grouped Select and Combobox name each group by its heading and drop empty groups while filtering", async ({
  page,
  errors,
}) => {
  await page.getByRole("combobox", { name: "Announcement channel" }).click();
  const listbox = page.getByRole("listbox");
  await expect(listbox.getByRole("group", { name: "Giveaways" }).getByRole("option")).toHaveText([
    "#giveaway",
    "#giveaway-winners",
  ]);
  await expect(listbox.getByRole("group", { name: "Community" }).getByRole("option")).toHaveCount(3);
  // An ungrouped channel stays where it stands, above the first heading, and a heading is not an option.
  await expect(listbox.getByRole("option").first()).toHaveText("#rules");
  await expect(listbox.getByRole("option", { name: "Giveaways" })).toHaveCount(0);
  await expect(listbox.getByRole("option", { name: "#giveaway", exact: true })).toHaveAttribute("aria-selected", "true");
  const heading = listbox.getByText("Giveaways", { exact: true });
  expect(await heading.evaluate((element) => getComputedStyle(element).fontSize)).toBe("12px");
  await page.keyboard.press("Escape");

  const channel = page.getByRole("combobox", { name: "Channel", exact: true });
  await channel.fill("gen");
  const filtered = page.getByRole("listbox");
  await expect(filtered.getByRole("group", { name: "Community" }).getByRole("option")).toHaveText(["#general"]);
  await expect(filtered.getByRole("group", { name: "Giveaways" })).toHaveCount(0);
  await filtered.getByRole("option", { name: "#general" }).click();
  await expect(channel).toHaveValue("#general");

  expect(errors).toEqual([]);
});

test("a multiple Combobox holds removable chips, stays open between picks and removes with the keyboard", async ({
  page,
  errors,
}) => {
  const roles = page.getByRole("combobox", { name: "Required roles" });
  const chips = chipsOf(roles);
  await expect(chips).toHaveText(["Admin", "Booster"]);
  await expect(fieldOf(roles).getByRole("toolbar", { name: "Selected" })).toBeVisible();

  await roles.click();
  await page.getByRole("option", { name: "Moderator" }).click();
  await expect(chips).toHaveText(["Admin", "Booster", "Moderator"]);
  // Choosing keeps the list open for the next choice.
  await expect(page.getByRole("listbox")).toBeVisible();
  await expect(page.getByRole("option", { name: "Moderator" })).toHaveAttribute("aria-selected", "true");
  await page.getByRole("option", { name: "Verified" }).click();
  await expect(chips).toHaveText(["Admin", "Booster", "Moderator", "Verified"]);
  await page.keyboard.press("Escape");

  // Backspace in an empty input removes the last chip.
  await roles.focus();
  await page.keyboard.press("Backspace");
  await expect(chips).toHaveText(["Admin", "Booster", "Moderator"]);

  // The arrow keys walk into the chips, which wear the inset ring; Delete removes the focused one.
  await page.keyboard.press("ArrowLeft");
  const focused = chips.last();
  await expect(focused).toBeFocused();
  const ring = await focused.evaluate((element) => ({
    visible: element.matches(":focus-visible"),
    shadow: getComputedStyle(element).boxShadow,
  }));
  expect(ring.visible).toBe(true);
  expect(ring.shadow).toContain("inset");
  await page.keyboard.press("Delete");
  await expect(chips).toHaveText(["Admin", "Booster"]);

  // A chip's own dismiss target removes it and leaves focus in the field.
  await fieldOf(roles).getByRole("button", { name: "Remove Booster" }).click();
  await expect(chips).toHaveText(["Admin"]);
  await expect(roles).toBeFocused();
  const target = await fieldOf(roles).getByRole("button", { name: "Remove Admin" }).boundingBox();
  expect(target!.width).toBeGreaterThanOrEqual(24);
  expect(target!.height).toBeGreaterThanOrEqual(24);

  // A read-only selection shows its chips without dismiss targets.
  const readOnly = page.getByRole("combobox", { name: "Read-only roles" });
  await expect(chipsOf(readOnly)).toHaveText(["Admin", "Moderator"]);
  await expect(fieldOf(readOnly).getByRole("button", { name: /^Remove/ })).toHaveCount(0);

  expect(errors).toEqual([]);
});

test("a creatable Combobox adds typed and pasted entries and reports duplicates instead of doubling them", async ({
  page,
  context,
  errors,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  const games = page.getByRole("combobox", { name: "Allowed games" });
  const chips = chipsOf(games);
  await expect(chips).toHaveText(["Book of Dead"]);

  // The "Add" row leads the list, so Enter adds exactly what was typed.
  await games.click();
  await games.pressSequentially("Starburst");
  await expect(page.getByRole("option").first()).toHaveText("Add “Starburst”");
  await page.keyboard.press("Enter");
  await expect(chips).toHaveText(["Book of Dead", "Starburst"]);

  // Naming an entry that is already chosen is refused and reported, not treated as a removal.
  await games.pressSequentially("book of dead");
  await expect(page.getByRole("option", { name: /^Add/ })).toHaveCount(0);
  await page.keyboard.press("Enter");
  await expect(chips).toHaveText(["Book of Dead", "Starburst"]);
  await expect(noticeOf(games)).toHaveText("Skipped 1 duplicate: book of dead.");
  // While the list is open, the report is made from inside it, where assistive technology can hear it.
  await expect(
    page.getByRole("listbox").locator("xpath=..").getByRole("status").filter({ hasText: "Skipped 1 duplicate" })
  ).toHaveCount(1);
  await page.keyboard.press("Escape");
  await games.fill("");

  // Several lines pasted at once become one entry each; catalog titles take their option, duplicates are skipped.
  await page.evaluate(() =>
    navigator.clipboard.writeText("Starburst\r\nGates of Olympus\n\n  Reactoonz  \nreactoonz\nBook of Dead")
  );
  await games.focus();
  await page.keyboard.press("ControlOrMeta+V");
  await expect(chips).toHaveText(["Book of Dead", "Starburst", "Gates of Olympus", "Reactoonz"]);
  await expect(games).toHaveValue("");
  await expect(noticeOf(games)).toContainText("Skipped 3 duplicates: Starburst, reactoonz, Book of Dead.");
  // Screen readers also hear what was added; sighted readers see it as chips.
  await expect(noticeOf(games).locator(".sr-only")).toHaveText(
    "Added 2 entries. Skipped 3 duplicates: Starburst, reactoonz, Book of Dead."
  );

  // Typing again clears the report.
  await games.pressSequentially("x");
  await expect(noticeOf(games)).toHaveText("");
  await page.keyboard.press("Escape");

  // An uncontrolled creatable field keeps its own entries.
  const tags = page.getByRole("combobox", { name: "Uncontrolled tags" });
  await tags.click();
  await tags.pressSequentially("beta");
  await page.keyboard.press("Enter");
  await expect(chipsOf(tags)).toHaveText(["alpha", "beta"]);

  expect(errors).toEqual([]);
});

test("NumberField units hug the centred value, stay out of the accessible name and hand presses to the input", async ({
  page,
  errors,
}) => {
  const multiplier = page.getByRole("textbox", { name: "Ticket multiplier (×)" });
  const price = page.getByRole("textbox", { name: "Price per ticket (€)" });
  await expect(multiplier).toHaveValue("15");
  await expect(price).toHaveValue("0.10");

  const geometry = await multiplier.evaluate((input) => {
    const band = input.closest("div")!;
    const suffix = band.querySelector('[aria-hidden="true"]:last-child') as HTMLElement;
    const group = band.parentElement!;
    const inputBox = input.getBoundingClientRect();
    const suffixBox = suffix.getBoundingClientRect();
    const groupBox = group.getBoundingClientRect();
    return {
      gap: suffixBox.left - inputBox.right,
      clusterCentre: (inputBox.left + suffixBox.right) / 2,
      groupCentre: (groupBox.left + groupBox.right) / 2,
      inputWidth: inputBox.width,
    };
  });
  expect(geometry.gap).toBeGreaterThanOrEqual(0);
  expect(geometry.gap).toBeLessThanOrEqual(8);
  expect(Math.abs(geometry.clusterCentre - geometry.groupCentre)).toBeLessThanOrEqual(2);
  expect(geometry.inputWidth).toBeLessThan(40);

  // The unit is presentation: hidden from the accessibility tree, and a press on it places the caret.
  await page.getByText("× tickets").click();
  await expect(page.getByRole("textbox", { name: "Bonus tickets" })).toBeFocused();
  await page.getByRole("button", { name: "Increase" }).nth(2).click();
  await expect(page.getByRole("textbox", { name: "Bonus tickets" })).toHaveValue("3");

  // Typing grows the sized value rather than clipping it.
  await multiplier.fill("123456");
  const grown = await multiplier.evaluate((input) => input.getBoundingClientRect().width);
  expect(grown).toBeGreaterThan(geometry.inputWidth);
  expect(await multiplier.evaluate((input) => input.scrollWidth <= input.clientWidth + 1)).toBe(true);

  // A text field's affixes behave the same way.
  await page.getByText(".discord.gg").click();
  await expect(page.getByRole("textbox", { name: "Invite link" })).toBeFocused();

  expect(errors).toEqual([]);
});

test("Form focuses the first invalid field, shows errors where they are and accepts a server errors map", async ({
  page,
  errors,
}) => {
  const title = page.getByRole("textbox", { name: "Rule title" });
  const save = page.getByRole("button", { name: "Save rule" });

  // Nothing filled in: the submission stays, and focus moves to the first invalid field.
  await save.click();
  await expect(title).toBeFocused();
  await expect(title).toHaveAttribute("aria-invalid", "true");
  const danger = await page.getByText("Enter an amount.").evaluate((element) => getComputedStyle(element).color);
  await expect(title).toHaveCSS("border-top-color", danger);
  const casinos = page.getByRole("group", { name: "Casinos" });
  await expect(page.getByText("Choose at least one option.")).toBeVisible();
  await expect(page.getByTestId("form-submitted")).toHaveText("Not submitted");

  // The next invalid field in document order takes focus once the first is fixed.
  await title.fill("Taken");
  await save.click();
  await expect(casinos.getByRole("checkbox").first()).toBeFocused();

  // A server's errors map is shown under its field, focuses it, and clears as soon as it is edited.
  await casinos.getByRole("checkbox", { name: "Harbor Slots" }).click();
  await save.click();
  const serverError = page.getByText("A rule with this title already exists.");
  await expect(serverError).toBeVisible();
  await expect(title).toBeFocused();
  await expect(title).toHaveAccessibleDescription(/A rule with this title already exists/);
  await title.fill("Weekend boost");
  await expect(serverError).toHaveCount(0);

  await save.click();
  const submitted = JSON.parse(await page.getByTestId("form-submitted").innerText());
  expect(submitted).toMatchObject({
    title: "Weekend boost",
    roles: ["role-admin", "role-booster"],
    channel: "giveaway",
    multiplier: 15,
    price: 0.1,
    bonus: 2,
    casinos: ["harbor"],
    accept: ["bonus-buy"],
    games: ["book-of-dead"],
  });

  expect(errors).toEqual([]);
});

test("CheckboxGroup names each choice by its label, describes it by its supporting line and selects from the whole card", async ({
  page,
  errors,
}) => {
  const casinos = page.getByRole("group", { name: "Casinos" });
  await expect(casinos).toHaveAccessibleDescription("The rule applies on every domain of a ticked casino.");
  const aurora = casinos.getByRole("checkbox", { name: "Aurora Casino", exact: true });
  await expect(aurora).toHaveAccessibleDescription(/aurora\.example, aurora-play\.example/);
  await expect(casinos.getByRole("checkbox", { name: "North Star" })).toBeDisabled();

  // A press on the supporting line, far from the mark, still ticks the card.
  const card = aurora.locator("xpath=ancestor::label[1]/..");
  await card.getByText("aurora.example, aurora-play.example").click();
  await expect(aurora).toBeChecked();
  const surface = await card.evaluate((element) => {
    const style = getComputedStyle(element);
    return { background: style.backgroundColor, shadow: style.boxShadow };
  });
  expect(surface.shadow).not.toBe("none");

  // Space toggles a focused choice, and Tab moves through each checkbox in turn.
  const accept = page.getByRole("group", { name: "Also accept" });
  await accept.getByRole("checkbox", { name: "Free spins" }).focus();
  await page.keyboard.press("Space");
  await expect(accept.getByRole("checkbox", { name: "Free spins" })).toBeChecked();
  await expect(accept.getByRole("checkbox", { name: "Bonus buys" })).toBeChecked();

  // A described radio follows the same naming.
  const draw = page.getByRole("radiogroup", { name: "Draw" });
  await expect(draw.getByRole("radio", { name: "Daily", exact: true })).toHaveAccessibleDescription("Draws at midnight UTC.");

  expect(errors).toEqual([]);
});

test("chips wrap inside a narrow field and RTL mirrors chips, units and the trailing cluster", async ({ page, errors }) => {
  const narrow = page.getByTestId("narrow-forms");
  const narrowField = fieldOf(page.getByRole("combobox", { name: "Narrow roles" }));
  const [wrapper, field] = await Promise.all([narrow.boundingBox(), narrowField.boundingBox()]);
  expect(field!.x + field!.width).toBeLessThanOrEqual(wrapper!.x + wrapper!.width + 0.5);
  expect(field!.height).toBeGreaterThan(48);
  const chipBoxes = await chipsOf(page.getByRole("combobox", { name: "Narrow roles" })).evaluateAll((chips) =>
    chips.map((chip) => chip.getBoundingClientRect().right)
  );
  for (const right of chipBoxes) expect(right).toBeLessThanOrEqual(field!.x + field!.width);

  const rtl = page.getByRole("combobox", { name: "RTL roles" });
  const [firstChip, trigger] = await Promise.all([
    chipsOf(rtl).first().boundingBox(),
    fieldOf(rtl).locator('button[aria-label="Show options"]').boundingBox(),
  ]);
  expect(firstChip!.x).toBeGreaterThan(trigger!.x);

  const rtlPrice = page.getByRole("textbox", { name: "RTL price (€)" });
  const [priceBox, euroBox] = await Promise.all([rtlPrice.boundingBox(), page.getByText("€").last().boundingBox()]);
  expect(euroBox!.x).toBeGreaterThan(priceBox!.x);

  expect(errors).toEqual([]);
});

for (const theme of ["light", "dark"] as const) {
  test(`the forms fixture passes the WCAG scan in the ${theme} theme, with a multiple list open`, async ({ page, errors }) => {
    // The page loads already in its theme, as the accessibility suite does, so no colour is read stale.
    await page.emulateMedia({ colorScheme: theme });
    await openFixture(page);
    await page.getByRole("radio", { name: "Daily", exact: true }).click();
    await page.getByRole("checkbox", { name: "Aurora Casino", exact: true }).click();
    await scan(page);
    await page.getByRole("combobox", { name: "Required roles" }).click();
    await expect(page.getByRole("listbox")).toBeVisible();
    await scan(page);
    expect(errors).toEqual([]);
  });
}

