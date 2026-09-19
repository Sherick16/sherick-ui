import { expect, test, type Locator, type Page } from "./fixtures";

/* Disclosure: the accordion and the collapsible are one object at two scopes, so the contract is
   asserted once — the row is a real button inside a real heading, the region it opens is wired to
   it, and the height it travels through is the primitive's own measurement moved by the one
   disclosure recipe. */

test.use({ reducedMotion: "no-preference" });

const transitionProperty = (locator: Locator) =>
  locator.evaluate((element) => getComputedStyle(element).transitionProperty);

const transitionDuration = (locator: Locator) =>
  locator.evaluate((element) => getComputedStyle(element).transitionDuration);

const height = (locator: Locator) =>
  locator.evaluate((element) => element.getBoundingClientRect().height);

/* An accordion item's panel is its own labelled region; a collapsible's is only the element its
   trigger controls, so it is addressed the way Base publishes it. */
const accordionRegion = (name: string) =>
  ({ role: "region" as const, name }) as const;

const collapsiblePanel = async (page: Page, trigger: Locator) => {
  const controls = await trigger.getAttribute("aria-controls");
  expect(controls).toBeTruthy();
  return page.locator(`[id="${controls}"]`);
};

test.beforeEach(async ({ page }) => {
  await page.goto("/verification/interactions");
  await page.waitForFunction(() => document.documentElement.dataset.hydrated === "true");
});

test("an accordion row is a button inside a heading, wired to the region it opens", async ({
  page,
  errors,
}) => {
  const trigger = page.getByRole("button", { name: "First section" });

  await expect(trigger).toHaveAttribute("aria-expanded", "true");
  /* The accessible structure is the item's own: the heading is what makes a group of sections
     navigable as sections, and a consumer never writes it. */
  await expect(
    page.getByRole("heading", { level: 3, name: "First section" }).getByRole("button")
  ).toHaveCount(1);

  const panel = page.getByRole("region", accordionRegion("First section"));
  await expect(panel).toBeVisible();
  await expect(panel).toHaveAttribute("data-open");
  /* How the height moves is the disclosure recipe's, and the panel is the one node on which it
     travels: nothing else in the row carries a competing geometry. */
  expect(await transitionProperty(panel)).toBe("height");
  expect(await height(panel)).toBeGreaterThan(0);

  /* Base resets the measured height back to `auto` once the panel has settled, so the region can
     grow with its own content; the measurement is what the travel starts and ends from. */
  const inline = await panel.evaluate((element) => element.getAttribute("style") ?? "");
  expect(inline).toContain("--accordion-panel-height");

  expect(errors).toEqual([]);
});

test("a single-open accordion closes the section before it", async ({ page, errors }) => {
  const first = page.getByRole("button", { name: "First section" });
  const second = page.getByRole("button", { name: "Second section" });

  await second.click();

  await expect(second).toHaveAttribute("aria-expanded", "true");
  await expect(first).toHaveAttribute("aria-expanded", "false");
  await expect(page.getByTestId("accordion-value")).toHaveText("second");

  /* A collapsed panel leaves the page rather than merely being clipped, so nothing inside it is
     reachable while it is closed. */
  await expect(page.getByRole("region", accordionRegion("First section"))).toHaveCount(0);

  expect(errors).toEqual([]);
});

test("a disabled section is inert and stays closed", async ({ page, errors }) => {
  const locked = page.getByRole("button", { name: "Locked section" });

  await expect(locked).toBeDisabled();
  await locked.click({ force: true }).catch(() => undefined);
  await expect(locked).toHaveAttribute("aria-expanded", "false");
  await expect(page.getByTestId("accordion-value")).not.toHaveText(/locked/);

  expect(errors).toEqual([]);
});

test("keyboard activation opens a section", async ({ page, errors }) => {
  const second = page.getByRole("button", { name: "Second section" });

  await second.focus();
  await page.keyboard.press("Enter");

  await expect(second).toHaveAttribute("aria-expanded", "true");
  await expect(page.getByTestId("accordion-value")).toHaveText("second");

  expect(errors).toEqual([]);
});

test("the group's own line is inset, at the lightest role, and yields to the section beside it", async ({
  page,
  errors,
}) => {
  const dividers = page.getByRole("separator");
  await expect(dividers).toHaveCount(2);

  /* Inset to the band the row and the panel content share, so the line marks the join between two
     sections rather than the width of the surface. */
  const geometry = await dividers.nth(0).evaluate((element) => {
    const parent = element.parentElement;
    return {
      width: (element as HTMLElement).offsetWidth,
      container: parent ? (parent as HTMLElement).offsetWidth : 0,
      margin: Number.parseFloat(getComputedStyle(element).marginLeft),
    };
  });
  expect(geometry.container - geometry.width).toBe(32);
  expect(geometry.margin).toBe(16);

  /* The lightest structural role, read from the token itself rather than trusted as a name: this
     is the line between the rows of one stacked list, not the general section rule. */
  const rowTone = await page.evaluate(() => {
    const probe = document.createElement("div");
    probe.style.borderTopColor = "oklch(var(--sui-edge) / 0.06)";
    document.body.appendChild(probe);
    const value = getComputedStyle(probe).borderTopColor;
    probe.remove();
    return value;
  });
  const lineTone = await dividers.nth(0).evaluate((element) => getComputedStyle(element).borderTopColor);
  expect(lineTone).toBe(rowTone);

  const opacity = (index: number) =>
    dividers.nth(index).evaluate((element) => getComputedStyle(element).opacity);

  /* The boundary yields while a closed section beside it is hovered, so the line and the row the
     pointer is on never compete. */
  await page.getByRole("button", { name: "Second section" }).hover();
  await expect.poll(() => opacity(0)).toBe("0");
  await expect.poll(() => opacity(1)).toBe("0");

  await page.mouse.move(0, 0);
  await expect.poll(() => opacity(0)).toBe("1");

  /* An open section is excluded from the yield: the line beneath expanded content is what keeps
     the expanded section reading as one unit before the next one begins. */
  await page.getByRole("button", { name: "First section" }).hover();
  await expect.poll(() => opacity(0)).toBe("1");

  expect(errors).toEqual([]);
});

test("an opening region grows out of zero and a closing one travels back rather than jumping", async ({
  page,
  errors,
}) => {
  const trigger = page.getByRole("button", { name: "Second section" });
  const region = page.getByRole("region", accordionRegion("Second section"));

  await expect(region).toHaveCount(0);
  await trigger.click();
  await expect(trigger).toHaveAttribute("aria-expanded", "true");

  /* `data-starting-style` is the collapsed state the primitive opens from, so the first painted
     height is zero and the measured height is what it grows to. */
  await expect.poll(() => height(region)).toBeGreaterThan(0);
  const opened = await height(region);

  await trigger.click();
  /* Sampled as the close begins: the region is still at its opened size, which is only true when
     the height is interpolated instead of applied. Without the recipe's transition the primitive
     would unmount the region in the same task. */
  expect(await height(region)).toBeGreaterThan(opened * 0.5);
  await expect(region).toHaveCount(0);

  expect(errors).toEqual([]);
});

test("reduced motion applies the opened layout state without travelling", async ({ page, errors }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });

  const trigger = page.getByRole("button", { name: "Second section" });
  await trigger.click();
  await expect(trigger).toHaveAttribute("aria-expanded", "true");

  const region = page.getByRole("region", accordionRegion("Second section"));
  await expect(region).toHaveAttribute("data-open");
  /* The height interpolation is gone, not the state: the region is open at once, at its own
     height. */
  expect(await transitionProperty(region)).toBe("none");
  await expect.poll(() => height(region)).toBeGreaterThan(0);
  expect(await transitionDuration(region)).not.toContain("0.2s");

  expect(errors).toEqual([]);
});

test("a collapsible holds its own state and publishes it on its own row", async ({ page, errors }) => {
  const trigger = page.getByRole("button", { name: "Details" });
  const readout = page.getByTestId("collapsible-value");

  await expect(trigger).toHaveAttribute("aria-expanded", "false");
  await expect(readout).toHaveText("closed");

  await trigger.click();
  await expect(trigger).toHaveAttribute("aria-expanded", "true");
  await expect(readout).toHaveText("open");

  const panel = await collapsiblePanel(page, trigger);
  expect(await transitionProperty(panel)).toBe("height");
  await expect.poll(() => height(panel)).toBeGreaterThan(0);

  await trigger.click();
  await expect(readout).toHaveText("closed");
  await expect(trigger).toHaveAttribute("aria-expanded", "false");

  expect(errors).toEqual([]);
});
