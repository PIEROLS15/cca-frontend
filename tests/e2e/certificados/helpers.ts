import { expect, type Page } from "@playwright/test";

import { loginAsSeededUser } from "../auth/session";

const CERTIFICADOS_PATH = "/certificados";
const SEARCH_PLACEHOLDER = "Código o nombre...";

export type CertificateStatus =
  | "Recepcionado"
  | "Por Firmar"
  | "Por Recoger"
  | "Entregado"
  | "Observado";

export async function goToCertificados(page: Page) {
  await loginAsSeededUser(page);
  await page.goto(CERTIFICADOS_PATH);
  await expect(page.getByRole("heading", { name: "Certificados" })).toBeVisible();
}

export async function searchCertificate(page: Page, query: string) {
  await page.getByPlaceholder(SEARCH_PLACEHOLDER).fill(query);
}

export async function searchByDocument(page: Page, doc: string) {
  await page.getByPlaceholder("DNI / RUC").fill(doc);
}

export async function searchByMz(page: Page, mz: string) {
  await page.getByPlaceholder("Mz").fill(mz);
}

export async function searchByLote(page: Page, lote: string) {
  await page.getByPlaceholder("Lote").fill(lote);
}

export async function filterByUbicacion(page: Page, sectorName: string) {
  const trigger = page.locator(".lg\\:w-56").first();
  await trigger.click();
  await page.getByRole("option", { name: sectorName, exact: true }).click();
}

export async function filterByRole(page: Page, roleName: string) {
  const trigger = page.locator(".lg\\:w-44").first();
  await trigger.click();
  await page.getByRole("option", { name: roleName, exact: true }).click();
}

export async function clearAllFilters(page: Page) {
  await page.getByRole("button", { name: "Limpiar" }).click();
}

export async function expectCertificateVisible(page: Page, text: string) {
  await expect(page.getByRole("row").filter({ hasText: text })).toBeVisible();
}

export async function expectCertificateNotVisible(page: Page, text: string) {
  await expect(page.getByRole("row").filter({ hasText: text })).not.toBeVisible();
}

export async function changeCertificateStatus(
  page: Page,
  certText: string,
  newStatus: CertificateStatus,
  note?: string,
) {
  const row = page.getByRole("row").filter({ hasText: certText });
  await row.getByRole("button", { name: "Cambiar estado" }).click();

  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();

  await dialog.getByRole("combobox").click();
  await page.getByRole("option", { name: newStatus }).click();

  if (newStatus === "Observado" && note) {
    await dialog.locator("#status-note").fill(note);
  }

  await dialog.getByRole("button", { name: "Guardar estado" }).click();
  await expect(dialog).not.toBeVisible({ timeout: 10000 });
}

export async function deleteCertificateIfVisible(page: Page, certText: string) {
  const row = page.getByRole("row").filter({ hasText: certText });
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
