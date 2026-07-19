import { test, expect } from "@playwright/test";
import { goToSolicitudesActa } from "./helpers";

test.describe("Create assembly record request", () => {
  test("create a new request and navigate to PDF", async ({ page }) => {
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
  });
});
