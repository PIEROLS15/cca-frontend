import { expect, test } from "@playwright/test";

import { loginWithCredentials, logoutUser } from "../auth/session";

test("change password, relogin and restore original", async ({ page }) => {
  await loginWithCredentials(page, "pierols", "123456");
  await page.goto("/perfil");
  await expect(page.getByRole("heading", { name: "Mi perfil" })).toBeVisible();

  await page.getByLabel("Contraseña actual").fill("123456");
  await page.getByRole("button", { name: "Verificar" }).click();
  await expect(page.getByRole("button", { name: "Verificado" })).toBeVisible({ timeout: 10000 });

  await page.getByLabel("Nueva contraseña", { exact: true }).fill("nueva123456");
  await page.getByLabel("Confirmar nueva contraseña").fill("nueva123456");
  await page.getByRole("button", { name: "Actualizar contraseña" }).click();

  await logoutUser(page);
  await loginWithCredentials(page, "pierols", "nueva123456");
  await page.goto("/perfil");
  await expect(page.getByRole("heading", { name: "Mi perfil" })).toBeVisible();

  await page.getByLabel("Contraseña actual").fill("nueva123456");
  await page.getByRole("button", { name: "Verificar" }).click();
  await expect(page.getByRole("button", { name: "Verificado" })).toBeVisible({ timeout: 10000 });

  await page.getByLabel("Nueva contraseña", { exact: true }).fill("123456");
  await page.getByLabel("Confirmar nueva contraseña").fill("123456");
  await page.getByRole("button", { name: "Actualizar contraseña" }).click();

  await logoutUser(page);
  await loginWithCredentials(page, "pierols", "123456");
  await logoutUser(page);
});
