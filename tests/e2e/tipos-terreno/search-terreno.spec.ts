import { test, expect } from "@playwright/test";

import { clearTerrainTypeSearch, goToTiposTerreno, searchTerrainType } from "./helpers";

test.describe("Search terrain types", () => {
  test("search and clear filter", async ({ page }) => {
    await goToTiposTerreno(page);

    await searchTerrainType(page, "ERIAZO");

    const rows = page.getByRole("row");
    await expect(rows).toHaveCount(2);

    await clearTerrainTypeSearch(page);

    await expect(page.getByPlaceholder("Buscar por nombre...")).toHaveValue("");
    await expect(page.getByRole("row")).not.toHaveCount(2);
  });
});
