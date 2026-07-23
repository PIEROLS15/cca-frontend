import { test, expect } from "@playwright/test";
import {
  goToSolicitudesCertificados,
  deleteCertificateRequestIfVisible,
} from "./helpers";

test.describe("Delete certificate request", () => {
  test("create, delete, and verify removal", async ({ page }) => {
    const uniqueDoc = String(Date.now()).slice(-8);

    await goToSolicitudesCertificados(page);

    await page.getByRole("link", { name: "Agregar solicitud" }).click();
    await expect(page).toHaveURL(/\/solicitudes-certificados\/nuevo/);

    await page.getByRole("radio", { name: "Sí" }).click();
    await page.getByRole("radio", { name: "Ingeniero" }).click();

    await page.getByPlaceholder("Ingrese una descripción...").fill("Solicitud para eliminar");

    await page.getByRole("checkbox", { name: "Certificado de Posesión" }).check();

    await page.getByRole("button", { name: "Agregar cliente" }).click();

    const agregarDialog = page.getByRole("dialog").filter({ hasText: "Nuevo cliente" });
    await expect(agregarDialog).toBeVisible();

    await agregarDialog.locator("#agregar-fullName").fill("Cliente Eliminar E2E");
    await agregarDialog.locator("#agregar-documentNumber").fill(uniqueDoc);
    await agregarDialog.locator("#agregar-address").fill("Direccion Eliminar 456");

    const crearBtn = agregarDialog.getByRole("button", { name: "Crear registro" });
    await expect(crearBtn).toBeEnabled({ timeout: 5000 });
    await crearBtn.click();

    await expect(agregarDialog).not.toBeVisible({ timeout: 15000 });

    await page.getByRole("button", { name: "Guardar" }).click();
    await expect(page).toHaveURL(/\/solicitudes-certificados\/\d+\/pdf/, { timeout: 15000 });

    const iframe = page.locator("iframe");
    await expect(iframe).toBeVisible({ timeout: 15000 });
    const title = await iframe.getAttribute("title");
    const codeMatch = title?.match(/\d{6}-\d{2}/);
    const newCode = codeMatch?.[0];

    await page.getByRole("link", { name: "Volver" }).click();
    await expect(page).toHaveURL(/\/solicitudes-certificados$/);

    try {
      if (newCode) {
        await deleteCertificateRequestIfVisible(page, newCode);
      }
    } finally {
      if (newCode) {
        await deleteCertificateRequestIfVisible(page, newCode);
      }
    }
  });
});
