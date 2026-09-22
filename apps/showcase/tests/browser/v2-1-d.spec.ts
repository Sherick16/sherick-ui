import { expect, test, type Locator, type Page } from "./fixtures";

/*
 FileUpload: one door twice. The native chooser and the drop zone are two ways into the same
 policy, so these checks drive both and compare what each one did — never a class name, always the
 selection the user can see, the name a control answers to, where focus went, and the geometry the
 browser computed. The picker itself is never asserted to *hold* anything: the component empties it
 after every read, which is exactly what makes a second choice of the same file possible.
*/

const openHarness = async (page: Page) => {
  await page.goto("/verification/v2-1-d");
  await page.waitForFunction(() => document.documentElement.dataset.hydrated === "true");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("FileUpload verification");
};

/** The zone is the label that owns the picker; it is what the pointer and the drop use. */
const zoneOf = (field: Locator) => field.locator("label:has(input[type=file])");
const inputOf = (field: Locator) => field.locator('input[type="file"]');

type PickerFile = { name: string; mimeType: string; buffer: Buffer };
const pickerFile = (name: string, bytes: number, mimeType = "application/pdf"): PickerFile => ({
  name,
  mimeType,
  buffer: Buffer.alloc(bytes, 1),
});

type DropFile = { name: string; type?: string; bytes?: number; lastModified?: number };
const dropFile = (
  name: string,
  options: { type?: string; bytes?: number; lastModified?: number } = {}
): DropFile => ({ name, ...options });

/* A drag the platform would perform: one DataTransfer carrying real `File` objects, dispatched at
   the zone. Building it in the page is what lets a check choose the exact size, MIME type and
   timestamp a rule turns on — an empty MIME type, for instance, cannot be expressed any other way. */
const dragFiles = async (
  field: Locator,
  files: DropFile[],
  types: Array<"dragenter" | "dragover" | "dragleave" | "drop">
) => {
  await zoneOf(field).evaluate(
    (element, payload) => {
      const transfer = new DataTransfer();
      for (const entry of payload.files) {
        transfer.items.add(
          new File([new Uint8Array(entry.bytes ?? 16)], entry.name, {
            type: entry.type ?? "",
            lastModified: entry.lastModified ?? 1,
          })
        );
      }
      for (const type of payload.types) {
        element.dispatchEvent(
          new DragEvent(type, { bubbles: true, cancelable: true, dataTransfer: transfer })
        );
      }
    },
    { files, types }
  );
};

const dropFiles = (field: Locator, files: DropFile[]) => dragFiles(field, files, ["dragenter", "dragover", "drop"]);

const background = (locator: Locator) =>
  locator.evaluate((element) => getComputedStyle(element).backgroundColor);

test("the field names its picker and describes it with every limit", async ({ page, errors }) => {
  await openHarness(page);
  const field = page.getByTestId("v2-1-d-single");
  const input = inputOf(field);

  await expect(input).toHaveAccessibleName("Single document");
  await expect(input).toHaveAccessibleDescription(/A PDF up to 1 KB, one file\./);
  await expect(input).toHaveAccessibleDescription(/PDF/);
  await expect(input).toHaveAccessibleDescription(/Up to 1 KB per file/);
  await expect(input).toHaveAccessibleDescription(/One file/);

  // There is no form-submission contract: the picker carries no name of its own, and the file list
  // it would submit is never the selection the field presents.
  expect(await input.getAttribute("name")).toBeNull();
  expect(await input.getAttribute("multiple")).toBeNull();

  // The ref is the native picker itself, so a consumer can reach the element the platform drives.
  await expect(page.getByTestId("v2-1-d-single-ref")).toHaveText("INPUT:file");

  expect(errors).toEqual([]);
});

test("an error marks the field invalid and describes the picker with its message", async ({
  page,
  errors,
}) => {
  await openHarness(page);
  const field = page.getByTestId("v2-1-d-error");
  const input = inputOf(field);

  await expect(input).toHaveAttribute("aria-invalid", "true");
  await expect(input).toHaveAccessibleDescription(/Required before review\./);
  await expect(input).toHaveAccessibleDescription(/Attach the signed contract\./);
  await expect(field.getByText("Attach the signed contract.")).toBeVisible();

  expect(errors).toEqual([]);
});

test("the chooser keeps the valid part of a mixed batch and reports every failure", async ({
  page,
  errors,
}) => {
  await openHarness(page);
  const field = page.getByTestId("v2-1-d-multiple");

  await inputOf(field).setInputFiles([
    pickerFile("good.pdf", 16),
    pickerFile("notes.txt", 16, "text/plain"),
    pickerFile("big.pdf", 4096),
  ]);

  await expect(field.getByRole("listitem")).toHaveCount(1);
  await expect(field.getByRole("listitem")).toHaveText("good.pdf");
  await expect(page.getByTestId("v2-1-d-multiple-rejections")).toHaveText("type:notes.txt, size:big.pdf");

  const status = field.getByRole("status");
  await expect(status).toContainText("notes.txt is not an accepted file type.");
  await expect(status).toContainText("big.pdf is larger than the 1 KB limit.");
  await expect(status).toContainText("Added 1 file.");

  expect(errors).toEqual([]);
});

test("defaultFiles seeds the selection the field starts with", async ({ page, errors }) => {
  await openHarness(page);
  const field = page.getByTestId("v2-1-d-defaults");

  await expect(field.getByRole("listitem")).toHaveCount(1);
  await expect(field.getByRole("listitem")).toHaveText("seeded.pdf");

  // From there the field owns its own selection: an addition reports the whole next selection.
  await inputOf(field).setInputFiles(pickerFile("added.pdf", 16));
  await expect(field.getByRole("listitem")).toHaveCount(2);
  await expect(page.getByTestId("v2-1-d-defaults-committed")).toHaveText("seeded.pdf, added.pdf");
  await expect(field.getByRole("status")).toContainText("Added 1 file.");

  expect(errors).toEqual([]);
});

test("a drop answers to exactly the rules the chooser applies", async ({ page, errors }) => {
  await openHarness(page);
  const field = page.getByTestId("v2-1-d-multiple");
  const rejections = page.getByTestId("v2-1-d-multiple-rejections");

  await inputOf(field).setInputFiles([
    pickerFile("good.pdf", 16),
    pickerFile("notes.txt", 16, "text/plain"),
    pickerFile("big.pdf", 4096),
  ]);
  await expect(rejections).toHaveText("type:notes.txt, size:big.pdf");
  const fromChooser = await rejections.textContent();

  await page.reload();
  await page.waitForFunction(() => document.documentElement.dataset.hydrated === "true");

  await dropFiles(field, [
    dropFile("good.pdf", { type: "application/pdf", bytes: 16 }),
    dropFile("notes.txt", { type: "text/plain", bytes: 16 }),
    dropFile("big.pdf", { type: "application/pdf", bytes: 4096 }),
  ]);

  await expect(rejections).toHaveText(fromChooser ?? "");
  await expect(field.getByRole("listitem")).toHaveCount(1);
  await expect(field.getByRole("listitem")).toHaveText("good.pdf");
  await expect(field.getByRole("status")).toContainText("Added 1 file.");

  expect(errors).toEqual([]);
});

test("a single-file field replaces its selection and refuses the rest of the batch", async ({
  page,
  errors,
}) => {
  await openHarness(page);
  const field = page.getByTestId("v2-1-d-single");

  await dropFiles(field, [
    dropFile("one.pdf", { type: "application/pdf" }),
    dropFile("two.pdf", { type: "application/pdf" }),
  ]);

  await expect(field.getByRole("listitem")).toHaveCount(1);
  await expect(field.getByRole("listitem")).toHaveText("one.pdf");
  await expect(page.getByTestId("v2-1-d-single-rejections")).toHaveText("count:two.pdf");
  await expect(field.getByRole("status")).toContainText(
    "two.pdf was not added: this field holds one file."
  );

  await dropFiles(field, [dropFile("three.pdf", { type: "application/pdf" })]);
  await expect(field.getByRole("listitem")).toHaveCount(1);
  await expect(field.getByRole("listitem")).toHaveText("three.pdf");

  expect(errors).toEqual([]);
});

test("the picker is emptied after every read, so the same file can be chosen again", async ({
  page,
  errors,
}) => {
  await openHarness(page);
  const field = page.getByTestId("v2-1-d-multiple");
  const input = inputOf(field);

  await input.setInputFiles(pickerFile("report.pdf", 16));
  await expect(field.getByRole("listitem")).toHaveCount(1);

  // The component reads the batch and empties the picker: nothing it does assigns files to the
  // native input, and no value is left behind for the platform to compare against.
  expect(await input.evaluate((element) => (element as HTMLInputElement).files?.length ?? -1)).toBe(0);
  expect(await input.inputValue()).toBe("");

  await field.getByRole("button", { name: "Delete report.pdf" }).click();
  await expect(field.getByRole("listitem")).toHaveCount(0);

  // A picker that still held the first choice would report no change at all.
  await input.setInputFiles(pickerFile("report.pdf", 16));
  await expect(field.getByRole("listitem")).toHaveCount(1);

  expect(errors).toEqual([]);
});

test("the zone opens the platform's own chooser, by pointer and by keyboard", async ({ page, errors }) => {
  await openHarness(page);
  const field = page.getByTestId("v2-1-d-single");
  const zone = zoneOf(field);
  const input = inputOf(field);

  // A pointer anywhere in the zone opens the platform's own chooser, with no JavaScript in the path.
  const pointerChooser = page.waitForEvent("filechooser");
  await zone.click();
  const chooser = await pointerChooser;
  await chooser.setFiles(pickerFile("chosen.pdf", 16));
  await expect(field.getByRole("listitem")).toHaveCount(1);

  // The picker is the field's tab stop, and the zone wears the ring while the picker has visible
  // focus — an offset ring on the sr-only input would sit nowhere near the surface it belongs to.
  const outline = await zone.evaluate((element) => getComputedStyle(element).outlineWidth);
  let reached = false;
  for (let attempt = 0; attempt < 40 && !reached; attempt += 1) {
    await page.keyboard.press("Tab");
    reached = await input.evaluate((element) => element === document.activeElement);
  }
  expect(reached).toBe(true);
  await expect
    .poll(() => zone.evaluate((element) => getComputedStyle(element).outlineWidth))
    .not.toBe(outline);

  // And the platform opens the same chooser for the keyboard.
  const keyboardChooser = page.waitForEvent("filechooser");
  await page.keyboard.press("Enter");
  const second = await keyboardChooser;
  await second.setFiles(pickerFile("typed.pdf", 16));
  await expect(field.getByRole("listitem")).toHaveCount(1);
  await expect(field.getByRole("listitem")).toHaveText("typed.pdf");

  expect(errors).toEqual([]);
});

test("a repeated file enters once, and identity is more than its name", async ({ page, errors }) => {
  await openHarness(page);
  const field = page.getByTestId("v2-1-d-multiple");

  await dropFiles(field, [
    dropFile("same.pdf", { type: "application/pdf", bytes: 32, lastModified: 7 }),
    dropFile("same.pdf", { type: "application/pdf", bytes: 32, lastModified: 7 }),
  ]);

  await expect(field.getByRole("listitem")).toHaveCount(1);
  await expect(page.getByTestId("v2-1-d-multiple-rejections")).toHaveText("(none)");

  // The same name carrying a different timestamp is a different choice.
  await dropFiles(field, [dropFile("same.pdf", { type: "application/pdf", bytes: 32, lastModified: 8 })]);
  await expect(field.getByRole("listitem")).toHaveCount(2);

  expect(errors).toEqual([]);
});

test("the total limit refuses the rest of a batch and says so", async ({ page, errors }) => {
  await openHarness(page);
  const field = page.getByTestId("v2-1-d-multiple");

  await dropFiles(field, [
    dropFile("a.pdf", { type: "application/pdf" }),
    dropFile("b.png", { type: "image/png" }),
    dropFile("c.pdf", { type: "application/pdf" }),
  ]);

  await expect(field.getByRole("listitem")).toHaveCount(2);
  await expect(page.getByTestId("v2-1-d-multiple-rejections")).toHaveText("count:c.pdf");
  await expect(field.getByRole("status")).toContainText(
    "c.pdf was not added: at most 2 files can be selected."
  );

  expect(errors).toEqual([]);
});

test("a file drag marks the zone and hands the drop to the same rules", async ({ page, errors }) => {
  await openHarness(page);
  const field = page.getByTestId("v2-1-d-multiple");
  const zone = zoneOf(field);
  const rest = await background(zone);
  /* The fill answers on the feedback intent, so a change is read as a settled value rather than as
     whatever was painted in the first frame after the event. */
  const settled = () => expect.poll(() => background(zone));

  await dragFiles(field, [dropFile("dragged.pdf", { type: "application/pdf" })], [
    "dragenter",
    "dragover",
  ]);

  await expect(zone.getByText("Drop files here")).toBeVisible();
  await expect(zone.getByText("Add files")).toHaveCount(0);
  // The state is not carried by colour alone; it also takes a fill the resting zone does not hold.
  await settled().not.toBe(rest);

  await dragFiles(field, [dropFile("dragged.pdf", { type: "application/pdf" })], ["dragleave"]);
  await expect(zone.getByText("Add files")).toBeVisible();
  await settled().toBe(rest);

  await dropFiles(field, [dropFile("dragged.pdf", { type: "application/pdf" })]);
  await expect(field.getByRole("listitem")).toHaveCount(1);
  await expect(field.getByRole("listitem")).toHaveText("dragged.pdf");

  expect(errors).toEqual([]);
});

test("an empty MIME type matches an extension but never a MIME-only token", async ({ page, errors }) => {
  await openHarness(page);
  const field = page.getByTestId("v2-1-d-mime-only");

  await dropFiles(field, [dropFile("scan.pdf")]);
  await expect(field.getByRole("listitem")).toHaveCount(0);
  await expect(page.getByTestId("v2-1-d-mime-only-rejections")).toHaveText("type:scan.pdf");
  await expect(field.getByRole("status")).toContainText("scan.pdf is not an accepted file type.");

  await dropFiles(field, [dropFile("scan.pdf", { type: "application/pdf" })]);
  await expect(field.getByRole("listitem")).toHaveCount(1);

  expect(errors).toEqual([]);
});

test("removing a focused row hands focus to the next removal, and the last one to the picker", async ({
  page,
  errors,
}) => {
  await openHarness(page);
  const field = page.getByTestId("v2-1-d-removal");
  const input = inputOf(field);

  await expect(field.getByRole("listitem")).toHaveCount(3);

  await field.getByRole("button", { name: "Remove alpha.pdf" }).focus();
  await page.keyboard.press("Enter");

  await expect(field.getByRole("listitem")).toHaveCount(2);
  await expect(field.getByRole("button", { name: "Remove beta.pdf" })).toBeFocused();
  await expect(field.getByRole("status")).toContainText("Removed alpha.pdf.");

  await page.keyboard.press("Enter");
  await expect(field.getByRole("button", { name: "Remove gamma.pdf" })).toBeFocused();

  await page.keyboard.press("Enter");
  await expect(field.getByRole("listitem")).toHaveCount(0);
  await expect(input).toBeFocused();
  await expect(field.getByRole("status")).toContainText("Removed gamma.pdf.");

  expect(errors).toEqual([]);
});

test("the clear control empties the selection and returns focus to the picker", async ({
  page,
  errors,
}) => {
  await openHarness(page);
  const field = page.getByTestId("v2-1-d-multiple");
  const input = inputOf(field);

  await input.setInputFiles([pickerFile("a.pdf", 16), pickerFile("b.png", 16, "image/png")]);
  await expect(field.getByRole("listitem")).toHaveCount(2);

  await field.getByRole("button", { name: "Remove all" }).click();
  await expect(field.getByRole("listitem")).toHaveCount(0);
  await expect(field.getByRole("status")).toContainText("Removed 2 files.");
  await expect(input).toBeFocused();

  expect(errors).toEqual([]);
});

test("a controlled consumer can refuse an update without the field pretending otherwise", async ({
  page,
  errors,
}) => {
  await openHarness(page);
  const field = page.getByTestId("v2-1-d-controlled");
  const input = inputOf(field);

  await page.getByTestId("v2-1-d-freeze").click();
  await input.setInputFiles(pickerFile("held.pdf", 16));

  // The consumer heard the next selection and refused it: what is presented is what it was given,
  // and no removal or addition is announced for a change that never happened.
  await expect(page.getByTestId("v2-1-d-controlled-committed")).toHaveText("held.pdf");
  await expect(field.getByRole("listitem")).toHaveCount(0);
  await expect(field.getByRole("status")).toHaveText("");

  await page.getByTestId("v2-1-d-freeze").click();
  await input.setInputFiles(pickerFile("held.pdf", 16));
  await expect(field.getByRole("listitem")).toHaveCount(1);
  await expect(field.getByRole("status")).toContainText("Added 1 file.");

  expect(errors).toEqual([]);
});

test("a disabled field closes the picker, the drop, the removals and the clear control", async ({
  page,
  errors,
}) => {
  await openHarness(page);
  const field = page.getByTestId("v2-1-d-disabled");
  const zone = zoneOf(field);

  await expect(field.getByRole("listitem")).toHaveCount(1);
  await expect(inputOf(field)).toBeDisabled();
  await expect(field.getByRole("button", { name: "Remove locked.pdf" })).toBeDisabled();
  await expect(field.getByRole("button", { name: "Clear files" })).toBeDisabled();

  const dimmed = await zone.evaluate((element) => {
    const style = getComputedStyle(element);
    return { opacity: style.opacity, cursor: style.cursor, fill: style.backgroundColor };
  });
  expect(dimmed.opacity).toBe("0.45");
  expect(dimmed.cursor).toBe("not-allowed");

  // A disabled zone answers no pointer at all: hovering it changes nothing.
  await zone.hover();
  expect(await background(zone)).toBe(dimmed.fill);

  // And a dropped batch is ignored outright: no selection, no rejection, no announcement.
  await dropFiles(field, [dropFile("sneaky.pdf", { type: "application/pdf" })]);
  await expect(field.getByRole("listitem")).toHaveCount(1);
  await expect(field.getByRole("status")).toHaveText("");

  expect(errors).toEqual([]);
});

test("a long filename wraps inside its row and the removal keeps its full target", async ({
  page,
  errors,
}) => {
  await openHarness(page);
  const field = page.getByTestId("v2-1-d-narrow");
  const row = field.getByRole("listitem");

  await expect(row).toHaveCount(1);

  const geometry = await row.evaluate((element) => {
    const copy = element.querySelector("span:not([aria-hidden])") as HTMLElement;
    const box = element.getBoundingClientRect();
    return {
      lineHeight: parseFloat(getComputedStyle(copy).lineHeight),
      copyHeight: copy.getBoundingClientRect().height,
      copyOverflows: copy.scrollWidth > copy.clientWidth + 1,
      rowOverflows: element.scrollWidth > element.clientWidth + 1,
      rowWidth: box.width,
    };
  });

  // Unbroken copy wraps rather than pushing the row wider than the column it lives in.
  expect(geometry.copyHeight).toBeGreaterThan(geometry.lineHeight);
  expect(geometry.copyOverflows).toBe(false);
  expect(geometry.rowOverflows).toBe(false);
  expect(geometry.rowWidth).toBeLessThanOrEqual(220);

  const target = await field.getByRole("button", { name: /^Remove / }).evaluate((element) => {
    const box = element.getBoundingClientRect();
    return { width: Math.round(box.width), height: Math.round(box.height) };
  });
  expect(target).toEqual({ width: 44, height: 44 });

  expect(errors).toEqual([]);
});

test("disabled file drops cancel browser navigation without accepting files", async ({ page }) => {
  await openHarness(page);
  const field = page.getByTestId("v2-1-d-disabled");
  const canceled = await zoneOf(field).evaluate((element) => {
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(new File(["file"], "blocked.pdf", { type: "application/pdf" }));
    return ["dragenter", "dragover", "drop"].map((type) => {
      const event = new DragEvent(type, { bubbles: true, cancelable: true, dataTransfer });
      element.dispatchEvent(event);
      return event.defaultPrevented;
    });
  });
  expect(canceled).toEqual([true, true, true]);
  await expect(field.getByRole("listitem")).toHaveText("locked.pdf");
  await expect(field.getByRole("status")).toHaveText("");
});

test("rejected controlled removal cannot consume a later external update", async ({ page }) => {
  await openHarness(page);
  const field = page.getByTestId("v2-1-d-controlled");
  await inputOf(field).setInputFiles([pickerFile("alpha.pdf", 16), pickerFile("beta.pdf", 16)]);
  await page.getByTestId("v2-1-d-freeze").click();
  const remove = field.getByRole("button", { name: "Remove alpha.pdf" });
  await remove.focus();
  await remove.press("Enter");
  await expect(remove).toBeFocused();
  await expect(field.getByRole("listitem")).toHaveCount(2);
  await expect(field.getByRole("status")).toHaveText("");
  const outside = page.getByTestId("upload-external-update");
  await outside.click();
  await expect(outside).toBeFocused();
  await expect(field.getByRole("listitem")).toHaveCount(3);
  await expect(field.getByRole("status")).toHaveText("");
});

test("rejection-only attempts replace success and repeat as fresh live content", async ({ page }) => {
  await openHarness(page);
  const field = page.getByTestId("v2-1-d-single");
  const status = field.getByRole("status");
  await inputOf(field).setInputFiles(pickerFile("good.pdf", 16));
  await expect(status).toContainText("Added 1 file.");
  await inputOf(field).setInputFiles(pickerFile("notes.txt", 16, "text/plain"));
  await expect(status).toContainText("notes.txt");
  await expect(status).not.toContainText("Added");
  const previousMessage = await status.locator("span").elementHandle();
  expect(previousMessage).not.toBeNull();
  await inputOf(field).setInputFiles(pickerFile("notes.txt", 16, "text/plain"));
  await expect(status).toContainText("notes.txt");
  expect(await previousMessage!.evaluate((element) => element.isConnected)).toBe(false);
  await expect(field.getByRole("listitem")).toHaveText("good.pdf");
});

test("the removal mark presses inside an unchanged full-sized target", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await openHarness(page);
  const button = page.getByTestId("v2-1-d-removal").getByRole("button", { name: "Remove alpha.pdf" });
  await button.scrollIntoViewIfNeeded();
  const before = await button.boundingBox();
  expect(before).not.toBeNull();
  expect(before!.width).toBeGreaterThanOrEqual(44);
  expect(before!.height).toBeGreaterThanOrEqual(44);
  await page.mouse.move(before!.x + before!.width / 2, before!.y + before!.height / 2);
  await page.mouse.down();
  await expect.poll(() => button.locator("span").evaluate((element) => new DOMMatrix(getComputedStyle(element).transform).a)).toBeLessThan(0.99);
  const during = await button.boundingBox();
  expect(during!.width).toBeCloseTo(before!.width, 2);
  expect(during!.height).toBeCloseTo(before!.height, 2);
  await page.mouse.move(0, 0);
  await page.mouse.up();
});

test("file changes are announced without a visible log; rejection and clear affordances stay visible", async ({ page, errors }) => {
  await openHarness(page);
  const field = page.getByTestId("v2-1-d-single");
  await inputOf(field).setInputFiles(pickerFile("notes.pdf", 16));
  const status = field.getByRole("status");
  await expect(status).toContainText("Added 1 file.");
  const message = status.getByText("Added 1 file.", { exact: true });
  expect(await message.evaluate(element => getComputedStyle(element).clip)).toBe("rect(0px, 0px, 0px, 0px)");
  expect((await status.boundingBox())!.height).toBe(0);
  const clear = field.getByRole("button", { name: "Clear files", exact: true });
  await expect(clear).toBeVisible();
  const resting = await clear.evaluate(element => {
    const css = getComputedStyle(element);
    return { fill: css.backgroundColor, shadow: css.boxShadow };
  });
  expect(resting.fill).not.toBe("rgba(0, 0, 0, 0)");
  expect(resting.shadow).not.toBe("none");
  await inputOf(field).setInputFiles(pickerFile("notes.txt", 16, "text/plain"));
  await expect(status.getByText("notes.txt is not an accepted file type.", { exact: true })).toBeVisible();
  expect((await status.boundingBox())!.height).toBeGreaterThan(1);
  expect(errors).toEqual([]);
});
