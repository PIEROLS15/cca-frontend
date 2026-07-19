import { test, expect } from "@playwright/test";
import { goToCertificados, filterByRole, clearAllFilters } from "./helpers";

test.describe("Search certificate by role", () => {
  test("filter by creator role", async ({ page }) => {
    await goToCertificados(page);

    await expect(page.getByRole("row")).toHaveCount(6, { timeout: 15000 });

    await filterByRole(page, "Presidente");

    const rows = page.getByRole("row");
    await expect(rows.first()).toBeVisible();

    await clearAllFilters(page);
  });
});
