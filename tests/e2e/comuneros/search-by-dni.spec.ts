import { test, expect } from "@playwright/test";

import { goToComuneros, searchComunero } from "./helpers";

test.describe("Search comunero by DNI", () => {
  test("find comunero by DNI", async ({ page }) => {
    await goToComuneros(page);

    await searchComunero(page, "40959491");

    const row = page.getByRole("row").filter({ hasText: "Alex Felix Arias Malasquez" });
    await expect(row).toBeVisible();
    await expect(row.getByText("40959491")).toBeVisible();
  });
});
