import { test, expect } from "@playwright/test";
import { goToCertificados, filterByUbicacion, clearAllFilters } from "./helpers";

test.describe("Search certificate by ubicacion", () => {
  test("filter by sector", async ({ page }) => {
    await goToCertificados(page);

    await expect(page.getByRole("row")).toHaveCount(6, { timeout: 15000 });

    await filterByUbicacion(page, "NUEVE DE OCTUBRE");

    const rows = page.getByRole("row");
    await expect(rows.first()).toBeVisible();
    const countAfter = await rows.count();
    expect(countAfter).toBeGreaterThanOrEqual(2);
    expect(countAfter).toBeLessThanOrEqual(6);

    await clearAllFilters(page);
  });
});
