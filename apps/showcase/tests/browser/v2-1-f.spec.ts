import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Locator, type Page } from "./fixtures";

/* Unit F — TreeView.
   Base UI ships no tree primitive, so this component owns its own APG mechanics: one roving tab
   stop over the visible order, `aria-expanded` only on branches, a selection that is independent
   of focus, and a focus contract that repairs the tree's own keyboard position when a node leaves
   it. These tests drive the rendered fixture through the keyboard the way a reader would and
   assert what assistive technology and the eye can both see — roles, names, states, focus and
   geometry — rather than class names. */

const WCAG_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

const projects = (page: Page) => page.getByTestId("tree-projects");
const tree = (page: Page, testId: string) => page.getByTestId(testId);

const item = (scope: Locator, name: string) => scope.getByRole("treeitem", { name, exact: true });

/* The row a node draws: the box its tone, its state layer and its focus ring are painted on. */
const rowBox = (scope: Locator, name: string) => item(scope, name).locator("> div").first();

const focusedName = (page: Page) =>
  page.evaluate(() => {
    const element = document.activeElement;
    if (!element) return null;
    return element.getAttribute("aria-label") ?? element.textContent?.trim() ?? null;
  });

const tabStops = (scope: Locator) => scope.locator('[role="treeitem"][tabindex="0"]').count();

/* A ring is painted when the row actually carries one: the recipes suppress the user agent's
   outline, so an outline style on its own proves nothing and the inset form paints through the
   row's own box-shadow. */
const ring = (locator: Locator) =>
  locator.evaluate((element) => {
    const style = getComputedStyle(element);
    const layers = style.boxShadow.split(/,\s*(?![^()]*\))/);
    const spread = (layer: string) => {
      const widths = [...layer.matchAll(/(-?[\d.]+)px/g)].map((match) =>
        Number.parseFloat(match[1])
      );
      return widths.length === 4 ? widths[3] : 0;
    };
    const inset = layers.filter((layer) => /inset/.test(layer) && spread(layer) > 0);
    return { painted: inset.length > 0, shadow: inset.join(" | ") };
  });

test.beforeEach(async ({ page }) => {
  await page.goto("/verification/v2-1-f");
  await page.waitForFunction(() => document.documentElement.dataset.hydrated === "true");
});

test("a tree is one named structure, and a branch is the only node that says it opens", async ({
  page,
  errors,
}) => {
  const scope = projects(page);
  await expect(page.getByRole("tree", { name: "Project files" })).toHaveCount(1);
  await expect(scope.locator('[role="treeitem"]')).toHaveCount(9);

  await expect(item(scope, "src")).toHaveAttribute("aria-expanded", "true");
  await expect(item(scope, "utils")).toHaveAttribute("aria-expanded", "false");
  /* A leaf opens nothing, so it says nothing: `aria-expanded` is a branch's own fact. */
  await expect(item(scope, "README.md")).not.toHaveAttribute("aria-expanded");

  /* The group a branch opens is nested inside it, so the structure a reader hears is the
     structure the tree renders. */
  await expect(item(scope, "src").locator('> [role="group"]')).toHaveCount(1);
  await expect(item(scope, "utils").locator('[role="group"]')).toHaveCount(0);

  /* A node is named by its own label. The group is a child of the item, so a name computed from
     contents would read the whole branch as its own name; an explicit name is what prevents it. */
  await expect(item(scope, "src")).toHaveAccessibleName("src");
  await expect(item(scope, "Select.tsx")).toHaveAccessibleName("Select.tsx");
  await expect(
    page.getByRole("treeitem", { name: "src components Button.tsx Select.tsx" })
  ).toHaveCount(0);

  expect(errors).toEqual([]);
});

test("the tree holds one tab stop, and it starts on the selected node", async ({ page, errors }) => {
  const scope = projects(page);
  const selected = item(scope, "Button.tsx");

  await expect(selected).toHaveAttribute("aria-selected", "true");
  await expect(selected).toHaveAttribute("tabindex", "0");
  expect(await tabStops(scope)).toBe(1);

  /* The stop is the tree's only way in from the rest of the page. */
  await page.keyboard.press("Tab");
  expect(await focusedName(page)).toBe("Button.tsx");

  /* And it follows the keyboard: the roving stop is the node the user is on, not a fixed one. */
  await page.keyboard.press("ArrowDown");
  expect(await focusedName(page)).toBe("Select.tsx");
  expect(await tabStops(scope)).toBe(1);
  await expect(item(scope, "Select.tsx")).toHaveAttribute("tabindex", "0");

  expect(errors).toEqual([]);
});

test("arrow keys walk the visible order, and Home and End reach its ends", async ({ page, errors }) => {
  const scope = projects(page);
  await item(scope, "Button.tsx").focus();

  const press = async (key: string, expected: string) => {
    await page.keyboard.press(key);
    expect(await focusedName(page), key).toBe(expected);
  };

  await press("ArrowDown", "Select.tsx");
  await press("ArrowDown", "utils");
  await press("ArrowDown", "README.md");
  await press("ArrowUp", "utils");
  await press("Home", "src");
  await press("End", "Draft");

  /* A node that cannot be used is still reachable: navigation passes it and lands on it, so it can
     be discovered and announced as unavailable. */
  await item(scope, "README.md").focus();
  await press("ArrowDown", "Archive");
  await expect(item(scope, "Archive")).toHaveAttribute("aria-disabled", "true");
  await press("ArrowDown", "notes.md");

  expect(errors).toEqual([]);
});

test("forward opens a branch and stays, backward reaches the parent and closes it", async ({
  page,
  errors,
}) => {
  const scope = projects(page);
  const utils = item(scope, "utils");

  await utils.focus();
  await page.keyboard.press("ArrowRight");
  /* Opening is the branch's own change: the node is opened where it stands. */
  expect(await focusedName(page)).toBe("utils");
  await expect(utils).toHaveAttribute("aria-expanded", "true");
  await expect(utils.locator('> [role="group"]')).toHaveCount(1);

  await page.keyboard.press("ArrowRight");
  expect(await focusedName(page)).toBe("cn.ts");

  await page.keyboard.press("ArrowLeft");
  expect(await focusedName(page)).toBe("utils");
  await page.keyboard.press("ArrowLeft");
  expect(await focusedName(page)).toBe("utils");
  await expect(utils).toHaveAttribute("aria-expanded", "false");
  await page.keyboard.press("ArrowLeft");
  expect(await focusedName(page)).toBe("src");

  expect(errors).toEqual([]);
});

test("Enter and Space choose, and moving the keyboard never does", async ({ page, errors }) => {
  const scope = projects(page);
  await item(scope, "README.md").focus();

  await page.keyboard.press("Enter");
  expect(await focusedName(page)).toBe("README.md");
  await expect(item(scope, "README.md")).toHaveAttribute("aria-selected", "true");
  await expect(item(scope, "Button.tsx")).toHaveAttribute("aria-selected", "false");

  /* Selection is the user's decision, so the next node the keyboard reaches is not chosen. */
  await page.keyboard.press("ArrowDown");
  expect(await focusedName(page)).toBe("Archive");
  await expect(item(scope, "README.md")).toHaveAttribute("aria-selected", "true");

  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("Space");
  await expect(item(scope, "notes.md")).toHaveAttribute("aria-selected", "true");

  expect(errors).toEqual([]);
});

test("a disabled node cannot be chosen or opened, and its visible child stays its own node", async ({
  page,
  errors,
}) => {
  const scope = projects(page);
  const archive = item(scope, "Archive");
  await expect(archive).toHaveAttribute("aria-disabled", "true");

  /* A disabled row answers nothing, so the press is forced past the actionability check. */
  await archive.click({ force: true });
  await expect(archive).toHaveAttribute("aria-selected", "false");
  await expect(archive).toHaveAttribute("aria-expanded", "true");

  /* Its own pointer region cannot close the branch either. */
  const row = await rowBox(scope, "Archive").boundingBox();
  expect(row).not.toBeNull();
  await page.mouse.click(row!.x + 32, row!.y + row!.height / 2);
  await expect(archive).toHaveAttribute("aria-expanded", "true");

  /* Disability is the node's, never its already-visible descendants'. */
  await item(scope, "notes.md").click();
  await expect(item(scope, "notes.md")).toHaveAttribute("aria-selected", "true");
  await expect(item(scope, "notes.md")).toHaveAttribute("aria-disabled", "false");

  expect(errors).toEqual([]);
});

test("the chosen row carries the selected tone, and an unavailable row answers no pointer", async ({
  page,
  errors,
}) => {
  const scope = projects(page);
  const selected = rowBox(scope, "Button.tsx");
  const available = rowBox(scope, "README.md");

  const background = (locator: Locator) =>
    locator.evaluate((element) => getComputedStyle(element).backgroundColor);

  /* Selection is a tone the row holds, so it is visible as well as announced. */
  const chosenFill = await background(selected);
  expect(chosenFill).not.toBe("rgba(0, 0, 0, 0)");
  expect(chosenFill).not.toBe(await background(available));

  /* A row that cannot be used takes no hover: the state layer is gated on the tree's own
     disabled marker, so an unavailable node neither tints nor presses. */
  const layer = (locator: Locator) =>
    locator.evaluate((element) => getComputedStyle(element, "::before").opacity);
  const point = async (locator: Locator) => {
    const box = await locator.boundingBox();
    expect(box).not.toBeNull();
    await page.mouse.move(box!.x + box!.width - 12, box!.y + box!.height / 2);
  };

  await point(available);
  await expect.poll(async () => Number(await layer(available))).toBeGreaterThan(0.04);
  await point(rowBox(scope, "Archive"));
  await expect.poll(async () => layer(rowBox(scope, "Archive"))).toBe("0");

  await page.mouse.move(0, 0);
  expect(errors).toEqual([]);
});

test("the branch region toggles without choosing, and its target clears the pointer minimum", async ({
  page,
  errors,
}) => {
  const scope = projects(page);
  const utils = item(scope, "utils");
  const toggle = utils.locator("span").first();

  const box = await toggle.boundingBox();
  expect(box).not.toBeNull();
  expect(box!.width).toBeGreaterThanOrEqual(24);
  expect(box!.height).toBeGreaterThanOrEqual(24);

  await toggle.click();
  await expect(utils).toHaveAttribute("aria-expanded", "true");
  await expect(utils).toHaveAttribute("aria-selected", "false");

  /* The rest of the row is the node: one row, two pointer targets, and neither is a nested
     control. */
  await utils.click({ position: { x: 320, y: 20 } });
  await expect(utils).toHaveAttribute("aria-selected", "true");
  await expect(utils).toHaveAttribute("aria-expanded", "true");

  expect(errors).toEqual([]);
});

test("the row wears the shared inset ring for the keyboard and not for a pointer", async ({
  page,
  errors,
}) => {
  const scope = projects(page);
  const row = rowBox(scope, "src");

  await item(scope, "src").click({ position: { x: 320, y: 20 } });
  expect((await ring(row)).painted, "a pointer press is not a keyboard focus").toBe(false);

  await page.keyboard.press("Shift+Tab");
  await page.keyboard.press("Tab");
  const keyboard = await ring(row);
  expect(keyboard.painted, "keyboard focus paints the shared inset ring").toBe(true);
  expect(keyboard.shadow, "at the ring's own width").toContain("2px");

  expect(errors).toEqual([]);
});

test("a controlled tree reports requests and refuses without moving the keyboard", async ({
  page,
  errors,
}) => {
  const scope = tree(page, "tree-controlled");
  await expect(page.getByTestId("tree-expanded")).toHaveText("parent");

  await page.getByTestId("tree-reject").click();
  await expect(page.getByTestId("tree-reject")).toHaveAttribute("aria-pressed", "true");

  await item(scope, "Parent").focus();
  await page.keyboard.press("ArrowLeft");

  /* The application declined, so nothing changed — and in particular the keyboard did not move
     toward a child that never appeared. */
  await expect(item(scope, "Parent")).toHaveAttribute("aria-expanded", "true");
  expect(await focusedName(page)).toBe("Parent");
  await expect(item(scope, "Parent").locator('> [role="group"]')).toHaveCount(1);
  await expect(page.getByTestId("tree-expanded")).toHaveText("parent");

  expect(errors).toEqual([]);
});

test("a controlled tree reports the chosen value, and selection does not follow focus", async ({
  page,
  errors,
}) => {
  const scope = tree(page, "tree-controlled");
  await item(scope, "Sibling").click();

  await expect(page.getByTestId("tree-value")).toHaveText("sibling");
  expect(await focusedName(page)).toBe("Sibling");

  await page.keyboard.press("ArrowUp");
  expect(await focusedName(page)).toBe("Second child");
  await expect(page.getByTestId("tree-value")).toHaveText("sibling");
  await expect(item(scope, "Sibling")).toHaveAttribute("aria-selected", "true");

  expect(errors).toEqual([]);
});

test("a node that leaves the tree moves the keyboard to its nearest visible ancestor", async ({
  page,
  errors,
}) => {
  const scope = tree(page, "tree-controlled");
  await item(scope, "Second child").focus();

  /* The control keeps the keyboard where it is, so what it removes is a node underneath the
     tree's own focus. */
  await page.getByTestId("tree-remove-child").click();
  await expect(item(scope, "Second child")).toHaveCount(0);
  expect(await focusedName(page)).toBe("Parent");
  expect(await tabStops(scope)).toBe(1);

  expect(errors).toEqual([]);
});

test("a collapse underneath the tree's own focus moves the keyboard to the branch", async ({
  page,
  errors,
}) => {
  const scope = tree(page, "tree-controlled");
  await item(scope, "Second child").focus();

  await page.getByTestId("tree-collapse").click();
  await expect(item(scope, "Second child")).toHaveCount(0);
  expect(await focusedName(page)).toBe("Parent");
  expect(await tabStops(scope)).toBe(1);

  expect(errors).toEqual([]);
});

test("a change made while the keyboard is elsewhere never takes it", async ({ page, errors }) => {
  const scope = tree(page, "tree-controlled");
  await item(scope, "Second child").focus();

  /* This control takes focus itself, so the tree's own focus is gone before the node is. */
  await page.getByTestId("tree-remove-child-unfocused").click();
  expect(await focusedName(page)).toBe("Remove child while focus is here");
  await expect(item(scope, "Second child")).toHaveCount(0);
  expect(await tabStops(scope)).toBe(1);

  expect(errors).toEqual([]);
});

test("a disabled tree dims once and refuses every action", async ({ page, errors }) => {
  const scope = tree(page, "tree-disabled");
  const parent = item(scope, "Locked parent");

  await expect(scope).toHaveAttribute("aria-disabled", "true");
  await expect(parent).toHaveAttribute("aria-disabled", "true");

  /* One dimming step, at the root: a tree cannot dim its rows into a second one. */
  const opacities = await scope.evaluate((element) => [
    getComputedStyle(element).opacity,
    getComputedStyle(element.querySelector('[role="treeitem"] > div') as HTMLElement).opacity,
  ]);
  expect(opacities).toEqual(["0.45", "1"]);

  await parent.focus();
  await page.keyboard.press("ArrowLeft");
  await expect(parent).toHaveAttribute("aria-expanded", "true");
  await page.keyboard.press("Enter");
  await expect(parent).toHaveAttribute("aria-selected", "false");
  await parent.click({ force: true, position: { x: 320, y: 20 } });
  await expect(parent).toHaveAttribute("aria-selected", "false");

  expect(errors).toEqual([]);
});

test("an empty tree stays named and safe", async ({ page, errors }) => {
  const scope = tree(page, "tree-empty");
  await expect(page.getByRole("tree", { name: "Empty tree" })).toHaveCount(1);
  await expect(scope.locator('[role="treeitem"]')).toHaveCount(0);
  /* Nothing was invented to be tabbed to. */
  expect(await tabStops(scope)).toBe(0);

  expect(errors).toEqual([]);
});

test("a deep tree caps its indentation without losing a level", async ({ page, errors }) => {
  const scope = tree(page, "tree-deep");
  await expect(scope.locator('[role="group"]')).toHaveCount(6);

  const indent = (name: string) =>
    rowBox(scope, name).evaluate((element) => getComputedStyle(element).paddingInlineStart);

  /* The deepest levels indent only as far as the cap allows, so the labels keep their room. */
  expect(await indent("Level 2")).toBe(await indent("Level 1"));
  expect(Number.parseFloat(await indent("Level 1"))).toBeLessThan(96);

  /* The nesting itself is untouched: the deepest node is still six levels in. */
  const leaf = scope.locator('[role="treeitem"]').last();
  expect(
    await leaf.evaluate((element) => {
      let depth = 0;
      let parent = element.parentElement;
      while (parent && parent !== document.body) {
        if (parent.getAttribute("role") === "group") depth += 1;
        parent = parent.parentElement;
      }
      return depth;
    })
  ).toBe(6);

  /* Long copy yields inside the column instead of widening the page. */
  const width = await scope.evaluate((element) => ({
    client: element.clientWidth,
    scroll: element.scrollWidth,
  }));
  expect(width.scroll).toBeLessThanOrEqual(width.client + 1);
  const label = await scope.getByText(/^A label long enough/).first().evaluate((element) => ({
    client: element.clientWidth,
    scroll: element.scrollWidth,
  }));
  expect(label.client).toBeGreaterThan(0);
  expect(label.scroll).toBeGreaterThan(label.client);
  const pageWidth = await page.evaluate(() => ({
    client: document.documentElement.clientWidth,
    scroll: document.documentElement.scrollWidth,
  }));
  expect(pageWidth.scroll).toBeLessThanOrEqual(pageWidth.client + 1);

  /* `renderItem` is label content, never a second name: the node is still called what `label`
     says it is. */
  await expect(page.getByRole("treeitem", { name: /^A label long enough/ })).toHaveCount(1);

  expect(errors).toEqual([]);
});

test("a logical forward direction mirrors with the page", async ({ page, errors }) => {
  const scope = tree(page, "tree-rtl");
  const branch = item(scope, "Branch node");

  await branch.focus();
  await page.keyboard.press("ArrowLeft");
  expect(await focusedName(page)).toBe("Branch node");
  await expect(branch).toHaveAttribute("aria-expanded", "true");

  await page.keyboard.press("ArrowLeft");
  expect(await focusedName(page)).toBe("Child node");
  await page.keyboard.press("ArrowRight");
  expect(await focusedName(page)).toBe("Branch node");
  await page.keyboard.press("ArrowRight");
  expect(await focusedName(page)).toBe("Branch node");
  await expect(branch).toHaveAttribute("aria-expanded", "false");

  /* The affordance mirrors with the direction: the collapsed chevron of a right-to-left tree
     points the other way. */
  const mirrored = await rowBox(scope, "Branch node").locator("svg").first().evaluate(
    (element) => getComputedStyle(element).transform
  );
  const leftToRight = await rowBox(projects(page), "utils").locator("svg").first().evaluate(
    (element) => getComputedStyle(element).transform
  );
  expect(mirrored.startsWith("matrix(-1")).toBe(true);
  expect(leftToRight.startsWith("matrix(-1")).toBe(false);

  expect(errors).toEqual([]);
});

test("typeahead searches the visible labels and never chooses", async ({ page, errors }) => {
  const scope = projects(page);
  await item(scope, "README.md").focus();

  await page.keyboard.press("c");
  expect(await focusedName(page)).toBe("components");
  /* A search moves the keyboard; it never makes the choice. */
  await expect(item(scope, "components")).toHaveAttribute("aria-selected", "false");

  /* Rapid characters are one search, and the same character again cycles through the nodes that
     start with it rather than looking for a word that does not exist. */
  await item(scope, "components").focus();
  await page.keyboard.press("s");
  expect(await focusedName(page)).toBe("Select.tsx");
  await page.keyboard.press("s");
  expect(await focusedName(page)).toBe("src");
  await page.keyboard.press("c");
  expect(await focusedName(page)).toBe("components");

  await item(scope, "Select.tsx").focus();
  await page.keyboard.press("r");
  await page.keyboard.press("e");
  expect(await focusedName(page)).toBe("README.md");

  expect(errors).toEqual([]);
});

test("the tree specimens pass an axe scan", async ({ page, errors }) => {
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

  expect(errors).toEqual([]);
});
