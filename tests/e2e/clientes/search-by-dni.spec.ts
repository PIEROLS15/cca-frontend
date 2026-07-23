import { test, expect } from "@playwright/test";

import { clearClientFilters, expectClientVisible, goToClientes, searchClientByDocument } from "./helpers";

test.describe("Search client by DNI", () => {
  test("search by DNI shows matching client", async ({ page }) => {
    await goToClientes(page);

    try {
      await searchClientByDocument(page, "07113170");
      await expectClientVisible(page, "Tercero");

      const row = page.getByRole("row", { name: /07113170/ });
      await expect(row).toBeVisible();
    } finally {
      await clearClientFilters(page);
    }
  });
});
