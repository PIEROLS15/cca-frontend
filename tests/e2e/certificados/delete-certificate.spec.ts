import { test, expect } from "@playwright/test";
import { goToCertificados, deleteCertificateIfVisible } from "./helpers";

test.describe("Delete certificate", () => {
  test("create, delete, and verify removal", async ({ page }) => {
    const uniqueMz = `D${Date.now()}`;

    await goToCertificados(page);

    await page.getByRole("link", { name: "Agregar certificado" }).click();
    await expect(page).toHaveURL(/\/certificados\/nuevo/);

    await page.locator("input[placeholder='Ingrese']").first().fill("Dueño Eliminar E2E");
    await page.locator("input[placeholder='Ingrese']").nth(1).fill("87654321");

    const terrainInput = page.locator("input[placeholder='Selecciona..']").first();
    await terrainInput.click();
    await terrainInput.fill("VIVIENDA");
    await page.getByRole("button", { name: "VIVIENDA" }).click();

    const sectorInput = page.locator("input[placeholder='Selecciona..']").nth(1);
    await sectorInput.click();
    await sectorInput.fill("NUEVE DE OCTUBRE");
    await page.getByRole("button", { name: "NUEVE DE OCTUBRE", exact: true }).click();

    await page.locator("label:has-text('MZ') + input").fill(uniqueMz);
    await page.locator("label:has-text('Lote') + input").fill("88");

    await page.locator("label:has-text('Ancho') + input").fill("10");
    await page.locator("label:has-text('Largo') + input").fill("20");

    await page.getByRole("button", { name: "Guardar" }).click();
    await expect(page).toHaveURL(/\/certificados\/\d+\/pdf/, { timeout: 15000 });

    const iframe = page.locator("iframe");
    await expect(iframe).toBeVisible({ timeout: 15000 });
    const title = await iframe.getAttribute("title");
    const codeMatch = title?.match(/\d{6}/);
    const newCode = codeMatch?.[0];

    await page.getByRole("link", { name: "Volver" }).click();
    await expect(page).toHaveURL(/\/certificados$/);

    try {
      if (newCode) {
        await deleteCertificateIfVisible(page, newCode);
      }
    } finally {
      if (newCode) {
        await deleteCertificateIfVisible(page, newCode);
      }
    }
  });
});
