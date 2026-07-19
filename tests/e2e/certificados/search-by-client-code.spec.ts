import { test, expect } from "@playwright/test";
import { goToCertificados, searchCertificate, clearAllFilters } from "./helpers";

test.describe("Search certificate by client code", () => {
  test("filter by client code via main search", async ({ page }) => {
    await goToCertificados(page);

    await expect(page.getByRole("row")).toHaveCount(6, { timeout: 15000 });

    await searchCertificate(page, "CLI-");

    const rows = page.getByRole("row");
    await expect(rows.first()).toBeVisible();

    await clearAllFilters(page);
    await expect(page.getByPlaceholder("Código o nombre...")).toHaveValue("");
  });
});
