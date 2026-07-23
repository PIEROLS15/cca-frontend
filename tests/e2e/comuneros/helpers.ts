import { expect, type Page } from "@playwright/test";

import { loginAsSeededUser } from "../auth/session";

const COMUNEROS_PATH = "/comuneros";
const SEARCH_PLACEHOLDER = "Buscar por carnet, documento, teléfono o nombre...";

export async function goToComuneros(page: Page) {
  await loginAsSeededUser(page);
  await page.goto(COMUNEROS_PATH);
  await expect(page.getByRole("heading", { name: "Comuneros Empadronados" })).toBeVisible();
}

export async function searchComunero(page: Page, query: string) {
  await page.getByPlaceholder(SEARCH_PLACEHOLDER).fill(query);
}

export async function clearComuneroSearch(page: Page) {
  await page.getByRole("button", { name: "Limpiar" }).click();
}

export async function expectComuneroVisible(page: Page, name: string) {
  await expect(page.getByRole("row").filter({ hasText: name })).toBeVisible();
}

export async function expectComuneroNotVisible(page: Page, name: string) {
  await expect(page.getByRole("row").filter({ hasText: name })).not.toBeVisible();
}

export async function getComuneroRow(page: Page, name: string) {
  return page.getByRole("row").filter({ hasText: name });
}
