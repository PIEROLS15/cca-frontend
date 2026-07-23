import { test, expect } from "@playwright/test";

import { clearUserSearch, filterByRole, goToUsuarios } from "./helpers";

test.describe("Search user by role", () => {
  test("filter by Secretaria shows only Secretaria users", async ({ page }) => {
    await goToUsuarios(page);

    try {
      await filterByRole(page, "Secretaria");

      const rows = page.getByRole("row");
      await expect(rows.first()).toBeVisible();

      const badges = page.getByRole("row").getByText("Secretaria");
      const count = await badges.count();
      expect(count).toBeGreaterThanOrEqual(1);

      const adminBadges = page.getByRole("row").getByText("Admin");
      const adminCount = await adminBadges.count();
      expect(adminCount).toBe(0);
    } finally {
      await clearUserSearch(page);
    }
  });
});
