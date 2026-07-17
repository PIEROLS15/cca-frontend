import { test } from "@playwright/test";

import { createTerrainType, deleteTerrainTypeIfVisible, expectTerrainTypeVisible, goToTiposTerreno, searchTerrainType } from "./helpers";

function uniqueName() {
  return `TEST_TERR_${Date.now()}`;
}

test.describe("Create terrain type", () => {
  test("create a new terrain type", async ({ page }) => {
    const createdName = uniqueName();

    await goToTiposTerreno(page);

    try {
      await createTerrainType(page, createdName);
      await searchTerrainType(page, createdName);
      await expectTerrainTypeVisible(page, createdName);
    } finally {
      await deleteTerrainTypeIfVisible(page, createdName);
    }
  });
});
