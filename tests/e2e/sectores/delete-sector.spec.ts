import { test, expect } from "@playwright/test";
import { createSector, deleteSectorIfVisible, expectSectorVisible, goToSectores, searchSector } from "./helpers";

function uniqueName() {
  return `TESTDEL_${Date.now()}`;
}

test.describe("Delete sector", () => {
  test("delete a sector", async ({ page }) => {
    const createdName = uniqueName();

    await goToSectores(page);

    try {
      await createSector(page, createdName);
      await searchSector(page, createdName);
      await expectSectorVisible(page, createdName);

      await deleteSectorIfVisible(page, createdName);
      await expect(page.getByRole("row").filter({ hasText: createdName })).not.toBeVisible();
    } finally {
      await deleteSectorIfVisible(page, createdName);
    }
  });
});
