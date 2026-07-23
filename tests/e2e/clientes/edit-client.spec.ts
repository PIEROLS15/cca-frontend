import { test } from "@playwright/test";

import { createClient, deleteClientIfVisible, expectClientVisible, goToClientes, renameClientIfVisible, searchClientByName } from "./helpers";
import type { ClientPayload } from "@/types/client";

function uniquePayload(): ClientPayload {
  return {
    fullName: `TESTEDIT_${Date.now()}`,
    documentNumber: String(10000000 + Math.floor(Math.random() * 90000000)),
    address: "Direccion edit",
    phone: "777888999",
    clientType: "Tercero",
    noDocument: false,
  };
}

test.describe("Edit client", () => {
  test("edit client name", async ({ page }) => {
    const payload = uniquePayload();
    const editedName = `${payload.fullName}_EDITADO`;

    await goToClientes(page);

    try {
      await createClient(page, payload);
      await searchClientByName(page, payload.fullName);
      await expectClientVisible(page, payload.fullName);

      await renameClientIfVisible(page, payload.fullName, editedName);
      await expectClientVisible(page, editedName);
    } finally {
      await renameClientIfVisible(page, editedName, payload.fullName);
      await deleteClientIfVisible(page, payload.fullName);
    }
  });
});
