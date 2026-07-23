import { test, expect } from "@playwright/test";
import { goToCertificados, searchCertificate, expectCertificateVisible } from "./helpers";

test.describe("View PDF of certificate", () => {
  test("navigate to PDF viewer from list", async ({ page }) => {
    await goToCertificados(page);

    await searchCertificate(page, "023160");
    await expectCertificateVisible(page, "023160");

    const row = page.getByRole("row").filter({ hasText: "023160" });
    await row.getByRole("button", { name: "Ver PDF" }).click();

    await expect(page).toHaveURL(/\/certificados\/\d+\/pdf/);
  });
});
