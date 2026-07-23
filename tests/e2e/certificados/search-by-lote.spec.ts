import { test, expect } from "@playwright/test";
import { goToCertificados, searchByLote, clearAllFilters } from "./helpers";

test.describe("Search certificate by Lote", () => {
  test("filter by lote", async ({ page }) => {
    await goToCertificados(page);

    await expect(page.getByRole("row")).toHaveCount(6, { timeout: 15000 });

    await searchByLote(page, "7");

    const rows = page.getByRole("row");
    await expect(rows.first()).toBeVisible();
    const countAfter = await rows.count();
    expect(countAfter).toBeGreaterThanOrEqual(2);
    expect(countAfter).toBeLessThanOrEqual(6);

    await clearAllFilters(page);
    await expect(page.getByPlaceholder("Lote")).toHaveValue("");
  });
});
