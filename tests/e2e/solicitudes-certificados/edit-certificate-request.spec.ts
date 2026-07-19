import { test, expect } from "@playwright/test";
import {
  goToSolicitudesCertificados,
  searchCertificateRequest,
  expectCertificateRequestVisible,
} from "./helpers";

test.describe("Edit certificate request", () => {
  test("edit request description and restore", async ({ page }) => {
    await goToSolicitudesCertificados(page);

    await searchCertificateRequest(page, "003943");
    await expectCertificateRequestVisible(page, "003943");

    const row = page.getByRole("row").filter({ hasText: "003943" });
    await row.getByRole("link", { name: "Editar" }).click();

    await expect(page).toHaveURL(/\/solicitudes-certificados\/\d+\/editar/);
    await expect(
      page.getByRole("heading", { name: "Editar solicitud de certificado" })
    ).toBeVisible();

    const description = page.getByPlaceholder("Ingrese una descripción...");
    const originalValue = await description.inputValue();

    await description.fill("Descripcion editada E2E");
    await page.getByRole("button", { name: "Guardar cambios" }).click();

    await expect(page).toHaveURL(/\/solicitudes-certificados$/);

    await searchCertificateRequest(page, "003943");
    await expectCertificateRequestVisible(page, "003943");

    const editRow = page.getByRole("row").filter({ hasText: "003943" });
    await editRow.getByRole("link", { name: "Editar" }).click();
    await expect(page).toHaveURL(/\/solicitudes-certificados\/\d+\/editar/);

    await description.fill(originalValue);
    await page.getByRole("button", { name: "Guardar cambios" }).click();
    await expect(page).toHaveURL(/\/solicitudes-certificados$/);
  });
});
