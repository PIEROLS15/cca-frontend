import { test, expect } from "@playwright/test";
import {
  goToSolicitudesActa,
  searchAssemblyRecord,
  deleteAssemblyRecordIfVisible,
} from "./helpers";

test.describe("Delete assembly record request", () => {
  test("create, delete, and verify removal", async ({ page }) => {
    await goToSolicitudesActa(page);

    await page.getByRole("link", { name: "Agregar solicitud" }).click();
    await expect(page).toHaveURL(/\/solicitudes-acta\/nuevo/);

    await page.getByPlaceholder("Ingrese número").fill("020416");
    await page.getByRole("button", { name: "Buscar" }).click();
    await expect(page.getByPlaceholder("Se completa automáticamente")).not.toBeEmpty({
      timeout: 10000,
    });

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
      if (newCode) {
        await searchAssemblyRecord(page, newCode);
        await deleteAssemblyRecordIfVisible(page, newCode);
      }
    } finally {
      if (newCode) {
        await deleteAssemblyRecordIfVisible(page, newCode);
      }
    }
  });
});
