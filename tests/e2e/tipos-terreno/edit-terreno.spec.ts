import { test, expect } from "@playwright/test";
import { loginAsSeededUser } from "../auth/session";

const TARGET = "USO DEPORTIVO";
const EDITED = "USO DEPORTIVO EDITADO";

test.describe("Edit terrain type", () => {
  let pageRef: any = null;
  let restored = false;

  test.afterEach(async () => {
    if (pageRef && !restored) {
      try {
        await pageRef.goto("/tipos-terreno");
        await pageRef.waitForTimeout(2000);

        const searchInput = pageRef.getByPlaceholder("Buscar por nombre...");
        await searchInput.fill(EDITED);
        await pageRef.waitForTimeout(1000);

        const editedRow = pageRef.getByRole("row", { name: EDITED });
        if (await editedRow.isVisible().catch(() => false)) {
          await editedRow.getByRole("button", { name: `Editar ${EDITED}` }).click();
          await pageRef.waitForTimeout(1000);
          await pageRef.locator("#terrain-type-name").clear();
          await pageRef.locator("#terrain-type-name").fill(TARGET);
          await pageRef.getByRole("button", { name: "Guardar cambios" }).click();
          await pageRef.waitForTimeout(2000);
          restored = true;
        }
      } catch {}
    }
  });

  test("edit terrain type name", async ({ page }) => {
    pageRef = page;
    await loginAsSeededUser(page);
    await page.goto("/tipos-terreno");
    await page.waitForTimeout(2000);

    const searchInput = page.getByPlaceholder("Buscar por nombre...");
    await searchInput.fill(TARGET);
    await page.waitForTimeout(1000);

    const row = page.getByRole("row", { name: TARGET });
    await expect(row).toBeVisible();
    await row.getByRole("button", { name: `Editar ${TARGET}` }).click();
    await page.waitForTimeout(1000);

    await page.locator("#terrain-type-name").clear();
    await page.locator("#terrain-type-name").fill(EDITED);
    await page.getByRole("button", { name: "Guardar cambios" }).click();
    await page.waitForTimeout(2000);

    await searchInput.clear();
    await searchInput.fill(EDITED);
    await page.waitForTimeout(1000);

    await expect(page.getByRole("row", { name: EDITED })).toBeVisible();
    restored = true;
  });
});
