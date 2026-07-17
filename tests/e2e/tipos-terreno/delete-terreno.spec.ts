import { test, expect } from "@playwright/test";

import { createTerrainType, deleteTerrainTypeIfVisible, expectTerrainTypeVisible, goToTiposTerreno, searchTerrainType } from "./helpers";

function uniqueName() {
  return `TEST_DEL_${Date.now()}`;
}

test.describe("Delete terrain type", () => {
  test("delete a terrain type", async ({ page }) => {
    const createdName = uniqueName();

    await goToTiposTerreno(page);

    try {
      await createTerrainType(page, createdName);
      await searchTerrainType(page, createdName);
      await expectTerrainTypeVisible(page, createdName);

      await deleteTerrainTypeIfVisible(page, createdName);
      await expect(page.getByRole("row").filter({ hasText: createdName })).not.toBeVisible();
    } finally {
      await deleteTerrainTypeIfVisible(page, createdName);
    }
  });
});
