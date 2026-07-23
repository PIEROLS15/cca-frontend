import { expect, type Page } from "@playwright/test";

import { loginAsSeededUser } from "../auth/session";
import type { UserPayload } from "@/types/user";

const USUARIOS_PATH = "/usuarios";
const SEARCH_PLACEHOLDER = "Buscar por nombre, usuario o correo...";

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function getUserRow(page: Page, name: string) {
  return page.getByRole("row", { name: new RegExp(escapeRegExp(name)) });
}

export async function goToUsuarios(page: Page) {
  await loginAsSeededUser(page);
  await page.goto(USUARIOS_PATH);
  await expect(page.getByRole("heading", { name: "Usuarios" })).toBeVisible();
}

export async function searchUser(page: Page, query: string) {
  await page.getByPlaceholder(SEARCH_PLACEHOLDER).fill(query);
}

export async function clearUserSearch(page: Page) {
  await page.getByRole("button", { name: "Limpiar" }).click();
}

export async function filterByRole(page: Page, roleName: string) {
  const trigger = page.locator('[role="combobox"].lg\\:w-44');
  await trigger.click();
  await page.getByRole("option", { name: roleName }).click();
  await expect(page.getByRole("row").getByText(roleName).first()).toBeVisible({ timeout: 10000 });
}

export async function filterByStatus(page: Page, status: "Activos" | "Inactivos") {
  const trigger = page.locator('[role="combobox"].lg\\:w-40');
  await trigger.click();
  await page.getByRole("option", { name: status, exact: true }).click();
  if (status === "Activos") {
    await expect(page.getByRole("row").getByText("Activo").first()).toBeVisible({ timeout: 10000 });
  }
}

export async function expectUserVisible(page: Page, name: string) {
  await expect(getUserRow(page, name)).toBeVisible();
}

export async function expectUserNotVisible(page: Page, name: string) {
  await expect(getUserRow(page, name)).not.toBeVisible();
}

export async function createUser(page: Page, payload: UserPayload) {
  await page.getByRole("button", { name: "Agregar usuario" }).click();

  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();

  await dialog.locator("#fullName").fill(payload.fullName);
  await dialog.locator("#username").fill(payload.username);
  await dialog.locator("#email").fill(payload.email);
  await dialog.locator("#dni").fill(payload.dni);
  await dialog.locator("#password").fill(payload.password);

  const roleSelect = dialog.locator("#role");
  await roleSelect.click();
  await page.getByRole("option", { name: payload.roleName ?? "Asistente" }).click();

  const createResponse = page.waitForResponse(
    (response) => response.request().method() === "POST" && response.url().includes("/api/users"),
    { timeout: 10000 }
  );
  await dialog.getByRole("button", { name: "Crear usuario" }).click();
  const response = await createResponse;
  if (!response.ok()) {
    const body = await response.text().catch(() => "<no body>");
    throw new Error(`Failed to create user: ${response.status()} ${body}`);
  }

  await expect(dialog).not.toBeVisible({ timeout: 10000 });
}

export async function toggleUserStatus(page: Page, userName: string) {
  const row = getUserRow(page, userName);
  await expect(row).toBeVisible();

  const toggleBtn = row.getByTitle(/Desactivar|Activar/);
  await toggleBtn.click();

  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();

  const confirmBtn = dialog.getByRole("button", { name: /Sí, (desactivar|activar)/ });
  await expect(confirmBtn).toBeEnabled({ timeout: 10000 });

  const toggleResponse = page.waitForResponse(
    (response) => response.request().method() === "PATCH" && response.url().includes("/api/users"),
    { timeout: 10000 }
  );
  await confirmBtn.click();
  await toggleResponse;

  await expect(dialog).not.toBeVisible({ timeout: 10000 });
}

export async function editUser(page: Page, userName: string, changes: { fullName?: string; username?: string; email?: string; dni?: string; roleName?: string }) {
  const row = getUserRow(page, userName);
  await expect(row).toBeVisible();

  await row.getByTitle("Editar", { exact: true }).click();

  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();

  if (changes.fullName !== undefined) {
    await dialog.locator("#fullName").fill(changes.fullName);
  }
  if (changes.username !== undefined) {
    await dialog.locator("#username").fill(changes.username);
  }
  if (changes.email !== undefined) {
    await dialog.locator("#email").fill(changes.email);
  }
  if (changes.dni !== undefined) {
    await dialog.locator("#dni").fill(changes.dni);
  }
  if (changes.roleName !== undefined) {
    const roleSelect = dialog.locator("#role");
    await roleSelect.click();
    await page.getByRole("option", { name: changes.roleName }).click();
  }

  const updateResponse = page.waitForResponse(
    (response) => response.request().method() === "PUT" && response.url().includes("/api/users"),
    { timeout: 10000 }
  );
  await dialog.getByRole("button", { name: "Guardar cambios" }).click();
  const response = await updateResponse;
  if (!response.ok()) {
    const body = await response.text().catch(() => "<no body>");
    throw new Error(`Failed to update user: ${response.status()} ${body}`);
  }

  await expect(dialog).not.toBeVisible({ timeout: 10000 });
}

export async function editCertLimit(page: Page, userName: string, start: string, end: string) {
  const row = getUserRow(page, userName);
  await expect(row).toBeVisible();

  await row.getByTitle("Editar límite").click();

  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();

  await dialog.locator("#limit-start").fill(start);
  await dialog.locator("#limit-end").fill(end);

  const updateResponse = page.waitForResponse(
    (response) => response.request().method() === "PUT" && response.url().includes("/api/users"),
    { timeout: 10000 }
  );
  await dialog.getByRole("button", { name: "Guardar límite" }).click();
  const response = await updateResponse;
  if (!response.ok()) {
    const body = await response.text().catch(() => "<no body>");
    throw new Error(`Failed to update cert limit: ${response.status()} ${body}`);
  }

  await expect(dialog).not.toBeVisible({ timeout: 10000 });
}

export async function deactivateUserIfActive(page: Page, userName: string) {
  await searchUser(page, userName);

  const row = getUserRow(page, userName);
  if (!(await row.isVisible().catch(() => false))) {
    return false;
  }

  const toggleBtn = row.getByTitle("Desactivar");
  if (!(await toggleBtn.isVisible().catch(() => false))) {
    return false;
  }

  await toggleBtn.click();

  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();

  const confirmBtn = dialog.getByRole("button", { name: "Sí, desactivar" });
  await expect(confirmBtn).toBeEnabled({ timeout: 10000 });

  const toggleResponse = page.waitForResponse(
    (response) => response.request().method() === "PATCH" && response.url().includes("/api/users"),
    { timeout: 10000 }
  );
  await confirmBtn.click();
  await toggleResponse;

  await expect(dialog).not.toBeVisible({ timeout: 10000 });
  return true;
}

export async function activateUserIfInactive(page: Page, userName: string) {
  await searchUser(page, userName);

  const row = getUserRow(page, userName);
  if (!(await row.isVisible().catch(() => false))) {
    return false;
  }

  const toggleBtn = row.getByTitle("Activar");
  if (!(await toggleBtn.isVisible().catch(() => false))) {
    return false;
  }

  await toggleBtn.click();

  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();

  const confirmBtn = dialog.getByRole("button", { name: "Sí, activar" });
  await expect(confirmBtn).toBeEnabled({ timeout: 10000 });

  const toggleResponse = page.waitForResponse(
    (response) => response.request().method() === "PATCH" && response.url().includes("/api/users"),
    { timeout: 10000 }
  );
  await confirmBtn.click();
  await toggleResponse;

  await expect(dialog).not.toBeVisible({ timeout: 10000 });
  return true;
}
