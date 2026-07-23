import { test, expect } from "@playwright/test";

import { clearUserSearch, filterByStatus, goToUsuarios } from "./helpers";

test.describe("Search user by status", () => {
  test("filter by Activos shows only active users", async ({ page }) => {
    await goToUsuarios(page);

    try {
      await filterByStatus(page, "Activos");

      const rows = page.getByRole("row");
      await expect(rows.first()).toBeVisible();

      const badges = page.getByRole("row").getByText("Activo");
      const count = await badges.count();
      expect(count).toBeGreaterThanOrEqual(1);

      const inactiveBadges = page.getByRole("row").getByText("Inactivo");
      const inactiveCount = await inactiveBadges.count();
      expect(inactiveCount).toBe(0);
    } finally {
      await clearUserSearch(page);
    }
  });
});
