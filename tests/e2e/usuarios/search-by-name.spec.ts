import { test, expect } from "@playwright/test";

import { clearUserSearch, expectUserVisible, goToUsuarios, searchUser } from "./helpers";

test.describe("Search user by name", () => {
  test("search by full name shows matching user", async ({ page }) => {
    await goToUsuarios(page);

    try {
      await searchUser(page, "Piero");
      await expectUserVisible(page, "Piero Daniel Llanos Sánchez");

      const row = page.getByRole("row", { name: /Piero Daniel Llanos Sánchez/ });
      await expect(row.getByText("Admin")).toBeVisible();
    } finally {
      await clearUserSearch(page);
    }
  });
});
