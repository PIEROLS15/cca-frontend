import { expect, type Page } from "@playwright/test";

import { loginAsSeededUser } from "../auth/session";
import type { ClientPayload, ClientType } from "@/types/client";

const CLIENTES_PATH = "/clientes";
const NAME_PLACEHOLDER = "Nombre del cliente...";
const DOCUMENT_PLACEHOLDER = "DNI / RUC / código";

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function getClientRow(page: Page, name: string) {
  return page.getByRole("row", { name: new RegExp(escapeRegExp(name)) });
}

export async function goToClientes(page: Page) {
  await loginAsSeededUser(page);
  await page.goto(CLIENTES_PATH);
  await expect(page.getByRole("heading", { name: "Clientes" })).toBeVisible();
}

export async function searchClientByName(page: Page, name: string) {
  await page.getByPlaceholder(NAME_PLACEHOLDER).fill(name);
}

export async function searchClientByDocument(page: Page, doc: string) {
  await page.getByPlaceholder(DOCUMENT_PLACEHOLDER).fill(doc);
}

export async function filterClientByType(page: Page, type: ClientType) {
  const trigger = page.getByRole("combobox").filter({ hasText: /Todos los tipos|Comunero|Tercero|Tipo de cliente/ }).first();
  await trigger.click();
  await page.getByRole("option", { name: type }).click();
  await expect(page.getByRole("row").getByText(type).first()).toBeVisible({ timeout: 10000 });
}

export async function clearClientFilters(page: Page) {
  await page.getByRole("button", { name: "Limpiar" }).click();
}

export async function expectClientVisible(page: Page, name: string) {
  await expect(getClientRow(page, name)).toBeVisible();
}

export async function expectClientNotVisible(page: Page, name: string) {
  await expect(getClientRow(page, name)).not.toBeVisible();
}

export async function createClient(page: Page, payload: ClientPayload) {
  await page.getByRole("button", { name: "Agregar cliente" }).click();

  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();

  await dialog.locator("#client-full-name").fill(payload.fullName);

  if (payload.noDocument) {
    const checkbox = dialog.locator("label", { hasText: "No es persona/empresa" }).locator("input[type='checkbox']");
    if (!(await checkbox.isChecked())) {
      await checkbox.click();
    }
  } else {
    await dialog.locator("#client-document").fill(payload.documentNumber);
  }

  if (payload.phone) {
    await dialog.locator("#client-phone").fill(payload.phone);
  }

  if (payload.address) {
    await dialog.locator("#client-address").fill(payload.address);
  }

  if (payload.clientType) {
    const typeSelect = dialog.locator("#client-type");
    await typeSelect.click();
    await page.getByRole("option", { name: payload.clientType }).click();
  }

  const createResponse = page.waitForResponse(
    (response) => response.request().method() === "POST" && response.url().includes("/api/clients"),
    { timeout: 10000 }
  );
  await dialog.getByRole("button", { name: "Crear cliente" }).click();
  const response = await createResponse;
  if (!response.ok()) {
    const body = await response.text().catch(() => "<no body>");
    throw new Error(`Failed to create client: ${response.status()} ${body}`);
  }

  await expect(dialog).not.toBeVisible({ timeout: 10000 });
}

export async function deleteClientIfVisible(page: Page, name: string) {
  await searchClientByName(page, name);

  const row = getClientRow(page, name);
  if (!(await row.isVisible().catch(() => false))) {
    return false;
  }

  const previewResponse = page.waitForResponse(
    (response) => response.url().includes("/delete-preview"),
    { timeout: 10000 }
  ).catch(() => null);

  await row.getByRole("button", { name: new RegExp(`Eliminar.*${escapeRegExp(name)}`) }).click();
  await previewResponse;

  await page.getByRole("button", { name: "Sí, eliminar" }).click();
  await expect(row).not.toBeVisible({ timeout: 10000 });
  return true;
}

export async function renameClientIfVisible(page: Page, fromName: string, toName: string) {
  await searchClientByName(page, fromName);

  const row = getClientRow(page, fromName);
  if (!(await row.isVisible().catch(() => false))) {
    return false;
  }

  await row.getByRole("button", { name: new RegExp(`Editar.*${escapeRegExp(fromName)}`) }).click();

  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();

  const nameInput = dialog.locator("#client-full-name");
  await nameInput.fill(toName);

  const updateResponse = page.waitForResponse(
    (response) => response.request().method() === "PUT" && response.url().includes("/api/clients"),
    { timeout: 10000 }
  );
  await dialog.getByRole("button", { name: "Guardar cambios" }).click();
  const response = await updateResponse;
  if (!response.ok()) {
    const body = await response.text().catch(() => "<no body>");
    throw new Error(`Failed to update client: ${response.status()} ${body}`);
  }

  await expect(dialog).not.toBeVisible({ timeout: 10000 });
  await searchClientByName(page, toName);
  await expectClientVisible(page, toName);
  return true;
}
