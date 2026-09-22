import { expect, test, type Locator, type Page } from "./fixtures";

/*
 The v2.1 navigation fixtures. Every check here is semantic or geometric: which control is current,
 how many controls a page total produces, where a click really goes, and whether a row stays inside
 the column it was given. No test reads a class name.
*/

const NARROW_VIEWPORT = { width: 320, height: 800 };

const openFixture = async (page: Page) => {
  await page.goto("/verification/v2-1-c");
  await page.waitForFunction(() => document.documentElement.dataset.hydrated === "true");
  await expect(page.getByTestId("verification-v2-1-c")).toBeVisible();
};

/* The names are matched exactly, so one landmark never answers for another. */
const landmark = (page: Page, name: string) => page.getByRole("navigation", { name, exact: true });

/* The pages a pagination is offering, read from the accessible names the controls publish. */
const pageNumbers = (nav: Locator) =>
  nav
    .locator('[aria-label^="Page "]')
    .evaluateAll((controls) =>
      controls.map((control) => Number((control.getAttribute("aria-label") ?? "").replace("Page ", "")))
    );

const currentPages = (nav: Locator) => nav.locator('[aria-current="page"]');

const assertNoPageOverflow = async (page: Page, context: string) => {
  const { scrollWidth, clientWidth } = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
  expect(
    scrollWidth,
    `${context}: document.documentElement.scrollWidth ${scrollWidth} exceeds clientWidth ${clientWidth}`
  ).toBeLessThanOrEqual(clientWidth);
};

test("pagination is a named navigation landmark over one numbered list with one current page", async ({
  page,
  errors,
}) => {
  await openFixture(page);

  const pagination = landmark(page, "Pagination");
  await expect(pagination).toBeVisible();
  await expect(pagination.getByRole("list")).toHaveCount(1);
  /* Both steps and the bounded set: the pages, one gap on each side, and the native list holding
     one item per control. */
  await expect(pagination.locator("ol > li")).toHaveCount(9);
  expect(await pageNumbers(pagination)).toEqual([1, 4, 5, 6, 12]);
  await expect(currentPages(pagination)).toHaveCount(1);
  await expect(currentPages(pagination)).toHaveText("5");

  /* Every control clears the library's own target floor, so the row is one object. */
  for (const control of await pagination.locator("a, button").all()) {
    const box = await control.boundingBox();
    expect(
      box?.height ?? 0,
      `${await control.getAttribute("aria-label")} is shorter than the target floor`
    ).toBeGreaterThanOrEqual(44);
  }

  expect(errors).toEqual([]);
});

test("empty, single, normalized and disabled paginations keep their own boundaries", async ({
  page,
  errors,
}) => {
  await openFixture(page);

  /* No pages at all: nothing to navigate to and nothing current. */
  const empty = landmark(page, "Empty pagination");
  await expect(empty.getByRole("button")).toHaveCount(2);
  await expect(currentPages(empty)).toHaveCount(0);
  await expect(empty.getByRole("button", { name: "Previous page" })).toBeDisabled();
  await expect(empty.getByRole("button", { name: "Next page" })).toBeDisabled();

  /* One page is both ends at once. */
  const single = landmark(page, "Single page pagination");
  await expect(single.getByRole("button", { name: "Previous page" })).toBeDisabled();
  await expect(single.getByRole("button", { name: "Next page" })).toBeDisabled();
  await expect(currentPages(single)).toHaveText("1");

  /* A fractional total floors, and a page outside the range is shown clamped rather than rewritten:
     this one is controlled with no callback, so activating another page may not move it. */
  const normalized = landmark(page, "Normalized pagination");
  expect(await pageNumbers(normalized)).toEqual([1, 2, 3, 4]);
  await expect(currentPages(normalized)).toHaveText("4");
  await normalized.getByRole("button", { name: "Page 2" }).click();
  await expect(currentPages(normalized)).toHaveText("4");

  /* A total that is not a number is the empty pagination again. */
  const invalid = landmark(page, "Invalid pagination");
  await expect(currentPages(invalid)).toHaveCount(0);
  await expect(invalid.locator("ol > li")).toHaveCount(2);

  /* Nothing in a disabled pagination can be reached or activated: every control is natively
     disabled, and the landmark is not where that state is announced. */
  const disabled = landmark(page, "Disabled pagination");
  await expect(disabled.getByRole("button")).toHaveCount(7);
  for (const control of await disabled.getByRole("button").all()) await expect(control).toBeDisabled();

  const dim = await disabled.evaluate((element) => {
    const control = element.querySelector("button");
    return {
      root: Number(getComputedStyle(element).opacity),
      control: Number(control ? getComputedStyle(control).opacity : 0),
    };
  });
  expect(dim.control, "a control inside a disabled pagination is dimmed a second time").toBe(1);
  expect(dim.root * dim.control).toBeCloseTo(0.45, 2);

  expect(errors).toEqual([]);
});

test("a huge page total renders a bounded set whose gaps are not controls", async ({ page, errors }) => {
  await openFixture(page);

  const long = landmark(page, "Long pagination");
  expect(await pageNumbers(long)).toEqual([1, 598, 599, 600, 601, 602, 1234]);
  await expect(currentPages(long)).toHaveText("600");

  const gaps = long.locator('li[aria-hidden="true"]');
  await expect(gaps).toHaveCount(2);
  for (const gap of await gaps.all()) {
    expect(
      await gap.evaluate((element) => element.querySelectorAll("a, button, input, [tabindex]").length),
      "a gap must hold no control"
    ).toBe(0);
  }

  /* The set follows the destination and stays the same size: a total of 1234 can never render more
     controls than a small one, and the two steps stay reachable at the boundary. */
  await long.getByRole("button", { name: "Page 1234" }).click();
  await expect(currentPages(long)).toHaveText("1234");
  expect(await pageNumbers(long)).toEqual([1, 1232, 1233, 1234]);
  await expect(long.getByRole("button", { name: "Next page" })).toBeDisabled();
  await expect(long.getByRole("button", { name: "Previous page" })).toBeEnabled();

  expect(errors).toEqual([]);
});

test("an uncontrolled pagination moves with the pointer and the keyboard, and reports the page", async ({
  page,
  errors,
}) => {
  await openFixture(page);

  const pagination = landmark(page, "Pagination");
  const reported = page.getByTestId("reported-page");

  await pagination.getByRole("button", { name: "Page 6" }).click();
  await expect(currentPages(pagination)).toHaveText("6");
  await expect(reported).toHaveText("6");
  expect(await pageNumbers(pagination)).toEqual([1, 5, 6, 7, 12]);

  /* A native button answers Enter and Space, and both are the same activation as the pointer. */
  await pagination.getByRole("button", { name: "Next page" }).focus();
  await page.keyboard.press("Enter");
  await expect(currentPages(pagination)).toHaveText("7");
  await expect(reported).toHaveText("7");

  await page.keyboard.press("Space");
  await expect(currentPages(pagination)).toHaveText("8");
  await expect(reported).toHaveText("8");

  /* A step is a target in both directions, and the destination it reaches is the current one. */
  await pagination.getByRole("button", { name: "Previous page" }).click();
  await expect(currentPages(pagination)).toHaveText("7");
  await expect(reported).toHaveText("7");

  expect(errors).toEqual([]);
});

test("linked pages navigate natively, report the activation, and leave modified clicks alone", async ({
  page,
  errors,
}) => {
  await openFixture(page);

  const linked = landmark(page, "Linked pagination");
  const fourth = linked.getByRole("link", { name: "Go to page 4" });
  await expect(fourth).toHaveAttribute("href", "#page-4");

  /* A consumer router would see an unprevented click: the component reports and steps aside. */
  await page.evaluate(() => {
    document.addEventListener("click", (event) => {
      (window as unknown as { prevented?: boolean }).prevented = event.defaultPrevented;
    });
  });

  await fourth.click();
  await expect(page).toHaveURL(/#page-4$/);
  await expect(page.getByTestId("linked-page")).toHaveText("4");
  await expect(currentPages(linked)).toHaveText("4");
  expect(
    await page.evaluate(() => (window as unknown as { prevented?: boolean }).prevented),
    "a linked page must not hijack the click"
  ).toBe(false);

  /* A modified click belongs to the browser: it opens a new tab, and this page keeps its place. */
  await linked.getByRole("link", { name: "Go to page 5" }).click({ modifiers: ["ControlOrMeta"] });
  await expect(page).toHaveURL(/#page-4$/);
  await expect(page.getByTestId("linked-page")).toHaveText("4");
  await expect(currentPages(linked)).toHaveText("4");

  /* At the last page the step stops being an anchor: a boundary control has no href to offer. */
  await linked.getByRole("link", { name: "Go to page 9" }).click();
  await expect(currentPages(linked)).toHaveText("9");
  await expect(linked.getByRole("link", { name: "Next page" })).toHaveCount(0);
  await expect(linked.getByRole("button", { name: "Next page" })).toBeDisabled();

  expect(errors).toEqual([]);
});

const svgScaleX = (locator: Locator) =>
  locator.evaluate((element) => {
    const transform = getComputedStyle(element).transform;
    return transform === "none" ? 1 : new DOMMatrixReadOnly(transform).a;
  });

test("RTL mirrors the directional glyphs and leaves page identity alone", async ({ page, errors }) => {
  await openFixture(page);

  const pagination = landmark(page, "Pagination");
  const previous = pagination.getByRole("button", { name: "Previous page" }).locator("svg");
  const next = pagination.getByRole("button", { name: "Next page" }).locator("svg");
  const separator = landmark(page, "Breadcrumb").locator("svg").first();

  expect(await svgScaleX(previous)).toBeGreaterThan(0);
  expect(await svgScaleX(next)).toBeGreaterThan(0);
  expect(await svgScaleX(separator)).toBeGreaterThan(0);

  await page.evaluate(() => {
    document.documentElement.dir = "rtl";
  });

  try {
    // The host's reduced-motion reset still leaves a tiny CSS transition; observe the settled glyph.
    await expect.poll(() => svgScaleX(previous)).toBeLessThan(0);
    await expect.poll(() => svgScaleX(next)).toBeLessThan(0);
    await expect.poll(() => svgScaleX(separator)).toBeLessThan(0);

    /* A page is a number, not a direction: the set and the current page are unchanged. */
    expect(await pageNumbers(pagination)).toEqual([1, 4, 5, 6, 12]);
    await expect(currentPages(pagination)).toHaveText("5");
    await assertNoPageOverflow(page, "RTL navigation");
  } finally {
    await page.evaluate(() => {
      document.documentElement.removeAttribute("dir");
    });
  }

  expect(errors).toEqual([]);
});

test("a narrow column wraps both families instead of widening the page", async ({ page, errors }) => {
  await page.setViewportSize(NARROW_VIEWPORT);
  await openFixture(page);

  const narrow = page.getByTestId("v21-narrow");
  const container = await narrow.evaluate((element) => {
    const box = element.getBoundingClientRect();
    return {
      scrollWidth: element.scrollWidth,
      clientWidth: element.clientWidth,
      left: box.left,
      right: box.right,
    };
  });
  expect(container.scrollWidth, "the narrow column overflows").toBeLessThanOrEqual(
    container.clientWidth + 1
  );
  await assertNoPageOverflow(page, "narrow navigation");

  const pagination = landmark(page, "Narrow pagination");
  const boxes = await pagination.getByRole("button").evaluateAll((controls) =>
    controls.map((control) => {
      const box = control.getBoundingClientRect();
      return { left: box.left, right: box.right, top: box.top };
    })
  );
  expect(boxes.length).toBeGreaterThan(0);
  for (const box of boxes) {
    expect(box.left, "a control left the column").toBeGreaterThanOrEqual(container.left - 1);
    expect(box.right, "a control left the column").toBeLessThanOrEqual(container.right + 1);
  }
  /* It wraps rather than scrolling: the controls sit on more than one line. */
  expect(new Set(boxes.map((box) => Math.round(box.top))).size, "the row did not wrap").toBeGreaterThan(1);

  /* The trail yields too: a long label stays inside the column. */
  const trail = await landmark(page, "Narrow breadcrumb").boundingBox();
  expect((trail?.x ?? 0) + (trail?.width ?? 0)).toBeLessThanOrEqual(container.right + 1);

  expect(errors).toEqual([]);
});

test("breadcrumb is a native list whose last item is the current page as text", async ({ page, errors }) => {
  await openFixture(page);

  const breadcrumb = landmark(page, "Breadcrumb");
  await expect(breadcrumb.getByRole("list")).toHaveCount(1);
  await expect(breadcrumb.locator("ol > li")).toHaveCount(4);
  await expect(currentPages(breadcrumb)).toHaveCount(1);
  await expect(currentPages(breadcrumb)).toHaveText("Pagination");

  /* Every intermediate destination is a real anchor... */
  await expect(breadcrumb.getByRole("link", { name: "Home" })).toHaveAttribute("href", "#home");
  await expect(breadcrumb.getByRole("link", { name: "Library" })).toHaveAttribute("href", "#library");
  /* ...an item without a destination is a label rather than a dead link... */
  await expect(breadcrumb.getByText("Guides")).toBeVisible();
  await expect(breadcrumb.getByRole("link", { name: "Guides" })).toHaveCount(0);
  /* ...and the current page is text even though the item carries an href of its own. */
  await expect(breadcrumb.getByRole("link", { name: "Pagination" })).toHaveCount(0);

  /* The separators are decorative: they carry no text of their own. */
  const separators = breadcrumb.locator('svg[aria-hidden="true"]');
  await expect(separators).toHaveCount(3);
  for (const separator of await separators.all()) {
    expect(await separator.evaluate((element) => element.textContent)).toBe("");
  }

  /* A keyboard that reaches an intermediate link sees the shared ring. */
  await landmark(page, "No-sibling pagination")
    .getByRole("button", { name: "Next page" })
    .focus();
  await page.keyboard.press("Tab");
  const home = breadcrumb.getByRole("link", { name: "Home" });
  await expect(home).toBeFocused();
  const ring = await home.evaluate((element) => {
    const style = getComputedStyle(element);
    return {
      visible: element.matches(":focus-visible"),
      width: Number.parseFloat(style.outlineWidth),
      style: style.outlineStyle,
    };
  });
  expect(ring.visible).toBe(true);
  expect(ring.style).not.toBe("none");
  expect(ring.width).toBeGreaterThanOrEqual(2);

  expect(errors).toEqual([]);
});

test("a custom breadcrumb link receives the destination, the content and the shared treatment", async ({
  page,
  errors,
}) => {
  await openFixture(page);

  const rendered = landmark(page, "Rendered breadcrumb");
  const link = rendered.locator('a[data-router="v21"]');
  await expect(link).toHaveCount(1);
  await expect(link).toHaveAttribute("href", "#home");
  await expect(link).toHaveText("Home");

  /* The supplied classes travelled with the supplied props: the keyboard reaches the custom link and
     the shared focus ring is what it sees. */
  await landmark(page, "Breadcrumb").getByRole("link", { name: "Library" }).focus();
  await page.keyboard.press("Tab");
  await expect(link).toBeFocused();
  const ring = await link.evaluate((element) => {
    const style = getComputedStyle(element);
    return {
      visible: element.matches(":focus-visible"),
      width: Number.parseFloat(style.outlineWidth),
      style: style.outlineStyle,
    };
  });
  expect(ring.visible).toBe(true);
  expect(ring.style).not.toBe("none");
  expect(ring.width).toBeGreaterThanOrEqual(2);

  /* A single-place trail is just the page the reader is on. */
  const single = landmark(page, "Single-item breadcrumb");
  await expect(single.getByRole("link")).toHaveCount(0);
  await expect(currentPages(single)).toHaveText("Home");

  expect(errors).toEqual([]);
});

test("the passive breadcrumb arrives in the server markup", async ({ page, errors }) => {
  await openFixture(page);

  const html = await (await page.request.get("/verification/v2-1-c")).text();
  expect(html, "the trail must render without a browser").toContain('aria-label="Breadcrumb"');
  expect(html).toContain('href="#library"');
  expect(html).toContain('aria-current="page"');
  await expect(landmark(page, "Breadcrumb")).toBeVisible();

  expect(errors).toEqual([]);
});

test("numeric limits stay bounded and preserve distinct page identities", async ({ page, errors }) => {
  await openFixture(page);
  const unsafe = landmark(page, "Unsafe total");
  await expect(currentPages(unsafe)).toHaveCount(0);
  await expect(unsafe.getByRole("button")).toHaveCount(2);
  const maximum = landmark(page, "Maximum safe total");
  expect(await maximum.locator("ol > li").count()).toBeLessThanOrEqual(17);
  const numbers = await pageNumbers(maximum);
  expect(new Set(numbers).size).toBe(numbers.length);
  expect(numbers.at(-1)).toBe(Number.MAX_SAFE_INTEGER);
  await expect(currentPages(maximum)).toHaveText("1000");
  expect(errors).toEqual([]);
});

test("an empty href remains a real native navigation link", async ({ page, errors }) => {
  await openFixture(page);
  const pagination = landmark(page, "Empty-href pagination");
  await expect(pagination.getByRole("link")).toHaveCount(5);
  for (const link of await pagination.getByRole("link").all()) await expect(link).toHaveAttribute("href", "");
  await expect(landmark(page, "Empty-href breadcrumb").getByRole("link", { name: "Reload" })).toHaveAttribute("href", "");
  expect(errors).toEqual([]);
});

test("previous and next press the mark without shrinking their targets", async ({ page, errors }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await openFixture(page);
  const target = landmark(page, "Pagination").getByRole("button", { name: "Next page" });
  const mark = target.locator("svg");
  const before = (await target.boundingBox())!;
  const inkBefore = (await mark.boundingBox())!;
  await target.hover();
  await page.mouse.down();
  try {
    await expect.poll(async () => (await mark.boundingBox())!.width).toBeLessThan(inkBefore.width - 1);
    expect((await target.boundingBox())!.width).toBeCloseTo(before.width, 1);
    expect((await target.boundingBox())!.height).toBeCloseTo(before.height, 1);
  } finally {
    await page.mouse.up();
  }
  expect(errors).toEqual([]);
});
