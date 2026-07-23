import { test, expect } from "@playwright/test";
import {
  goToSolicitudesActa,
  searchAssemblyRecord,
  expectAssemblyRecordVisible,
} from "./helpers";

test.describe("View PDF of assembly record", () => {
  test("navigate to PDF viewer from list", async ({ page }) => {
    await goToSolicitudesActa(page);

    await searchAssemblyRecord(page, "SOL-ACTA-000251");
    await expectAssemblyRecordVisible(page, "SOL-ACTA-000251");

    const row = page.getByRole("row").filter({ hasText: "SOL-ACTA-000251" });
    await row.getByRole("button", { name: "Ver PDF" }).click();

    await expect(page).toHaveURL(/\/solicitudes-acta\/\d+\/pdf/);
  });
});
