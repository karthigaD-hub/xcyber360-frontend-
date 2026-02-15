// ============= USER ROLES =============
export type UserRole = "ADMIN" | "AGENT" | "CUSTOMER";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  token: string;
  must_change_password?: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: Omit<AuthUser, 'token'> & { must_change_password: boolean };
  token: string;
}

// ============= CORE ENTITIES =============
export interface Agent {
  id: string;
  name: string;
  email: string;
  phone?: string;
  designation?: string;
  emp_id?: string;
  is_active: boolean;
  created_at: string;
  assigned_customers_count?: number;
}

export interface Customer {
  id: string;
  name: string;
  company_name: string;
  email: string;
  phone?: string;
  industry?: string;
  agent_id?: string;
  agent_name?: string;
  created_at: string;
}

export interface InsuranceProvider {
  id: string;
  name: string;
  code: string;
  contact_email?: string;
  contact_phone?: string;
  is_active: boolean;
  created_at: string;
}

export interface Compartment {
  id: string;
  name: string;
  description?: string;
  order: number;
  question_range?: string;
  question_count?: number;
  created_at: string;
}

// ============= QUESTION SYSTEM =============
export type QuestionType = "YES_NO" | "MCQ" | "TEXT" | "NUMBER" | "REFLEXIVE" | "PARAGRAPH" | "CHECKBOX";

export interface Question {
  id: string;
  question_text: string;
  question_type: QuestionType;
  options?: string[];
  compartment_id: string;
  compartment_name?: string;
  risk_weight: number;
  order?: number;
  applicable_providers: string[];
  applicable_provider_names?: string[];
  is_active: boolean;
  created_at: string;
}

export interface QuestionCreatePayload {
  question_text: string;
  question_type: QuestionType;
  options?: string[];
  compartment_id: string;
  risk_weight: number;
  applicable_providers: string[];
  order?: number;
}

export interface BulkUploadResult {
  total: number;
  success: number;
  failed: number;
  errors: { row: number; message: string }[];
  created_compartments: string[];
}

// ============= ASSESSMENTS =============
export type AssessmentStatus = "DRAFT" | "ACTIVE" | "CLOSED";
export type LinkStatus = "YET_TO_START" | "IN_PROGRESS" | "SUBMITTED";

export interface Assessment {
  id: string;
  name: string;
  description?: string;
  status: AssessmentStatus;
  question_count: number;
  link_count?: number;
  created_at: string;
}

export interface AssessmentLink {
  id: string;
  assessment_id: string;
  assessment_name?: string;
  customer_id: string;
  customer_name?: string;
  customer_email?: string;
  insurance_provider_id: string;
  insurance_provider_name?: string;
  agent_id?: string;
  agent_name?: string;
  token: string;
  link_url: string;
  status: LinkStatus;
  progress_percent: number;
  submitted_at?: string;
  created_at: string;
}

export interface AssessmentLinkCreatePayload {
  assessment_id: string;
  customer_id: string;
  insurance_provider_id: string;
  agent_id?: string;
}

// ============= RESPONSES =============
export interface ResponseAnswer {
  question_id: string;
  question_text?: string;
  question_type?: QuestionType;
  compartment_name?: string;
  answer: string | string[] | number | boolean;
}

export interface AssessmentResponse {
  id: string;
  assessment_link_id: string;
  assessment_name?: string;
  customer_name?: string;
  insurance_provider_name?: string;
  agent_name?: string;
  answers: ResponseAnswer[];
  filled_by: "USER" | "AGENT";
  submitted_by: "USER" | "AGENT";
  consent_confirmed: boolean;
  submitted_at: string;
  ip_address?: string;
  user_agent?: string;
  status?: LinkStatus;
  progress_percent?: number;
}

// ============= AUDIT =============
export interface AuditLog {
  id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  performed_by: string;
  performer_role: UserRole | "USER";
  details?: string;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

// ============= DASHBOARD =============
export interface DashboardUser {
  id: string;
  name: string;
  email: string;
}

export interface AdminDashboardStats {
  total_customers: number;
  total_agents: number;
  total_providers: number;
  total_assessments: number;
  total_links: number;
  yet_to_start: number;
  in_progress: number;
  submitted: number;
  yet_to_start_users: DashboardUser[];
  in_progress_users: DashboardUser[];
  submitted_users: DashboardUser[];
}

export interface AgentDashboardStats {
  assigned_customers: number;
  total_assessments: number;
  total_links: number;
  yet_to_start: number;
  in_progress: number;
  submitted: number;
  yet_to_start_users: DashboardUser[];
  in_progress_users: DashboardUser[];
  submitted_users: DashboardUser[];
}

export interface CustomerDashboardLink {
  id: string;
  assessment_name: string;
  insurance_provider_name: string;
  agent_name?: string;
  token: string;
  link_url: string;
  status: LinkStatus;
  progress_percent: number;
  submitted_at?: string;
  created_at: string;
}

export interface CustomerDashboardStats {
  total_links: number;
  yet_to_start: number;
  in_progress: number;
  submitted: number;
  links: CustomerDashboardLink[];
}

// ============= API =============
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface ApiError {
  message: string;
  status: number;
  errors?: Record<string, string[]>;
}
