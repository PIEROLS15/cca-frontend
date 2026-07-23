import { test, expect } from "@playwright/test";
import {
  goToSolicitudesActa,
  searchAssemblyRecord,
  expectAssemblyRecordVisible,
} from "./helpers";

test.describe("Edit assembly record request", () => {
  test("edit request description and restore", async ({ page }) => {
    await goToSolicitudesActa(page);

    await searchAssemblyRecord(page, "SOL-ACTA-000251");
    await expectAssemblyRecordVisible(page, "SOL-ACTA-000251");

    const row = page.getByRole("row").filter({ hasText: "SOL-ACTA-000251" });
    await row.getByRole("link", { name: "Editar" }).click();

    await expect(page).toHaveURL(/\/solicitudes-acta\/\d+\/editar/);
    await expect(
      page.getByRole("heading", { name: "Editar solicitud de acta de asamblea" })
    ).toBeVisible();

    const description = page.getByPlaceholder("Ingrese una descripción...");
    const originalValue = await description.inputValue();

    await description.fill("Descripción de prueba E2E");
    await page.getByRole("button", { name: "Guardar cambios" }).click();

    await expect(page).toHaveURL(/\/solicitudes-acta$/);

    await searchAssemblyRecord(page, "SOL-ACTA-000251");
    await expectAssemblyRecordVisible(page, "SOL-ACTA-000251");

    const editRow = page.getByRole("row").filter({ hasText: "SOL-ACTA-000251" });
    await editRow.getByRole("link", { name: "Editar" }).click();
    await expect(page).toHaveURL(/\/solicitudes-acta\/\d+\/editar/);

    await description.fill(originalValue);
    await page.getByRole("button", { name: "Guardar cambios" }).click();
    await expect(page).toHaveURL(/\/solicitudes-acta$/);
  });
});
