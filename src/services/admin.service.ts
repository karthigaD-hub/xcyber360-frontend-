import { api } from "./api";
import type {
  Agent, Customer, InsuranceProvider, Compartment, Question,
  Assessment, AssessmentLink, AssessmentResponse, AuditLog,
  AdminDashboardStats, QuestionCreatePayload, AssessmentLinkCreatePayload,
  BulkUploadResult, ApiResponse, PaginatedResponse,
} from "@/types";

export const adminService = {
  // Dashboard
  getDashboardStats: () => api.get<ApiResponse<AdminDashboardStats>>("/admin/dashboard"),

  // Agents
  getAgents: () => api.get<PaginatedResponse<Agent>>("/admin/agents"),
  createAgent: (data: { name: string; email: string; phone?: string; designation?: string; emp_id?: string }) =>
    api.post<ApiResponse<Agent>>("/admin/agents", data),
  updateAgent: (id: string, data: Partial<Agent>) => api.put<ApiResponse<Agent>>(`/admin/agents/${id}`, data),
  deleteAgent: (id: string) => api.delete<void>(`/admin/agents/${id}`),

  // Customers (VIEW ONLY — Admin cannot create customers)
  getCustomers: () => api.get<PaginatedResponse<Customer>>("/admin/customers"),

  // Insurance Providers
  getProviders: () => api.get<PaginatedResponse<InsuranceProvider>>("/admin/providers"),
  createProvider: (data: Partial<InsuranceProvider>) => api.post<ApiResponse<InsuranceProvider>>("/admin/providers", data),
  updateProvider: (id: string, data: Partial<InsuranceProvider>) => api.put<ApiResponse<InsuranceProvider>>(`/admin/providers/${id}`, data),
  deleteProvider: (id: string) => api.delete<void>(`/admin/providers/${id}`),

  // Compartments
  getCompartments: () => api.get<PaginatedResponse<Compartment>>("/admin/compartments"),
  createCompartment: (data: { name: string; description?: string; order?: number; question_range?: string }) =>
    api.post<ApiResponse<Compartment>>("/admin/compartments", data),
  updateCompartment: (id: string, data: Partial<Compartment>) => api.put<ApiResponse<Compartment>>(`/admin/compartments/${id}`, data),
  deleteCompartment: (id: string) => api.delete<void>(`/admin/compartments/${id}`),

  // Questions
  getQuestions: (params?: Record<string, string>) => {
    const query = params ? "?" + new URLSearchParams(params).toString() : "";
    return api.get<PaginatedResponse<Question>>(`/admin/questions${query}`);
  },
  createQuestion: (data: QuestionCreatePayload) => api.post<ApiResponse<Question>>("/admin/questions", data),
  updateQuestion: (id: string, data: Partial<QuestionCreatePayload>) => api.put<ApiResponse<Question>>(`/admin/questions/${id}`, data),
  deleteQuestion: (id: string) => api.delete<void>(`/admin/questions/${id}`),
  bulkUploadQuestions: (file: File) => api.upload<ApiResponse<BulkUploadResult>>("/admin/questions/bulk-upload", file),

  // Assessments
  getAssessments: () => api.get<PaginatedResponse<Assessment>>("/admin/assessments"),
  createAssessment: (data: { name: string; description?: string; question_ids: string[] }) =>
    api.post<ApiResponse<Assessment>>("/admin/assessments", data),
  updateAssessment: (id: string, data: Partial<Assessment>) => api.put<ApiResponse<Assessment>>(`/admin/assessments/${id}`, data),

  // Assessment Links
  getAssessmentLinks: (params?: Record<string, string>) => {
    const query = params ? "?" + new URLSearchParams(params).toString() : "";
    return api.get<PaginatedResponse<AssessmentLink>>(`/admin/assessment-links${query}`);
  },
  createAssessmentLink: (data: AssessmentLinkCreatePayload) => api.post<ApiResponse<AssessmentLink>>("/admin/assessment-links", data),

  // Responses (read-only)
  getAllResponses: (params?: Record<string, string>) => {
    const query = params ? "?" + new URLSearchParams(params).toString() : "";
    return api.get<PaginatedResponse<AssessmentResponse>>(`/admin/responses${query}`);
  },
  getResponse: (linkId: string) => api.get<ApiResponse<AssessmentResponse>>(`/admin/responses/${linkId}`),
  exportResponses: (linkId: string, format: "excel" | "pdf") => {
    const token = (() => {
      try {
        const auth = sessionStorage.getItem("xcyber_auth");
        return auth ? JSON.parse(auth).token : null;
      } catch { return null; }
    })();
    const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";
    window.open(`${baseUrl}/admin/responses/${linkId}/export?format=${format}&token=${token}`, '_blank');
  },

  // Audit
  getAuditLogs: (params?: Record<string, string>) => {
    const query = params ? "?" + new URLSearchParams(params).toString() : "";
    return api.get<PaginatedResponse<AuditLog>>(`/admin/audit-logs${query}`);
  },
};
