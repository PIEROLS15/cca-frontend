import { test } from "@playwright/test";

import { createClient, deleteClientIfVisible, expectClientVisible, goToClientes, searchClientByName } from "./helpers";
import type { ClientPayload } from "@/types/client";

function uniquePayload(): ClientPayload {
  return {
    fullName: `TESTCLI_${Date.now()}`,
    documentNumber: String(10000000 + Math.floor(Math.random() * 90000000)),
    address: "Direccion de prueba",
    phone: "999888777",
    clientType: "Tercero",
    noDocument: false,
  };
}

test.describe("Create client", () => {
  test("create a new client", async ({ page }) => {
    const payload = uniquePayload();

    await goToClientes(page);

    try {
      await createClient(page, payload);
      await searchClientByName(page, payload.fullName);
      await expectClientVisible(page, payload.fullName);
    } finally {
      await deleteClientIfVisible(page, payload.fullName);
    }
  });
});
