import { test, expect } from "@playwright/test";
import { goToCertificados, searchCertificate, expectCertificateVisible } from "./helpers";

test.describe("Edit certificate", () => {
  test("edit certificate notes and restore", async ({ page }) => {
    await goToCertificados(page);

    await searchCertificate(page, "023160");
    await expectCertificateVisible(page, "023160");

    const row = page.getByRole("row").filter({ hasText: "023160" });
    await row.getByRole("link", { name: "Editar" }).click();

    await expect(page).toHaveURL(/\/certificados\/\d+\/editar/);
    await expect(page.getByRole("heading", { name: "Editar Certificado" })).toBeVisible();

    const notes = page.getByPlaceholder("Ingrese").last();
    const originalValue = await notes.inputValue();

    await notes.fill("Notas de prueba E2E");
    await page.getByRole("button", { name: "Guardar cambios" }).click();

    await expect(page).toHaveURL(/\/certificados$/);

    await searchCertificate(page, "023160");
    await expectCertificateVisible(page, "023160");

    const editRow = page.getByRole("row").filter({ hasText: "023160" });
    await editRow.getByRole("link", { name: "Editar" }).click();
    await expect(page).toHaveURL(/\/certificados\/\d+\/editar/);

    await notes.fill(originalValue);
    await page.getByRole("button", { name: "Guardar cambios" }).click();
    await expect(page).toHaveURL(/\/certificados$/);
  });
});
