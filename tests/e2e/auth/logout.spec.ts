import { authenticatedTest, logoutUser } from "./session";

authenticatedTest("logout user and return to login", async ({ authenticatedPage }) => {
  await logoutUser(authenticatedPage);
});
