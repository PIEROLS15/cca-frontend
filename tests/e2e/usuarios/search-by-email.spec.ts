import { test, expect } from "@playwright/test";

import { clearUserSearch, expectUserVisible, goToUsuarios, searchUser } from "./helpers";

test.describe("Search user by email", () => {
  test("search by email shows matching user", async ({ page }) => {
    await goToUsuarios(page);

    try {
      await searchUser(page, "pierodanielllanossanchez");
      await expectUserVisible(page, "Piero Daniel Llanos Sánchez");

      const row = page.getByRole("row", { name: /Piero Daniel Llanos Sánchez/ });
      await expect(row.getByText("pierodanielllanossanchez@gmail.com")).toBeVisible();
    } finally {
      await clearUserSearch(page);
    }
  });
});
