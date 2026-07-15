import { expect } from "@playwright/test";
import { authenticatedTest, goToProfile, loginAsSeededUser, logoutUser } from "../auth/session";

authenticatedTest("edit profile email, relogin and restore it", async ({ authenticatedPage: page }) => {
  await goToProfile(page);

  const emailInput = page.getByLabel("Correo electrónico");
  const originalEmail = await emailInput.inputValue();
  const updatedEmail = "pierodanielllanossanchez12@gmail.com";

  await emailInput.fill(updatedEmail);
  await page.getByRole("button", { name: "Guardar cambios" }).click();
  await expect(emailInput).toHaveValue(updatedEmail);

  await logoutUser(page);
  await loginAsSeededUser(page);
  await goToProfile(page);

  await expect(page.getByLabel("Correo electrónico")).toHaveValue(updatedEmail);

  await page.getByLabel("Correo electrónico").fill(originalEmail);
  await page.getByRole("button", { name: "Guardar cambios" }).click();
  await expect(page.getByLabel("Correo electrónico")).toHaveValue(originalEmail);

  await logoutUser(page);
  await loginAsSeededUser(page);
  await goToProfile(page);

  await expect(page.getByLabel("Correo electrónico")).toHaveValue(originalEmail);
  await logoutUser(page);
});
