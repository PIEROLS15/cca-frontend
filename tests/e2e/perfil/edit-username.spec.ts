import { expect, type Page } from "@playwright/test";
import { authenticatedTest, goToProfile, loginAsSeededUser, logoutUser } from "../auth/session";

async function loginAs(page: Page, username: string, password: string) {
  await page.goto("/login");
  await page.getByLabel("Usuario").fill(username);
  await page.getByLabel("Contraseña").fill(password);
  await page.getByRole("button", { name: "Iniciar sesión" }).click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByText("Panel general")).toBeVisible({ timeout: 30000 });
}

authenticatedTest("edit profile username, relogin and restore it", async ({ authenticatedPage: page }) => {
  await goToProfile(page);

  const usernameInput = page.getByLabel("Nombre de usuario");
  const originalUsername = await usernameInput.inputValue();

  await usernameInput.fill("pierols_updated");
  await page.getByRole("button", { name: "Guardar cambios" }).click();
  await expect(page.getByText("Perfil actualizado")).toBeVisible({ timeout: 10000 });
  await expect(usernameInput).toHaveValue("pierols_updated");

  await logoutUser(page);
  await loginAs(page, "pierols_updated", "123456");

  await page.goto("/perfil");
  await expect(page.getByRole("heading", { name: "Mi perfil" })).toBeVisible();
  await expect(page.getByLabel("Nombre de usuario")).toHaveValue("pierols_updated");

  await page.getByLabel("Nombre de usuario").fill(originalUsername);
  await page.getByRole("button", { name: "Guardar cambios" }).click();
  await expect(page.getByText("Perfil actualizado")).toBeVisible({ timeout: 10000 });
  await expect(page.getByLabel("Nombre de usuario")).toHaveValue(originalUsername);

  await logoutUser(page);
  await loginAsSeededUser(page);
  await goToProfile(page);

  await expect(page.getByLabel("Nombre de usuario")).toHaveValue(originalUsername);
  await logoutUser(page);
});
