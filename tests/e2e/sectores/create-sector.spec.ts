import { test } from "@playwright/test";
import { createSector, deleteSectorIfVisible, expectSectorVisible, goToSectores, searchSector } from "./helpers";

function uniqueName() {
  return `TESTSEC_${Date.now()}`;
}

test.describe("Create sector", () => {
  test("create a new sector", async ({ page }) => {
    const createdName = uniqueName();

    await goToSectores(page);

    try {
      await createSector(page, createdName);
      await searchSector(page, createdName);
      await expectSectorVisible(page, createdName);
    } finally {
      await deleteSectorIfVisible(page, createdName);
    }
  });
});
