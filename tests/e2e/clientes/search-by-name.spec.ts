import { test, expect } from "@playwright/test";

import { clearClientFilters, expectClientVisible, goToClientes, searchClientByName } from "./helpers";

test.describe("Search client by name", () => {
  test("search by name shows matching client", async ({ page }) => {
    await goToClientes(page);

    try {
      await searchClientByName(page, "Alex Felix");
      await expectClientVisible(page, "Alex Felix Arias Malasquez");

      const row = page.getByRole("row", { name: /Alex Felix Arias Malasquez/ });
      await expect(row.getByText("Comunero")).toBeVisible();
    } finally {
      await clearClientFilters(page);
    }
  });
});
