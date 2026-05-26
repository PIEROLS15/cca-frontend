import { apiFetch } from "./api";
import type { LoginPayload, LoginResponse } from "@/types/auth";

export const AuthService = {
  login: (payload: LoginPayload) =>
    apiFetch<LoginResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  logout: () =>
    apiFetch<{ message: string }>("/api/auth/logout", {
      method: "POST",
    }),
};
