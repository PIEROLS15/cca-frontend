import { test, expect } from "@playwright/test";

import { clearClientFilters, filterClientByType, goToClientes } from "./helpers";

test.describe("Search client by type Tercero", () => {
  test("filter by Tercero shows only Tercero clients", async ({ page }) => {
    await goToClientes(page);

    try {
      await filterClientByType(page, "Tercero");

      const rows = page.getByRole("row");
      await expect(rows.first()).toBeVisible();

      const badges = page.getByRole("row").getByText("Tercero");
      const count = await badges.count();
      expect(count).toBeGreaterThanOrEqual(1);

      const comuneroBadges = page.getByRole("row").getByText("Comunero");
      const comuneroCount = await comuneroBadges.count();
      expect(comuneroCount).toBe(0);
    } finally {
      await clearClientFilters(page);
    }
  });
});
