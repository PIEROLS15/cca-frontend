import { test, expect } from "@playwright/test";
import { clearSectorSearch, goToSectores, searchSector } from "./helpers";

test.describe("Search sectors", () => {
  test("search and clear filter", async ({ page }) => {
    await goToSectores(page);

    await searchSector(page, "PRUEBA");

    const rows = page.getByRole("row");
    await expect(rows).toHaveCount(3);

    await clearSectorSearch(page);

    await expect(page.getByPlaceholder("Buscar por nombre...")).toHaveValue("");
    await expect(page.getByRole("row")).not.toHaveCount(3);
  });
});
