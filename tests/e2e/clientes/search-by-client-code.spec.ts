import { test, expect } from "@playwright/test";

import { clearClientFilters, expectClientVisible, goToClientes, searchClientByDocument } from "./helpers";

test.describe("Search client by client code", () => {
  test("search by client code shows matching client", async ({ page }) => {
    await goToClientes(page);

    try {
      await searchClientByDocument(page, "CLI-001");
      await expectClientVisible(page, "COMEDOR POPULAR VIRGEN DEL ROSARIO");

      const row = page.getByRole("row", { name: /COMEDOR POPULAR VIRGEN DEL ROSARIO/ });
      await expect(row.getByText("CLI-001")).toBeVisible();
    } finally {
      await clearClientFilters(page);
    }
  });
});
