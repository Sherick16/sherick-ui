import { expect, test } from "./fixtures";

test.beforeEach(async ({ page, errors }) => {
  await page.goto("/examples/settings");
  await page.waitForFunction(() => document.documentElement.dataset.hydrated === "true");
  expect(errors).toEqual([]);
});

test("settings validate on submit, save a baseline and cancel edits", async ({ page, errors }) => {
  const name = page.getByRole("textbox", { name: "Workspace name" });
  const email = page.getByRole("textbox", { name: "Contact email" });
  const description = page.getByRole("textbox", { name: "Description" });
  const save = page.getByRole("button", { name: "Save changes" });
  const cancel = page.getByRole("button", { name: "Cancel", exact: true });

  await expect(save).toBeDisabled();
  await expect(cancel).toBeDisabled();
  await name.fill(" ");
  await expect(save).toBeEnabled();
  await save.click();
  await expect(name).toHaveAttribute("aria-invalid", "true");
  await expect(name).toHaveAttribute("aria-describedby", /.+/);
  await expect(name).toBeFocused();
  await expect(page.getByText("Enter at least three characters.")).toBeVisible();

  await name.fill("Field team");
  await expect(page.getByText("Enter at least three characters.")).toHaveCount(0);
  await email.fill("not-an-email");
  await save.click();
  await expect(email).toBeFocused();
  await expect(email).toHaveAttribute("aria-invalid", "true");
  await expect(page.getByText("Enter a valid email address.")).toBeVisible();
  await email.fill("team@example.org");
  await save.click();
  await expect(page.getByRole("status").filter({ hasText: "Changes saved." })).toBeVisible();
  await expect(save).toBeDisabled();
  await expect(cancel).toBeDisabled();

  await description.fill("Unsaved changes");
  await cancel.click();
  await expect(description).toHaveValue("Projects and shared work for the operations team.");
  await expect(name).toHaveValue("Field team");
  await expect(email).toHaveValue("team@example.org");
  await expect(save).toBeDisabled();
  const summary = page.getByRole("switch", { name: "Weekly summary" });
  await summary.click();
  await expect(summary).not.toBeChecked();
  await expect(save).toBeEnabled();
  await cancel.click();
  await expect(summary).toBeChecked();
  await expect(save).toBeDisabled();
  await expect(page.getByRole("status").filter({ hasText: "Changes saved." })).toHaveCount(0);
  expect(errors).toEqual([]);
});

test("narrow destructive confirmation is explicit and returns focus", async ({ page, errors }) => {
  await page.setViewportSize({ width: 320, height: 700 });
  const trigger = page.getByRole("button", { name: "Revoke all tokens" });
  await trigger.click();
  const dialog = page.getByRole("alertdialog", { name: "Revoke all access tokens?" });
  await expect(dialog).toBeVisible();
  await expect(dialog).toContainText("cannot be recovered");
  await expect(dialog.getByRole("button", { name: "Keep tokens" })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
  await expect(trigger).toBeFocused();
  await trigger.click();
  await dialog.getByRole("button", { name: "Revoke all tokens" }).click();
  await expect(page.getByRole("status").filter({ hasText: "All access tokens revoked." })).toBeVisible();
  await expect(dialog).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
  expect(errors).toEqual([]);
});
