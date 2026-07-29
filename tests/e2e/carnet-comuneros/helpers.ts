import { expect, type Page } from "@playwright/test";

import { loginAsSeededUser } from "../auth/session";

export interface MockLicense {
  id: number;
  dni: string;
  licenseNumber: string;
  fullName: string;
  firstNames: string;
  lastNames: string;
  gender: string;
  hasPhoto: boolean;
  photoUrl: string | null;
  createdAt: string;
}

export const MOCK_LICENSES: MockLicense[] = [
  { id: 1, dni: "12345678", licenseNumber: "0001", fullName: "Juan Carlos Perez Lopez", firstNames: "Juan Carlos", lastNames: "Perez Lopez", gender: "M", hasPhoto: true, photoUrl: "/photos/juan.jpg", createdAt: "2026-01-15T10:00:00.000Z" },
  { id: 2, dni: "87654321", licenseNumber: "0002", fullName: "Maria Lopez Garcia", firstNames: "Maria", lastNames: "Lopez Garcia", gender: "F", hasPhoto: true, photoUrl: "/photos/maria.jpg", createdAt: "2026-02-20T11:00:00.000Z" },
  { id: 3, dni: "11223344", licenseNumber: "0003", fullName: "Pedro Sanchez Rojas", firstNames: "Pedro", lastNames: "Sanchez Rojas", gender: "M", hasPhoto: false, photoUrl: null, createdAt: "2026-03-10T09:00:00.000Z" },
  { id: 4, dni: "55667788", licenseNumber: "0004", fullName: "Ana Torres Vargas", firstNames: "Ana", lastNames: "Torres Vargas", gender: "F", hasPhoto: true, photoUrl: "/photos/ana.jpg", createdAt: "2026-04-05T14:00:00.000Z" },
  { id: 5, dni: "99887766", licenseNumber: "0005", fullName: "Luis Fernandez Cuellar", firstNames: "Luis", lastNames: "Fernandez Cuellar", gender: "M", hasPhoto: true, photoUrl: "/photos/luis.jpg", createdAt: "2026-05-01T08:00:00.000Z" },
];

const CARNET_PATH = "/carnet-comuneros";
const SEARCH_PLACEHOLDER = "Buscar por DNI o N\u00b0 de carnet...";

function buildListResponse(data: MockLicense[], search?: string) {
  const filtered = search
    ? data.filter(
        (l) =>
          l.dni.includes(search) ||
          l.licenseNumber.includes(search) ||
          l.fullName.toLowerCase().includes(search.toLowerCase()),
      )
    : data;

  return {
    message: "Carnets de comunero encontrados correctamente",
    error: false,
    status: 200,
    data: filtered,
    total: filtered.length,
    limit: 5,
    totalPages: 1,
    page: 1,
    pagingCounter: 1,
    hasPrevPage: false,
    hasNextPage: false,
    prevPage: null,
    nextPage: null,
  };
}

export async function setupApiMocks(page: Page, licenses: MockLicense[] = MOCK_LICENSES) {
  const pdfBuffer = Buffer.from("%PDF-1.4 mock-carnet-pdf");

  await page.route(/\/api\/commoner-licenses/, async (route) => {
    const url = new URL(route.request().url());
    const method = route.request().method();
    const pathname = url.pathname;

    if (method === "DELETE") {
      const deleteMatch = pathname.match(/\/api\/commoner-licenses\/(\d+)$/);
      if (deleteMatch) {
        const deleteId = Number(deleteMatch[1]);
        const idx = licenses.findIndex((l) => l.id === deleteId);
        if (idx !== -1) licenses.splice(idx, 1);
      }
      await route.fulfill({ status: 204 });
      return;
    }

    if (method === "POST") {
      const body = route.request().postDataJSON() as { dni: string; numeroComunero: string };
      const newLicense: MockLicense = {
        id: licenses.length + 1,
        dni: body.dni,
        licenseNumber: body.numeroComunero,
        fullName: "Nuevo Comunero Test",
        firstNames: "Nuevo",
        lastNames: "Comunero Test",
        gender: "M",
        hasPhoto: false,
        photoUrl: null,
        createdAt: new Date().toISOString(),
      };
      licenses.push(newLicense);

      await route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({ ...newLicense, photoUrl: null }),
      });
      return;
    }

    if (method === "GET") {
      if (pathname.endsWith("/pdf") && url.searchParams.has("mode")) {
        await route.fulfill({
          status: 200,
          contentType: "application/pdf",
          body: pdfBuffer,
        });
        return;
      }

      const singlePdfMatch = pathname.match(/\/api\/commoner-licenses\/(\d+)\/pdf$/);
      if (singlePdfMatch) {
        await route.fulfill({
          status: 200,
          contentType: "application/pdf",
          body: pdfBuffer,
        });
        return;
      }

      const getByIdMatch = pathname.match(/\/api\/commoner-licenses\/(\d+)$/);
      if (getByIdMatch) {
        const id = Number(getByIdMatch[1]);
        const license = licenses.find((l) => l.id === id);
        if (license) {
          await route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({ ...license, photoPath: license.photoUrl, updatedAt: license.createdAt }),
          });
        } else {
          await route.fulfill({
            status: 404,
            contentType: "application/json",
            body: JSON.stringify({ message: "Carnet de comunero no encontrado" }),
          });
        }
        return;
      }

      const search = url.searchParams.get("search") || "";
      const response = buildListResponse(licenses, search);
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(response),
      });
      return;
    }

    await route.continue();
  });
}

export async function goToCarnetComuneros(page: Page) {
  await loginAsSeededUser(page);
  await page.goto(CARNET_PATH);
  await expect(page.getByRole("heading", { name: "Carnet Comuneros" })).toBeVisible();
}

export async function searchByDni(page: Page, query: string) {
  await page.getByPlaceholder(SEARCH_PLACEHOLDER).fill(query);
}

export async function clearSearch(page: Page) {
  await page.getByRole("button", { name: "Limpiar" }).click();
}

export async function expectRowVisible(page: Page, text: string) {
  await expect(page.getByRole("row").filter({ hasText: text })).toBeVisible();
}

export async function expectRowNotVisible(page: Page, text: string) {
  await expect(page.getByRole("row").filter({ hasText: text })).not.toBeVisible();
}

export async function openCreateDialog(page: Page) {
  await page.getByRole("button", { name: "Nuevo comunero" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
}

export async function submitCreateDialog(page: Page, dni: string, nroCarnet: string) {
  await page.getByLabel("DNI").fill(dni);
  await page.getByLabel("N\u00b0 de carnet").fill(nroCarnet);
  await page.getByRole("button", { name: "Agregar" }).click();
  await expect(page.getByRole("dialog")).not.toBeVisible({ timeout: 10000 });
}

export async function clickViewPdf(page: Page, rowText: string) {
  const row = page.getByRole("row").filter({ hasText: rowText });
  await row.getByRole("button", { name: "Ver detalles" }).click();
}

export async function clickDeleteOnRow(page: Page, rowText: string) {
  const row = page.getByRole("row").filter({ hasText: rowText });
  await row.getByRole("button", { name: "Eliminar" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
}

export async function confirmDelete(page: Page) {
  await page.getByRole("button", { name: "Eliminar", exact: true }).last().click();
  await expect(page.getByRole("dialog")).not.toBeVisible({ timeout: 10000 });
}

export async function clickPrintAll(page: Page) {
  await page.getByRole("button", { name: "Imprimir todos" }).click();
}

export async function fillPrintList(page: Page, values: string) {
  await page.getByPlaceholder("4776,4777,0001").fill(values);
}

export async function clickPrintList(page: Page) {
  await page.getByRole("button", { name: "Imprimir lista" }).click();
}

export async function selectRange(page: Page, from: string, to: string) {
  await page.locator("#rango-desde").fill(from);
  await page.locator("#rango-hasta").fill(to);
  await page.getByRole("button", { name: "A\u00f1adir a selecci\u00f3n" }).click();
}

export async function clickPrintSelected(page: Page) {
  await page.getByRole("button", { name: /Imprimir seleccionados/ }).click();
}
