import { test, expect } from "@playwright/test";
import {
  goToSolicitudesCertificados,
} from "./helpers";

test.describe("Create certificate request", () => {
  test("create a new request via Agregar cliente", async ({ page }) => {
    const uniqueDoc = String(Date.now()).slice(-8);

    await goToSolicitudesCertificados(page);

    await page.getByRole("link", { name: "Agregar solicitud" }).click();
    await expect(page).toHaveURL(/\/solicitudes-certificados\/nuevo/);

    await page.getByRole("radio", { name: "Sí" }).click();
    await page.getByRole("radio", { name: "Ingeniero" }).click();

    await page.getByPlaceholder("Ingrese una descripción...").fill("Solicitud de prueba E2E");

    await page.getByRole("checkbox", { name: "Certificado de Posesión" }).check();

    await page.getByRole("button", { name: "Agregar cliente" }).click();

    const agregarDialog = page.getByRole("dialog").filter({ hasText: "Nuevo cliente" });
    await expect(agregarDialog).toBeVisible();

    await agregarDialog.locator("#agregar-fullName").fill("Cliente Test E2E");
    await agregarDialog.locator("#agregar-documentNumber").fill(uniqueDoc);
    await agregarDialog.locator("#agregar-address").fill("Direccion Test 123");

    const crearBtn = agregarDialog.getByRole("button", { name: "Crear registro" });
    await expect(crearBtn).toBeEnabled({ timeout: 5000 });
    await crearBtn.click();

    await expect(agregarDialog).not.toBeVisible({ timeout: 15000 });

    await page.getByRole("button", { name: "Guardar" }).click();

    await expect(page).toHaveURL(/\/solicitudes-certificados\/\d+\/pdf/, { timeout: 15000 });
  });
});
