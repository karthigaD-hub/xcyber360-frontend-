import { api } from "./api";
import type {
  AgentDashboardStats, AssessmentLink, Customer, AssessmentResponse,
  ApiResponse, PaginatedResponse,
} from "@/types";

export const agentService = {
  getDashboardStats: () => api.get<ApiResponse<AgentDashboardStats>>("/agent/dashboard"),
  getAssignedLinks: () => api.get<PaginatedResponse<AssessmentLink>>("/agent/assessment-links"),
  getAssignedCustomers: () => api.get<PaginatedResponse<Customer>>("/agent/customers"),
  createCustomer: (data: { name: string; company_name: string; email: string; phone?: string; industry?: string }) =>
    api.post<ApiResponse<Customer>>("/agent/customers", data),
  resendLink: (linkId: string) => api.post<{ message: string; link_url: string }>(`/agent/assessment-links/${linkId}/resend`),
  getResponse: (linkId: string) => api.get<ApiResponse<AssessmentResponse>>(`/agent/responses/${linkId}`),
};
