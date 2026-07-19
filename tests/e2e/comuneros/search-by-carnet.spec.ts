import { test, expect } from "@playwright/test";

import { goToComuneros, searchComunero, expectComuneroVisible } from "./helpers";

test.describe("Search comunero by carnet", () => {
  test("find comunero by carnet number", async ({ page }) => {
    await goToComuneros(page);

    await searchComunero(page, "4782");

    const row = page.getByRole("row").filter({ hasText: "Alex Felix Arias Malasquez" });
    await expect(row).toBeVisible();
    await expect(row.getByText("4782")).toBeVisible();
  });
});
