import { test, expect } from "@playwright/test";
import {
  goToCertificados,
  searchCertificate,
  expectCertificateVisible,
  changeCertificateStatus,
} from "./helpers";

test.describe("Change status to Por Firmar", () => {
  test("change to Por Firmar and restore", async ({ page }) => {
    await goToCertificados(page);

    await searchCertificate(page, "023160");
    await expectCertificateVisible(page, "023160");

    try {
      await changeCertificateStatus(page, "023160", "Por Firmar");

      await searchCertificate(page, "023160");
      const row = page.getByRole("row").filter({ hasText: "023160" });
      await expect(row.locator("text=Por Firmar")).toBeVisible();
    } finally {
      await changeCertificateStatus(page, "023160", "Recepcionado");
    }
  });
});
