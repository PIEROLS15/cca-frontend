import { expect } from "@playwright/test";
import { authenticatedTest, goToProfile, loginAsSeededUser, logoutUser } from "../auth/session";

authenticatedTest("edit profile DNI, relogin and restore it", async ({ authenticatedPage: page }) => {
  await goToProfile(page);

  const dniInput = page.getByLabel("DNI");
  const originalDni = await dniInput.inputValue();

  await dniInput.fill("99999999");
  await page.getByRole("button", { name: "Guardar cambios" }).click();
  await expect(dniInput).toHaveValue("99999999");

  await logoutUser(page);
  await loginAsSeededUser(page);
  await goToProfile(page);

  await expect(page.getByLabel("DNI")).toHaveValue("99999999");

  await page.getByLabel("DNI").fill(originalDni);
  await page.getByRole("button", { name: "Guardar cambios" }).click();
  await expect(page.getByLabel("DNI")).toHaveValue(originalDni);

  await logoutUser(page);
  await loginAsSeededUser(page);
  await goToProfile(page);

  await expect(page.getByLabel("DNI")).toHaveValue(originalDni);
  await logoutUser(page);
});
