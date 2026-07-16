import { test, expect } from "@playwright/test";
import { loginAsSeededUser } from "../auth/session";

test.describe("Search sectors", () => {
  test("search and clear filter", async ({ page }) => {
    await loginAsSeededUser(page);
    await page.goto("/sectores");
    await page.waitForTimeout(2000);

    await page.getByPlaceholder("Buscar por nombre...").fill("PRUEBA");
    await page.waitForTimeout(1000);

    const rows = page.getByRole("row");
    await expect(rows).toHaveCount(3);

    await page.getByRole("button", { name: "Limpiar" }).click();
    await page.waitForTimeout(1000);

    await expect(page.getByRole("row")).not.toHaveCount(3);
  });
});
