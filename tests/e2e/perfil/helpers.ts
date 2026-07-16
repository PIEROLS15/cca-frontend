import { expect, type Locator, type Page } from "@playwright/test";

import { goToProfile, loginAsSeededUser, logoutUser } from "../auth/session";

interface ProfileRestoreContext {
  page: Page;
  emailInput: Locator;
  originalEmail: string;
}

export async function withProfileRestore(
  page: Page,
  fn: (context: ProfileRestoreContext) => Promise<void>
) {
  await loginAsSeededUser(page);
  await goToProfile(page);

  const emailInput = page.getByLabel("Correo electrónico");
  const originalEmail = await emailInput.inputValue();

  try {
    await fn({ page, emailInput, originalEmail });
  } finally {
    await loginAsSeededUser(page);
    await goToProfile(page);

    const restoreEmailInput = page.getByLabel("Correo electrónico");
    if ((await restoreEmailInput.inputValue()) !== originalEmail) {
      await restoreEmailInput.fill(originalEmail);
      await page.getByRole("button", { name: "Guardar cambios" }).click();
      await expect(restoreEmailInput).toHaveValue(originalEmail);
    }

    await logoutUser(page);
  }
}
