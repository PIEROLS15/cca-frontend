import { expect, type Page } from "@playwright/test";

import { loginAsSeededUser } from "../auth/session";

const SECTORES_PATH = "/sectores";
const SEARCH_PLACEHOLDER = "Buscar por nombre...";

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function getSectorRow(page: Page, name: string) {
  return page.getByRole("row", { name: new RegExp(`^${escapeRegExp(name)}(?!\\sEDITADO)`) });
}

export async function goToSectores(page: Page) {
  await loginAsSeededUser(page);
  await page.goto(SECTORES_PATH);
  await expect(page.getByRole("heading", { name: "Sectores" })).toBeVisible();
}

export async function searchSector(page: Page, name: string) {
  await page.getByPlaceholder(SEARCH_PLACEHOLDER).fill(name);
}

export async function clearSectorSearch(page: Page) {
  await page.getByRole("button", { name: "Limpiar" }).click();
}

export async function expectSectorVisible(page: Page, name: string) {
  await expect(getSectorRow(page, name)).toBeVisible();
}

export async function isSectorVisible(page: Page, name: string) {
  return getSectorRow(page, name).isVisible().catch(() => false);
}

export async function createSector(page: Page, name: string) {
  await page.getByRole("button", { name: "Agregar sector" }).click();

  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();

  const input = dialog.getByRole("textbox", { name: "Nombre" });
  await input.fill(name);
  await dialog.getByRole("button", { name: "Crear sector" }).click();

  await expect(dialog).not.toBeVisible({ timeout: 10000 });
}

export async function deleteSectorIfVisible(page: Page, name: string) {
  await searchSector(page, name);

  const row = getSectorRow(page, name);
  if (!(await row.isVisible().catch(() => false))) {
    return false;
  }

  await row.getByRole("button", { name: new RegExp(`Eliminar.*${escapeRegExp(name)}`) }).click();
  await page.getByRole("button", { name: "Sí, eliminar" }).click();
  await expect(row).not.toBeVisible({ timeout: 10000 });
  return true;
}

export async function renameSectorIfVisible(page: Page, fromName: string, toName: string) {
  await searchSector(page, fromName);

  const row = getSectorRow(page, fromName);
  if (!(await row.isVisible().catch(() => false))) {
    return false;
  }

  await row.getByRole("button", { name: new RegExp(`Editar.*${escapeRegExp(fromName)}`) }).click();

  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();

  const input = dialog.locator("#sector-name");
  await input.fill(toName);
  await dialog.getByRole("button", { name: "Guardar cambios" }).click();

  await expect(dialog).not.toBeVisible({ timeout: 10000 });
  await searchSector(page, toName);
  await expectSectorVisible(page, toName);
  return true;
}
