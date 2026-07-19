import { test, expect } from "@playwright/test";

import { activateUserIfInactive, createUser, expectUserVisible, goToUsuarios, searchUser, toggleUserStatus } from "./helpers";
import type { UserPayload } from "@/types/user";

function uniquePayload(): UserPayload {
  const ts = Date.now();
  return {
    username: `testdeact_${ts}`,
    password: "Test123456",
    fullName: `TESTDEACT_${ts}`,
    email: `testdeact_${ts}@test.com`,
    dni: String(10000000 + Math.floor(Math.random() * 90000000)),
    roleId: 4,
    roleName: "Asistente",
  };
}

test.describe("Deactivate user", () => {
  test("deactivate an active user", async ({ page }) => {
    const payload = uniquePayload();

    await goToUsuarios(page);

    try {
      await createUser(page, payload);
      await searchUser(page, payload.username);
      await expectUserVisible(page, payload.fullName);

      await toggleUserStatus(page, payload.fullName);

      const row = page.getByRole("row", { name: new RegExp(payload.fullName) });
      await expect(row.getByText("Inactivo")).toBeVisible();
    } finally {
      await activateUserIfInactive(page, payload.fullName);
    }
  });
});
