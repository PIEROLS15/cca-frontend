import { test, expect } from "@playwright/test";
import {
  goToSolicitudesActa,
  searchAssemblyRecord,
  expectAssemblyRecordVisible,
  changeAssemblyRecordStatus,
} from "./helpers";

test.describe("Change status to Entregado", () => {
  test("change an En Proceso request to Entregado and restore", async ({ page }) => {
    await goToSolicitudesActa(page);

    await searchAssemblyRecord(page, "SOL-ACTA-000251");
    await expectAssemblyRecordVisible(page, "SOL-ACTA-000251");

    try {
      await changeAssemblyRecordStatus(page, "SOL-ACTA-000251", "Entregado");

      await searchAssemblyRecord(page, "SOL-ACTA-000251");
      const row = page.getByRole("row").filter({ hasText: "SOL-ACTA-000251" });
      await expect(row.locator("text=Entregado")).toBeVisible();
    } finally {
      await changeAssemblyRecordStatus(page, "SOL-ACTA-000251", "En Proceso");
    }
  });
});
