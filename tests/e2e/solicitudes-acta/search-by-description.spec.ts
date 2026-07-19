import { test, expect } from "@playwright/test";
import {
  goToSolicitudesActa,
  searchAssemblyRecord,
  clearAssemblyRecordSearch,
  deleteAssemblyRecordIfVisible,
} from "./helpers";

const UNIQUE_DESC = `TEST_DESC_${Date.now()}`;

test.describe("Search assembly record by description", () => {
  test("create with description, search, and clean up", async ({ page }) => {
    await goToSolicitudesActa(page);

    await page.getByRole("link", { name: "Agregar solicitud" }).click();
    await expect(page).toHaveURL(/\/solicitudes-acta\/nuevo/);

    await page.getByPlaceholder("Ingrese número").fill("020416");
    await page.getByRole("button", { name: "Buscar" }).click();
    await expect(page.getByPlaceholder("Se completa automáticamente")).not.toBeEmpty({
      timeout: 10000,
    });

    await page.getByPlaceholder("Ingrese una descripción...").fill(UNIQUE_DESC);
    await page.getByRole("button", { name: "Guardar" }).click();
    await expect(page).toHaveURL(/\/solicitudes-acta\/\d+\/pdf/, { timeout: 15000 });

    const iframe = page.locator("iframe");
    await expect(iframe).toBeVisible({ timeout: 15000 });
    const title = await iframe.getAttribute("title");
    const codeMatch = title?.match(/SOL-ACTA-\d+/);
    const newCode = codeMatch?.[0];

    await page.getByRole("link", { name: "Volver" }).click();
    await expect(page).toHaveURL(/\/solicitudes-acta$/);

    try {
      await searchAssemblyRecord(page, UNIQUE_DESC);

      const rows = page.getByRole("row");
      await expect(rows.first()).toBeVisible();
      const countAfter = await rows.count();
      expect(countAfter).toBeGreaterThanOrEqual(2);
      expect(countAfter).toBeLessThanOrEqual(6);

      await clearAssemblyRecordSearch(page);
      await expect(
        page.getByPlaceholder("Buscar por código, certificado, comprador, ubicación o descripción...")
      ).toHaveValue("");
    } finally {
      if (newCode) {
        await deleteAssemblyRecordIfVisible(page, newCode);
      }
    }
  });
});
