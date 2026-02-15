import { api } from "./api";
import type { AuthResponse, LoginCredentials } from "@/types";

export const authService = {
  login: (credentials: LoginCredentials) =>
    api.post<AuthResponse>("/auth/login", credentials),

  adminRegister: (data: { name: string; email: string; password: string }) =>
    api.post<AuthResponse>("/auth/admin-register", data),

  logout: () => api.post<void>("/auth/logout"),

  me: () => api.get<AuthResponse>("/auth/me"),

  changePassword: (currentPassword: string, newPassword: string) =>
    api.post<{ message: string }>("/auth/change-password", {
      current_password: currentPassword,
      new_password: newPassword,
    }),
};
