import { expect, type Locator, type Page } from "@playwright/test";

import { goToProfile, loginAsSeededUser, logoutUser } from "../auth/session";

interface ProfileRestoreContext {
  page: Page;
  input: Locator;
  originalValue: string;
}

interface ProfileRestoreOptions {
  login?: (page: Page) => Promise<void>;
}

export async function withProfileFieldRestore(
  page: Page,
  label: string,
  fn: (context: ProfileRestoreContext) => Promise<void>,
  options: ProfileRestoreOptions = {}
) {
  const login = options.login ?? loginAsSeededUser;

  await login(page);
  await goToProfile(page);

  const input = page.getByLabel(label, { exact: true });
  const originalValue = await input.inputValue();

  try {
    await fn({ page, input, originalValue });
  } finally {
    await login(page);
    await goToProfile(page);

    const restoreInput = page.getByLabel(label, { exact: true });
    if ((await restoreInput.inputValue()) !== originalValue) {
      await restoreInput.fill(originalValue);
      await page.getByRole("button", { name: "Guardar cambios" }).click();
      await expect(restoreInput).toHaveValue(originalValue);
    }

    await logoutUser(page);
  }
}

export async function withProfileRestore(
  page: Page,
  fn: (context: ProfileRestoreContext) => Promise<void>
) {
  await withProfileFieldRestore(page, "Correo electrónico", async ({ page: profilePage, input, originalValue }) => {
    await fn({ page: profilePage, input, originalValue });
  });
}
