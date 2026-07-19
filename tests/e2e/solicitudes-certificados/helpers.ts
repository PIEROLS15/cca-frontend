import { expect, type Page } from "@playwright/test";

import { loginAsSeededUser } from "../auth/session";

const SOLICITUDES_PATH = "/solicitudes-certificados";
const SEARCH_PLACEHOLDER = "Buscar por código o documento del cliente...";

export type CertificateRequestStatus =
  | "Recepcionado"
  | "Por Firmar"
  | "Por Recoger"
  | "Entregado"
  | "Observado";

export async function goToSolicitudesCertificados(page: Page) {
  await loginAsSeededUser(page);
  await page.goto(SOLICITUDES_PATH);
  await expect(page.getByRole("heading", { name: "Solicitudes de Certificados" })).toBeVisible();
}

export async function searchCertificateRequest(page: Page, query: string) {
  await page.getByPlaceholder(SEARCH_PLACEHOLDER).fill(query);
}

export async function clearCertificateRequestSearch(page: Page) {
  await page.getByRole("button", { name: "Limpiar" }).click();
}

export async function expectCertificateRequestVisible(page: Page, text: string) {
  await expect(page.getByRole("row").filter({ hasText: text })).toBeVisible();
}

export async function expectCertificateRequestNotVisible(page: Page, text: string) {
  await expect(page.getByRole("row").filter({ hasText: text })).not.toBeVisible();
}

export async function changeCertificateRequestStatus(
  page: Page,
  rowText: string,
  newStatus: CertificateRequestStatus,
  note?: string,
) {
  const row = page.getByRole("row").filter({ hasText: rowText });
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

export async function deleteCertificateRequestIfVisible(page: Page, rowText: string) {
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
