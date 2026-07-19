import { test } from "@playwright/test";

import { createClient, deleteClientIfVisible, expectClientNotVisible, expectClientVisible, goToClientes, searchClientByName } from "./helpers";
import type { ClientPayload } from "@/types/client";

function uniquePayload(): ClientPayload {
  return {
    fullName: `TESTDEL_${Date.now()}`,
    documentNumber: String(10000000 + Math.floor(Math.random() * 90000000)),
    address: "Direccion delete",
    phone: "111222333",
    clientType: "Tercero",
    noDocument: false,
  };
}

test.describe("Delete client", () => {
  test("delete a client", async ({ page }) => {
    const payload = uniquePayload();

    await goToClientes(page);

    try {
      await createClient(page, payload);
      await searchClientByName(page, payload.fullName);
      await expectClientVisible(page, payload.fullName);

      await deleteClientIfVisible(page, payload.fullName);
      await expectClientNotVisible(page, payload.fullName);
    } finally {
      await deleteClientIfVisible(page, payload.fullName);
    }
  });
});
