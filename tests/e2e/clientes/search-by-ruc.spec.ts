import { test, expect } from "@playwright/test";

import { clearClientFilters, goToClientes, searchClientByDocument } from "./helpers";

test.describe("Search client by RUC", () => {
  test("search by RUC prefix shows matching clients", async ({ page }) => {
    await goToClientes(page);

    try {
      await searchClientByDocument(page, "20");

      const rows = page.getByRole("row");
      await expect(rows.first()).toBeVisible();

      const count = await rows.count();
      expect(count).toBeGreaterThanOrEqual(1);
    } finally {
      await clearClientFilters(page);
    }
  });
});
