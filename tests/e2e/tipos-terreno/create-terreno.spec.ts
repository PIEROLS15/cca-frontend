import { test, expect } from "@playwright/test";
import { loginAsSeededUser } from "../auth/session";

let counter = 0;
function uniqueName() {
  counter++;
  return `TEST${counter}`;
}

test.describe("Create terrain type", () => {
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

  test("create a new terrain type", async ({ page }) => {
    pageRef = page;
    createdName = uniqueName();

    await loginAsSeededUser(page);
    await page.goto("/tipos-terreno");
    await page.waitForTimeout(2000);

    await page.getByRole("button", { name: "Agregar tipo" }).click();
    await page.getByRole("dialog").waitFor({ state: "visible" });

    const dialog = page.getByRole("dialog");
    const input = dialog.getByRole("textbox", { name: "Nombre" });
    await input.waitFor({ state: "visible" });
    await input.fill(createdName);
    await page.screenshot({ path: "test-results/debug-after-fill.png" });

    await dialog.getByRole("button", { name: "Crear tipo de terreno" }).click();
    await page.waitForTimeout(3000);
    await page.screenshot({ path: "test-results/debug-after-submit.png" });

    await expect(page.getByRole("dialog")).not.toBeVisible({ timeout: 10000 });

    const searchInput = page.getByPlaceholder("Buscar por nombre...");
    await searchInput.fill(createdName);
    await page.waitForTimeout(1000);

    await expect(page.getByRole("row", { name: createdName })).toBeVisible();
  });
});
