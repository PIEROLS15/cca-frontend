import { test, expect } from "@playwright/test";
import {
  goToSolicitudesActa,
  searchAssemblyRecord,
  expectAssemblyRecordVisible,
  changeAssemblyRecordStatus,
} from "./helpers";

test.describe("Change status to Por Recoger", () => {
  test("change an En Proceso request to Por Recoger and restore", async ({ page }) => {
    await goToSolicitudesActa(page);

    await searchAssemblyRecord(page, "SOL-ACTA-000251");
    await expectAssemblyRecordVisible(page, "SOL-ACTA-000251");

    try {
      await changeAssemblyRecordStatus(page, "SOL-ACTA-000251", "Por Recoger");

      await searchAssemblyRecord(page, "SOL-ACTA-000251");
      const row = page.getByRole("row").filter({ hasText: "SOL-ACTA-000251" });
      await expect(row.locator("text=Por Recoger")).toBeVisible();
    } finally {
      await changeAssemblyRecordStatus(page, "SOL-ACTA-000251", "En Proceso");
    }
  });
});
