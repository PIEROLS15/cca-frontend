import { test, expect } from "@playwright/test";
import { loginAsSeededUser } from "../auth/session";

const TARGET = "PRUEBA";
const EDITED = "PRUEBA EDITADO";

test.describe("Edit sector", () => {
  let pageRef: any = null;
  let restored = false;

  test.afterEach(async () => {
    if (pageRef && !restored) {
      try {
        await pageRef.goto("/sectores");
        await pageRef.waitForTimeout(2000);

        const searchInput = pageRef.getByPlaceholder("Buscar por nombre...");
        await searchInput.fill(EDITED);
        await pageRef.waitForTimeout(1000);

        const editedRow = pageRef.getByRole("row", { name: "PRUEBA EDITADO Editar PRUEBA EDITADO Eliminar PRUEBA EDITADO" });
        if (await editedRow.isVisible().catch(() => false)) {
          await editedRow.getByRole("button", { name: `Editar ${EDITED}` }).click();
          await pageRef.waitForTimeout(1000);
          await pageRef.locator("#sector-name").clear();
          await pageRef.locator("#sector-name").fill(TARGET);
          await pageRef.getByRole("button", { name: "Guardar cambios" }).click();
          await pageRef.waitForTimeout(2000);
          restored = true;
        }
      } catch {}
    }
  });

  test("edit sector name", async ({ page }) => {
    pageRef = page;
    await loginAsSeededUser(page);
    await page.goto("/sectores");
    await page.waitForTimeout(2000);

    const searchInput = page.getByPlaceholder("Buscar por nombre...");

    await searchInput.fill(TARGET);
    await page.waitForTimeout(1000);

    const targetRow = page.getByRole("row", { name: "PRUEBA Editar PRUEBA Eliminar PRUEBA" });
    const editadoRow = page.getByRole("row", { name: "PRUEBA EDITADO Editar PRUEBA EDITADO Eliminar PRUEBA EDITADO" });

    if (!(await targetRow.isVisible().catch(() => false)) && (await editadoRow.isVisible().catch(() => false))) {
      await editadoRow.getByRole("button", { name: `Editar ${EDITED}` }).click();
      await page.waitForTimeout(1000);
      await page.locator("#sector-name").clear();
      await page.locator("#sector-name").fill(TARGET);
      await page.getByRole("button", { name: "Guardar cambios" }).click();
      await page.waitForTimeout(2000);
      await searchInput.clear();
      await searchInput.fill(TARGET);
      await page.waitForTimeout(1000);
    }

    const row = page.getByRole("row", { name: "PRUEBA Editar PRUEBA Eliminar PRUEBA" });
    await expect(row).toBeVisible();
    await row.getByRole("button", { name: `Editar ${TARGET}` }).click();
    await page.waitForTimeout(1000);

    await page.locator("#sector-name").clear();
    await page.locator("#sector-name").fill(EDITED);
    await page.getByRole("button", { name: "Guardar cambios" }).click();
    await page.waitForTimeout(2000);

    await searchInput.clear();
    await searchInput.fill(EDITED);
    await page.waitForTimeout(1000);

    await expect(page.getByRole("row", { name: "PRUEBA EDITADO Editar PRUEBA EDITADO Eliminar PRUEBA EDITADO" })).toBeVisible();
    restored = true;
  });
});
