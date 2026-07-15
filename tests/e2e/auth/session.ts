/* eslint-disable react-hooks/rules-of-hooks */
import { expect, test as base, type Page } from "@playwright/test";

function requireEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} no está definida`);
  }

  return value;
}

export async function loginAsSeededUser(page: Page) {
  await page.goto("/login");

  await expect(page.getByRole("button", { name: "Iniciar sesión" })).toBeVisible();

  await page.getByLabel("Usuario").fill(requireEnv("E2E_USERNAME"));
  await page.getByLabel("Contraseña").fill(requireEnv("E2E_PASSWORD"));
  await page.getByRole("button", { name: "Iniciar sesión" }).click();

  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByText("Panel general")).toBeVisible({ timeout: 30000 });
}

export async function openUserMenu(page: Page) {
  await page.getByRole("button", { name: "Piero Admin PD" }).click();
}

export async function goToProfile(page: Page) {
  await openUserMenu(page);
  await page.getByRole("menuitem", { name: "Mi perfil" }).click();

  await expect(page.getByRole("heading", { name: "Mi perfil" })).toBeVisible();
}

export async function logoutUser(page: Page) {
  await openUserMenu(page);
  await page.getByRole("menuitem", { name: "Cerrar sesión" }).click();

  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole("button", { name: "Iniciar sesión" })).toBeVisible();
}

export const authenticatedTest = base.extend<{
  authenticatedPage: Page;
}>({
  authenticatedPage: async ({ page }, use) => {
    await loginAsSeededUser(page);
    await use(page);
  },
});
