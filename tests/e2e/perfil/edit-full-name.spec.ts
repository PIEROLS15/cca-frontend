import { expect, type Page } from "@playwright/test";
import { authenticatedTest, goToProfile, loginAsSeededUser, logoutUser } from "../auth/session";

async function logoutFlexible(page: Page) {
  await page.locator("button").filter({ has: page.locator(".rounded-full") }).first().click();
  await page.getByRole("menuitem", { name: "Cerrar sesión" }).click();
  await expect(page).toHaveURL(/\/login$/);
}

authenticatedTest("edit profile full name, relogin and restore it", async ({ authenticatedPage: page }) => {
  await goToProfile(page);

  const fullNameInput = page.getByLabel("Nombre completo");
  const originalName = await fullNameInput.inputValue();

  await fullNameInput.fill("Piero Test Updated");
  await page.getByRole("button", { name: "Guardar cambios" }).click();
  await expect(fullNameInput).toHaveValue("Piero Test Updated");

  await logoutFlexible(page);
  await loginAsSeededUser(page);

  await page.goto("/perfil");
  await expect(page.getByRole("heading", { name: "Mi perfil" })).toBeVisible();
  await expect(page.getByLabel("Nombre completo")).toHaveValue("Piero Test Updated");

  await page.getByLabel("Nombre completo").fill(originalName);
  await page.getByRole("button", { name: "Guardar cambios" }).click();
  await expect(page.getByLabel("Nombre completo")).toHaveValue(originalName);

  await logoutUser(page);
  await loginAsSeededUser(page);
  await goToProfile(page);

  await expect(page.getByLabel("Nombre completo")).toHaveValue(originalName);
  await logoutUser(page);
});
