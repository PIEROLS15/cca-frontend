import { expect, type Page } from "@playwright/test";

import { loginAsSeededUser } from "../auth/session";

const TIPOS_TERRENO_PATH = "/tipos-terreno";
const SEARCH_PLACEHOLDER = "Buscar por nombre...";

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function getTerrainTypeRow(page: Page, name: string) {
  return page.getByRole("row", { name: new RegExp(`^${escapeRegExp(name)}(?!\\sEDITADO)`) });
}

export async function goToTiposTerreno(page: Page) {
  await loginAsSeededUser(page);
  await page.goto(TIPOS_TERRENO_PATH);
  await expect(page.getByRole("heading", { name: "Tipos de Terreno" })).toBeVisible();
}

export async function searchTerrainType(page: Page, name: string) {
  await page.getByPlaceholder(SEARCH_PLACEHOLDER).fill(name);
}

export async function clearTerrainTypeSearch(page: Page) {
  await page.getByRole("button", { name: "Limpiar" }).click();
}

export async function expectTerrainTypeVisible(page: Page, name: string) {
  await expect(getTerrainTypeRow(page, name)).toBeVisible();
}

export async function createTerrainType(page: Page, name: string) {
  await page.getByRole("button", { name: "Agregar tipo" }).click();

  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();

  const input = dialog.getByRole("textbox", { name: "Nombre" });
  await input.fill(name);
  const createResponse = page.waitForResponse(
    (response) => response.request().method() === "POST" && response.url().includes("/api/terrain-types"),
    { timeout: 10000 }
  );
  await dialog.getByRole("button", { name: "Crear tipo de terreno" }).click();
  const response = await createResponse;
  if (!response.ok()) {
    const body = await response.text().catch(() => "<no body>");
    throw new Error(`Failed to create terrain type: ${response.status()} ${body}`);
  }

  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden({ timeout: 10000 });
}

export async function deleteTerrainTypeIfVisible(page: Page, name: string) {
  await searchTerrainType(page, name);

  const row = getTerrainTypeRow(page, name);
  if (!(await row.isVisible().catch(() => false))) {
    return false;
  }

  await row.getByRole("button", { name: new RegExp(`Eliminar.*${escapeRegExp(name)}`) }).click();
  await page.getByRole("button", { name: "Sí, eliminar" }).click();
  await expect(row).not.toBeVisible({ timeout: 10000 });
  return true;
}

export async function renameTerrainTypeIfVisible(page: Page, fromName: string, toName: string) {
  await searchTerrainType(page, fromName);

  const row = getTerrainTypeRow(page, fromName);
  if (!(await row.isVisible().catch(() => false))) {
    return false;
  }

  await row.getByRole("button", { name: new RegExp(`Editar.*${escapeRegExp(fromName)}`) }).click();

  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();

  const input = dialog.locator("#terrain-type-name");
  await input.fill(toName);
  await dialog.getByRole("button", { name: "Guardar cambios" }).click();

  await expect(dialog).not.toBeVisible({ timeout: 10000 });
  await searchTerrainType(page, toName);
  await expectTerrainTypeVisible(page, toName);
  return true;
}
