import { test, expect } from "@playwright/test";

import { clearUserSearch, expectUserVisible, goToUsuarios, searchUser } from "./helpers";

test.describe("Search user by username", () => {
  test("search by username shows matching user", async ({ page }) => {
    await goToUsuarios(page);

    try {
      await searchUser(page, "pierols");
      await expectUserVisible(page, "Piero Daniel Llanos Sánchez");

      const row = page.getByRole("row", { name: /Piero Daniel Llanos Sánchez/ });
      await expect(row.getByText("pierols")).toBeVisible();
    } finally {
      await clearUserSearch(page);
    }
  });
});
