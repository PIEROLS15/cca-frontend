import { test, expect } from "@playwright/test";
import { goToCertificados } from "./helpers";

test.describe("Create certificate", () => {
  test("create a new certificate and navigate to PDF", async ({ page }) => {
    const uniqueMz = `T${Date.now()}`;

    await goToCertificados(page);

    await page.getByRole("link", { name: "Agregar certificado" }).click();
    await expect(page).toHaveURL(/\/certificados\/nuevo/);

    await page.getByRole("button", { name: "Guardar" }).waitFor({ state: "visible", timeout: 10000 });

    await page.locator("input[placeholder='Ingrese']").first().fill("Dueño Test E2E");
    await page.locator("input[placeholder='Ingrese']").nth(1).fill("12345678");

    const terrainInput = page.locator("input[placeholder='Selecciona..']").first();
    await terrainInput.click();
    await terrainInput.fill("VIVIENDA");
    await page.getByRole("button", { name: "VIVIENDA" }).click();

    const sectorInput = page.locator("input[placeholder='Selecciona..']").nth(1);
    await sectorInput.click();
    await sectorInput.fill("NUEVE DE OCTUBRE");
    await page.getByRole("button", { name: "NUEVE DE OCTUBRE", exact: true }).click();

    const mzLabel = page.locator("label").filter({ hasText: "MZ" });
    const mzInput = mzLabel.locator("..").locator("input");
    await mzInput.fill(uniqueMz);

    const loteLabel = page.locator("label").filter({ hasText: "Lote" });
    const loteInput = loteLabel.locator("..").locator("input");
    await loteInput.fill("99");

    const anchoLabel = page.locator("label").filter({ hasText: "Ancho" });
    const anchoInput = anchoLabel.locator("..").locator("input");
    await anchoInput.fill("10");

    const largoLabel = page.locator("label").filter({ hasText: "Largo" });
    const largoInput = largoLabel.locator("..").locator("input");
    await largoInput.fill("20");

    await page.getByRole("button", { name: "Guardar" }).click();

    await expect(page).toHaveURL(/\/certificados\/\d+\/pdf/, { timeout: 15000 });
  });
});
