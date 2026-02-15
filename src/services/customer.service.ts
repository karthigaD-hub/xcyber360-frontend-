import { api } from "./api";
import type { CustomerDashboardStats, ApiResponse } from "@/types";

export const customerService = {
  getDashboard: () => api.get<ApiResponse<CustomerDashboardStats>>("/customer/dashboard"),
};
