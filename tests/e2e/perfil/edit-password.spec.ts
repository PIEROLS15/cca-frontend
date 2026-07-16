import { expect } from "@playwright/test";
import { authenticatedTest, goToProfile, loginAsSeededUser, logoutUser } from "../auth/session";

authenticatedTest("change password, relogin and restore original", async ({ authenticatedPage: page }) => {
  await goToProfile(page);

  await page.getByLabel("Contraseña actual").fill("123456");
  await page.getByRole("button", { name: "Verificar" }).click();
  await expect(page.getByRole("button", { name: "Verificado" })).toBeVisible({ timeout: 10000 });

  await page.getByLabel("Nueva contraseña", { exact: true }).fill("nueva123456");
  await page.getByLabel("Confirmar nueva contraseña").fill("nueva123456");
  await page.getByRole("button", { name: "Actualizar contraseña" }).click();

  await logoutUser(page);

  await page.goto("/login");
  await page.getByLabel("Usuario").fill("pierols");
  await page.getByLabel("Contraseña").fill("nueva123456");
  await page.getByRole("button", { name: "Iniciar sesión" }).click();
  await expect(page).toHaveURL(/\/$/);

  await goToProfile(page);

  await page.getByLabel("Contraseña actual").fill("nueva123456");
  await page.getByRole("button", { name: "Verificar" }).click();
  await expect(page.getByRole("button", { name: "Verificado" })).toBeVisible({ timeout: 10000 });

  await page.getByLabel("Nueva contraseña", { exact: true }).fill("123456");
  await page.getByLabel("Confirmar nueva contraseña").fill("123456");
  await page.getByRole("button", { name: "Actualizar contraseña" }).click();

  await logoutUser(page);

  await page.goto("/login");
  await page.getByLabel("Usuario").fill("pierols");
  await page.getByLabel("Contraseña").fill("123456");
  await page.getByRole("button", { name: "Iniciar sesión" }).click();
  await expect(page).toHaveURL(/\/$/);

  await logoutUser(page);
});
