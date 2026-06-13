import { apiFetch } from "./api";
import type { LoginPayload, LoginResponse, User } from "@/types/auth";

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
  me: () => apiFetch<{ user: User }>("/api/auth/me"),
  updateProfile: (data: { fullName: string; username: string; email?: string; dni?: string }) =>
    apiFetch<{ user: User }>("/api/auth/profile", {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    apiFetch<{ message: string }>("/api/auth/change-password", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  verifyPassword: (password: string) =>
    apiFetch<{ valid: boolean }>("/api/auth/verify-password", {
      method: "POST",
      body: JSON.stringify({ password }),
    }),
};
