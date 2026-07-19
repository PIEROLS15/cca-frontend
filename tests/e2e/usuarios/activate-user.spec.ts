import { test, expect } from "@playwright/test";

import { clearUserSearch, createUser, deactivateUserIfActive, expectUserVisible, goToUsuarios, searchUser, toggleUserStatus } from "./helpers";
import type { UserPayload } from "@/types/user";

function uniquePayload(): UserPayload {
  const ts = Date.now();
  return {
    username: `testact_${ts}`,
    password: "Test123456",
    fullName: `TESTACT_${ts}`,
    email: `testact_${ts}@test.com`,
    dni: String(10000000 + Math.floor(Math.random() * 90000000)),
    roleId: 4,
    roleName: "Asistente",
  };
}

test.describe("Activate user", () => {
  test("activate an inactive user", async ({ page }) => {
    const payload = uniquePayload();

    await goToUsuarios(page);

    try {
      await createUser(page, payload);
      await searchUser(page, payload.username);
      await expectUserVisible(page, payload.fullName);

      await deactivateUserIfActive(page, payload.fullName);

      await searchUser(page, payload.username);
      await toggleUserStatus(page, payload.fullName);

      const row = page.getByRole("row", { name: new RegExp(payload.fullName) });
      await expect(row.getByText("Activo")).toBeVisible();
    } finally {
      await deactivateUserIfActive(page, payload.fullName);
    }
  });
});
