import { test, expect } from "@playwright/test";
import { loginAsSeededUser } from "../auth/session";

function uniqueName() {
  return `TEST_DEL_${Date.now()}`;
}

test.describe("Delete terrain type", () => {
  let pageRef: any = null;
  let createdName = "";

  test.afterEach(async () => {
    if (pageRef && createdName) {
      try {
        await pageRef.goto("/tipos-terreno");
        await pageRef.waitForTimeout(2000);

        const searchInput = pageRef.getByPlaceholder("Buscar por nombre...");
        await searchInput.fill(createdName);
        await pageRef.waitForTimeout(1000);

        const row = pageRef.getByRole("row", { name: createdName });
        if (await row.isVisible().catch(() => false)) {
          await row.getByRole("button", { name: new RegExp(`Eliminar.*${createdName}`) }).click();
          await pageRef.waitForTimeout(500);
          await pageRef.getByRole("button", { name: "Sí, eliminar" }).click();
          await pageRef.waitForTimeout(2000);
        }
      } catch {}
    }
  });

  test("delete a terrain type", async ({ page }) => {
    pageRef = page;
    createdName = uniqueName();

    await loginAsSeededUser(page);
    await page.goto("/tipos-terreno");
    await page.waitForTimeout(2000);

    await page.getByRole("button", { name: "Agregar tipo" }).click();
    await page.getByRole("dialog").waitFor({ state: "visible" });

    await page.locator("#terrain-type-name").fill(createdName);
    await page.getByRole("button", { name: "Crear tipo de terreno" }).click();

    await expect(page.getByRole("dialog")).not.toBeVisible({ timeout: 10000 });

    const searchInput = page.getByPlaceholder("Buscar por nombre...");
    await searchInput.fill(createdName);
    await page.waitForTimeout(1000);

    const row = page.getByRole("row", { name: createdName });
    await expect(row).toBeVisible();
    await row.getByRole("button", { name: new RegExp(`Eliminar.*${createdName}`) }).click();
    await page.waitForTimeout(500);
    await page.getByRole("button", { name: "Sí, eliminar" }).click();
    await page.waitForTimeout(2000);

    await expect(page.getByRole("row", { name: createdName })).not.toBeVisible();
  });
});
