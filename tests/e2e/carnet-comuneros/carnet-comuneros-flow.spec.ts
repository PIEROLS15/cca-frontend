import { test, expect } from "@playwright/test";
import {
  setupApiMocks,
  goToCarnetComuneros,
  searchByDni,
  clearSearch,
  expectRowVisible,
  expectRowNotVisible,
  openCreateDialog,
  submitCreateDialog,
  clickViewPdf,
  clickDeleteOnRow,
  confirmDelete,
  clickPrintAll,
  fillPrintList,
  clickPrintList,
  selectRange,
  clickPrintSelected,
  MOCK_LICENSES,
} from "./helpers";

test.describe("Carnet Comuneros - flujo completo", () => {
  test("buscar, crear, ver PDF, imprimir por todos/lista/rango, eliminar", async ({ page }) => {
    const licenses = [...MOCK_LICENSES];
    await setupApiMocks(page, licenses);

    await goToCarnetComuneros(page);

    await expectRowVisible(page, "Juan Carlos Perez Lopez");
    await expectRowVisible(page, "Pedro Sanchez Rojas");
    await expectRowVisible(page, "Luis Fernandez Cuellar");

    await searchByDni(page, "12345678");
    await expectRowVisible(page, "Juan Carlos Perez Lopez");
    await expectRowNotVisible(page, "Pedro Sanchez Rojas");
    await expectRowNotVisible(page, "Maria Lopez Garcia");

    await clearSearch(page);
    await searchByDni(page, "0003");
    await expectRowVisible(page, "Pedro Sanchez Rojas");
    await expectRowNotVisible(page, "Juan Carlos Perez Lopez");

    await clearSearch(page);
    await expectRowVisible(page, "Juan Carlos Perez Lopez");

    await openCreateDialog(page);
    await submitCreateDialog(page, "11112222", "0006");
    await expectRowVisible(page, "Juan Carlos Perez Lopez");

    await clickViewPdf(page, "Juan Carlos Perez Lopez");
    await expect(page).toHaveURL(/\/carnet-comuneros\/1\/pdf/, { timeout: 10000 });

    const singleIframe = page.locator("iframe");
    await expect(singleIframe).toBeVisible({ timeout: 10000 });

    await page.getByRole("link", { name: "Volver" }).click();
    await expect(page).toHaveURL(/\/carnet-comuneros$/);

    await clickPrintAll(page);
    await expect(page).toHaveURL(/\/carnet-comuneros\/pdf\?mode=all/, { timeout: 10000 });

    const bulkIframe = page.locator("iframe");
    await expect(bulkIframe).toBeVisible({ timeout: 10000 });

    await page.getByRole("link", { name: "Volver" }).click();
    await expect(page).toHaveURL(/\/carnet-comuneros$/);

    await fillPrintList(page, "0001,0002");
    await clickPrintList(page);
    await expect(page).toHaveURL(/\/carnet-comuneros\/pdf\?mode=list/, { timeout: 10000 });

    const listIframe = page.locator("iframe");
    await expect(listIframe).toBeVisible({ timeout: 10000 });

    await page.getByRole("link", { name: "Volver" }).click();
    await expect(page).toHaveURL(/\/carnet-comuneros$/);

    await selectRange(page, "0001", "0003");
    await expect(page.getByText("3 carnets seleccionados")).toBeVisible({ timeout: 5000 });

    await clickPrintSelected(page);
    await expect(page).toHaveURL(/\/carnet-comuneros\/pdf\?mode=range&field=licenseNumber&from=0001&to=0003/, { timeout: 10000 });

    const rangeIframe = page.locator("iframe");
    await expect(rangeIframe).toBeVisible({ timeout: 10000 });

    await page.getByRole("link", { name: "Volver" }).click();
    await expect(page).toHaveURL(/\/carnet-comuneros$/);

    await clickDeleteOnRow(page, "Pedro Sanchez Rojas");
    await expect(page.getByText(/eliminar.*DNI 11223344/)).toBeVisible();

    await confirmDelete(page);
    await expectRowNotVisible(page, "Pedro Sanchez Rojas");
    await expectRowVisible(page, "Juan Carlos Perez Lopez");
  });
});
