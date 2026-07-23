import { test, expect } from "@playwright/test";
import { clearSectorSearch, createSector, deleteSectorIfVisible, goToSectores, searchSector } from "./helpers";

function uniqueName() {
  return `TESTSEARCH_${Date.now()}`;
}

test.describe("Search sectors", () => {
  test("search and clear filter", async ({ page }) => {
    const createdName = uniqueName();

    await goToSectores(page);

    try {
      await createSector(page, createdName);
      await searchSector(page, createdName);

      const rows = page.getByRole("row");
      await expect(rows).toHaveCount(2);

      await clearSectorSearch(page);

      await expect(page.getByPlaceholder("Buscar por nombre...")).toHaveValue("");
      await expect(page.getByRole("row")).not.toHaveCount(2);
    } finally {
      await deleteSectorIfVisible(page, createdName);
    }
  });
});
