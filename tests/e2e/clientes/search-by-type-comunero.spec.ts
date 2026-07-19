import { test, expect } from "@playwright/test";

import { clearClientFilters, filterClientByType, goToClientes } from "./helpers";

test.describe("Search client by type Comunero", () => {
  test("filter by Comunero shows only Comunero clients", async ({ page }) => {
    await goToClientes(page);

    try {
      await filterClientByType(page, "Comunero");

      const rows = page.getByRole("row");
      await expect(rows.first()).toBeVisible();

      const badges = page.getByRole("row").getByText("Comunero");
      const count = await badges.count();
      expect(count).toBeGreaterThanOrEqual(1);

      const terceroBadges = page.getByRole("row").getByText("Tercero");
      const terceroCount = await terceroBadges.count();
      expect(terceroCount).toBe(0);
    } finally {
      await clearClientFilters(page);
    }
  });
});
