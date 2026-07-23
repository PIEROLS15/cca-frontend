import { expect, type Page } from "@playwright/test";

import { loginAsSeededUser } from "../auth/session";

const SOLICITUDES_PATH = "/solicitudes-acta";
const SEARCH_PLACEHOLDER = "Buscar por código, certificado, comprador, ubicación o descripción...";

export async function goToSolicitudesActa(page: Page) {
  await loginAsSeededUser(page);
  await page.goto(SOLICITUDES_PATH);
  await expect(page.getByRole("heading", { name: "Solicitudes de Acta de Asamblea" })).toBeVisible();
}

export async function searchAssemblyRecord(page: Page, query: string) {
  await page.getByPlaceholder(SEARCH_PLACEHOLDER).fill(query);
}

export async function clearAssemblyRecordSearch(page: Page) {
  await page.getByRole("button", { name: "Limpiar" }).click();
}

export async function expectAssemblyRecordVisible(page: Page, text: string) {
  await expect(page.getByRole("row").filter({ hasText: text })).toBeVisible();
}

export async function expectAssemblyRecordNotVisible(page: Page, text: string) {
  await expect(page.getByRole("row").filter({ hasText: text })).not.toBeVisible();
}

export async function changeAssemblyRecordStatus(
  page: Page,
  rowText: string,
  newStatus: "En Proceso" | "Por Recoger" | "Entregado",
) {
  const row = page.getByRole("row").filter({ hasText: rowText });
  await row.getByRole("button", { name: "Cambiar estado" }).click();

  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();

  await dialog.getByRole("combobox").click();
  await page.getByRole("option", { name: newStatus }).click();

  await dialog.getByRole("button", { name: "Guardar estado" }).click();
  await expect(dialog).not.toBeVisible({ timeout: 10000 });
}

export async function deleteAssemblyRecordIfVisible(page: Page, rowText: string) {
  const row = page.getByRole("row").filter({ hasText: rowText });
  if (!(await row.isVisible().catch(() => false))) {
    return false;
  }

  await row.getByRole("button", { name: new RegExp(`Eliminar`) }).click();

  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await dialog.getByRole("button", { name: "Sí, eliminar" }).click();
  await expect(row).not.toBeVisible({ timeout: 10000 });
  return true;
}
