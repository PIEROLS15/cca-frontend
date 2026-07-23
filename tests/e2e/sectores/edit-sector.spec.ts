import { test } from "@playwright/test";
import { createSector, deleteSectorIfVisible, expectSectorVisible, goToSectores, renameSectorIfVisible, searchSector } from "./helpers";

function uniqueName() {
  return `TESTEDIT_${Date.now()}`;
}

test.describe("Edit sector", () => {
  test("edit sector name", async ({ page }) => {
    const originalName = uniqueName();
    const editedName = `${originalName}_EDITADO`;

    await goToSectores(page);

    try {
      await createSector(page, originalName);
      await searchSector(page, originalName);
      await expectSectorVisible(page, originalName);

      await renameSectorIfVisible(page, originalName, editedName);
      await expectSectorVisible(page, editedName);
    } finally {
      await renameSectorIfVisible(page, editedName, originalName);
      await deleteSectorIfVisible(page, originalName);
    }
  });
});
