import { expect, test, type Locator, type Page } from "./fixtures";

/* The overview options (`/verification/overview`): a flush, compact table of navigable rows in a card,
   subtle badges, filter chips with counts that scroll along one line, a combobox without its clear
   control, `sm` fields that share one height, and a bottom sheet's grab handle. Every claim is read
   from the rendered page — computed style and geometry — never from a class name. */

test.beforeEach(async ({ page }) => {
  await page.goto("/verification/overview");
  await expect(page.getByTestId("overview-table")).toBeVisible();
});

const style = (locator: Locator, property: string) =>
  locator.evaluate((element, name) => getComputedStyle(element).getPropertyValue(name), property);

/** A token as the browser resolves it, so a colour assertion reads the theme rather than a literal. */
const token = (page: Page, value: string) =>
  page.evaluate((colour) => {
    const probe = document.createElement("div");
    probe.style.color = colour;
    document.body.appendChild(probe);
    const resolved = getComputedStyle(probe).color;
    probe.remove();
    return resolved;
  }, value);

const box = async (locator: Locator) => {
  const rect = await locator.boundingBox();
  if (!rect) throw new Error("element has no box");
  return rect;
};

test("sm fields and a sm button share one height", async ({ page }) => {
  /* The field's own box — the element that carries the density's minimum height — or the button
     itself. A compact field is 40px, the height a `sm` button has. */
  const heights = await page.getByTestId("toolbar").locator(":scope > *").evaluateAll((items) =>
    items.map((item) => {
      const target = item.matches("button")
        ? item
        : [item, ...item.querySelectorAll("*")].find((element) => getComputedStyle(element).minHeight === "40px");
      return target ? Math.round(target.getBoundingClientRect().height) : 0;
    })
  );
  expect(heights).toEqual([40, 40, 40, 40, 40, 40]);

  /* The parts keep their 44px target: they overhang the compact field rather than shrink. */
  const trigger = page.getByRole("button", { name: "Show options" }).first();
  expect((await box(trigger)).height).toBe(44);
  const stepper = page.getByRole("button", { name: "Increase" });
  expect((await box(stepper)).height).toBe(44);
});

test("a combobox can leave out its clear control", async ({ page }) => {
  const scope = page.getByTestId("toolbar");
  await expect(scope.getByRole("combobox", { name: "Campaign scope" })).toHaveValue("All campaigns");
  await expect(scope.getByRole("button", { name: "Clear selection" })).toHaveCount(0);
  await expect(scope.getByRole("button", { name: "Show options" })).toHaveCount(1);

  /* The default still offers it. */
  await expect(page.getByTestId("clearable").getByRole("button", { name: "Clear selection" })).toHaveCount(1);
});

test("a flush table gives up its sheet and hangs its cell inset in a card", async ({ page }) => {
  const table = page.getByTestId("overview-table");
  expect(await style(table, "background-color")).toBe("rgba(0, 0, 0, 0)");
  expect(await style(table, "border-top-left-radius")).toBe("0px");
  expect(await style(table, "box-shadow")).toBe("none");

  /* The default table keeps its own quiet sheet and corner. */
  const sheet = page.getByTestId("default-table");
  expect(await style(sheet, "background-color")).not.toBe("rgba(0, 0, 0, 0)");
  expect(await style(sheet, "border-top-left-radius")).toBe("12px");

  /* The first column's text lines up with the card's content edge, and the rows reach 12px past it on
     both sides: the compact cell inset. */
  const card = page.getByTestId("overview-card");
  const cardBox = await box(card);
  const cardInset = Number.parseFloat(await style(card, "padding-left"));
  const contentStart = cardBox.x + cardInset;
  const contentEnd = cardBox.x + cardBox.width - cardInset;
  const tableBox = await box(table);
  expect(tableBox.x).toBeCloseTo(contentStart - 12, 0);
  expect(tableBox.x + tableBox.width).toBeCloseTo(contentEnd + 12, 0);

  const header = table.getByRole("columnheader", { name: "Participant" });
  const headerStart = (await box(header)).x + Number.parseFloat(await style(header, "padding-left"));
  expect(headerStart).toBeCloseTo(contentStart, 0);
});

test("a compact table has tighter rows and a quieter header", async ({ page }) => {
  const compact = page.getByTestId("overview-table");
  const normal = page.getByTestId("default-table");

  const compactHeader = compact.getByRole("columnheader", { name: "Participant" });
  const normalHeader = normal.getByRole("columnheader", { name: "Project" });
  expect(await style(compactHeader, "font-size")).toBe("12px");
  expect(await style(normalHeader, "font-size")).toBe("14px");
  expect(await style(compactHeader, "color")).toBe(await style(normalHeader, "color"));

  const compactCell = compact.getByRole("cell", { name: "Bullshark November Giveaway" }).first();
  const normalCell = normal.getByRole("cell", { name: "Ana" });
  expect(await style(compactCell, "padding-top")).toBe("10px");
  expect(await style(normalCell, "padding-top")).toBe("12px");
  expect((await box(compactHeader)).height).toBeLessThan((await box(normalHeader)).height);
});

test("a column aligned to the end aligns its header and its cells", async ({ page }) => {
  const table = page.getByTestId("overview-table");
  const header = table.getByRole("columnheader", { name: "Waiting" });
  const cell = table.getByRole("cell", { name: "4h 8m" });
  expect(await style(header, "text-align")).toBe("end");
  expect(await style(cell, "text-align")).toBe("end");

  /* The header label and the figure share the column's end edge. */
  const headerEnd = await header.evaluate((element) => {
    const range = document.createRange();
    range.selectNodeContents(element);
    return range.getBoundingClientRect().right;
  });
  const cellEnd = await cell.evaluate((element) => {
    const range = document.createRange();
    range.selectNodeContents(element);
    return range.getBoundingClientRect().right;
  });
  expect(headerEnd).toBeCloseTo(cellEnd, 0);

  expect(await style(table.getByRole("columnheader", { name: "Campaign" }), "text-align")).toBe("start");
});

test("an interactive table's rows answer the pointer, the keyboard and a press", async ({ page }) => {
  const table = page.getByTestId("overview-table");
  const row = table.getByRole("row").filter({ has: page.getByRole("link", { name: "Moniquee" }) });
  const resting = await style(row, "background-color");
  expect(await style(row, "cursor")).toBe("pointer");
  expect(await style(row, "border-top-left-radius")).toBe("0px");

  await page.getByRole("link", { name: "Moniquee" }).hover();
  await expect.poll(() => style(row, "background-color")).not.toBe(resting);
  const hovered = await style(row, "background-color");

  /* Keyboard focus inside the row holds the same tint as the pointer. */
  await page.mouse.move(0, 0);
  await expect.poll(() => style(row, "background-color")).toBe(resting);
  await page.getByRole("link", { name: "J.P." }).focus();
  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "Moniquee" })).toBeFocused();
  await expect.poll(() => style(row, "background-color")).toBe(hovered);

  /* A press anywhere in the row tints it, and opens what the row header's link names. */
  await page.mouse.move(0, 0);
  const campaign = row.getByRole("cell", { name: "Bullshark November Giveaway" });
  /* The row header's link covers the row, so the cell is under it: move by coordinates. */
  const cellBox = await box(campaign);
  await page.mouse.move(cellBox.x + cellBox.width / 2, cellBox.y + cellBox.height / 2);
  await page.mouse.down();
  await expect.poll(() => style(row, "background-color")).not.toBe(hovered);
  await page.mouse.up();
  await expect(page).toHaveURL(/#mq$/);

  /* A row with a tag is as tall as one without: the tag sits on the cell's own line. */
  const heights = await table.getByRole("row").evaluateAll((rows) => rows.slice(1).map((item) => Math.round(item.getBoundingClientRect().height)));
  expect(new Set(heights).size).toBe(1);

  /* A row of the default table is read rather than opened: no pointer cursor. */
  expect(await style(page.getByTestId("default-table").getByRole("row").nth(1), "cursor")).toBe("auto");
});

test("a subtle badge is a tinted tag in its role's tone", async ({ page }) => {
  const badges = page.getByTestId("subtle-badges");
  const warning = badges.getByText("warning", { exact: true }).locator("..");
  expect(await style(warning, "color")).toBe(await token(page, "oklch(var(--sui-warning))"));
  expect(await style(warning, "background-color")).toBe(await token(page, "oklch(var(--sui-warning-soft))"));
  expect(await style(warning, "font-weight")).toBe("500");
  expect(await style(warning, "font-size")).toBe("13px");
  expect(await style(warning, "border-top-left-radius")).toBe("6px");
  expect((await box(warning)).height).toBe(20);

  /* Every variant takes its own tone: the five tags are five different colours. */
  const colours = await badges.locator(":scope > span:not([data-testid])").evaluateAll((items) =>
    items.map((item) => getComputedStyle(item).color)
  );
  expect(new Set(colours).size).toBe(5);

  /* The default badge is unchanged: a full-ink capsule. */
  const standard = page.getByTestId("default-badge");
  expect(await style(standard, "border-top-left-radius")).toBe("9999px");
  expect(await style(standard, "color")).toBe(await token(page, "oklch(var(--sui-ink))"));
});

test("filter chips carry a count and scroll along one line", async ({ page }) => {
  const row = page.getByTestId("reason-chips");
  const all = row.getByRole("button", { name: "All 36" });
  const bet = row.getByRole("button", { name: "Bet amount unclear 19" });
  await expect(all).toHaveAttribute("aria-pressed", "true");
  await expect(bet).toHaveAttribute("aria-pressed", "false");

  /* The count keeps its chip's own ink, held or at rest. */
  const allCount = all.getByText("36", { exact: true });
  const betCount = bet.getByText("19", { exact: true });
  await expect.poll(() => style(allCount, "color")).toBe(await style(all, "color"));
  expect(await style(betCount, "color")).toBe(await style(bet, "color"));
  expect(await style(allCount, "font-variant-numeric")).toBe("tabular-nums");

  /* One line: every chip shares the first chip's top, and the row scrolls inside itself. */
  const tops = await row.getByRole("button").evaluateAll((chips) => chips.map((chip) => Math.round(chip.getBoundingClientRect().top)));
  expect(new Set(tops).size).toBe(1);
  const overflow = await row.evaluate((element) => element.scrollWidth - element.clientWidth);
  expect(overflow).toBeGreaterThan(0);

  /* The edge that has more chips behind it fades; the start edge does not, until the row is scrolled. */
  const clear = "rgba(0, 0, 0, 0)";
  await expect.poll(() => style(row, "mask-image")).toContain(`${clear} 100%`);
  expect(await style(row, "mask-image")).not.toContain(`${clear} 0px`);
  await row.evaluate((element) => element.scrollTo({ left: element.scrollWidth }));
  await expect.poll(() => style(row, "mask-image")).toContain(`${clear} 0px`);

  /* The arrow keys walk the row, and choosing a reason presses it. */
  await all.focus();
  await page.keyboard.press("ArrowRight");
  await expect(bet).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(bet).toHaveAttribute("aria-pressed", "true");
  await expect(all).toHaveAttribute("aria-pressed", "false");
});

test("a bottom sheet can carry a grab handle", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("button", { name: "Filters" }).click();
  const sheet = page.getByRole("dialog");
  await expect(sheet).toBeVisible();

  const handle = sheet.locator("[data-sui-sheet-handle]");
  await expect(handle).toHaveAttribute("aria-hidden", "true");
  const sheetBox = await box(sheet);
  const handleBox = await box(handle);
  expect(handleBox.width).toBe(40);
  expect(handleBox.height).toBe(4);
  expect(handleBox.x + handleBox.width / 2).toBeCloseTo(sheetBox.x + sheetBox.width / 2, 0);
  expect(handleBox.y - sheetBox.y).toBe(8);

  /* The chips wrap inside the sheet, each a tap of its own. */
  const chips = sheet.getByRole("button", { name: /\d$/ });
  const tops = await chips.evaluateAll((items) => items.map((item) => Math.round(item.getBoundingClientRect().top)));
  expect(new Set(tops).size).toBeGreaterThan(1);
});
