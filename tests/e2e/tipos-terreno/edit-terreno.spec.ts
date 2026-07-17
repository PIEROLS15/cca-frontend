import { test } from "@playwright/test";

import { createTerrainType, deleteTerrainTypeIfVisible, expectTerrainTypeVisible, goToTiposTerreno, renameTerrainTypeIfVisible, searchTerrainType } from "./helpers";

function uniqueName() {
  return `TEST_EDIT_${Date.now()}`;
}

test.describe("Edit terrain type", () => {
  test("edit terrain type name", async ({ page }) => {
    const originalName = uniqueName();
    const editedName = `${originalName}_EDITADO`;

    await goToTiposTerreno(page);

    try {
      await createTerrainType(page, originalName);
      await searchTerrainType(page, originalName);
      await expectTerrainTypeVisible(page, originalName);

      await renameTerrainTypeIfVisible(page, originalName, editedName);
      await expectTerrainTypeVisible(page, editedName);
    } finally {
      await renameTerrainTypeIfVisible(page, editedName, originalName);
      await deleteTerrainTypeIfVisible(page, originalName);
    }
  });
});
