import { api } from "./api";
import type { ApiResponse } from "@/types";

export interface AssessmentFormData {
  assessment_name: string;
  customer_name: string;
  insurance_provider_name: string;
  total_questions: number;
  is_submitted: boolean;
  progress_percent: number;
  status: string;
  compartments: {
    id: string;
    name: string;
    order: number;
    questions: {
      id: string;
      question_text: string;
      question_type: "YES_NO" | "MCQ" | "TEXT" | "NUMBER" | "REFLEXIVE";
      options?: string[];
      risk_weight: number;
    }[];
  }[];
  draft_answers: { question_id: string; answer: any }[];
}

export const assessmentService = {
  getFormByToken: (token: string) =>
    api.get<ApiResponse<AssessmentFormData>>(`/assessment/${token}`),

  saveDraft: (token: string, answers: { question_id: string; answer: any }[], filledBy: "USER" | "AGENT" = "USER") =>
    api.post<{ message: string; progress_percent: number }>(`/assessment/${token}/draft`, {
      answers,
      filled_by: filledBy,
    }),

  submit: (token: string, answers: { question_id: string; answer: any }[], filledBy: "USER" | "AGENT", consentConfirmed: boolean) =>
    api.post<{ message: string }>(`/assessment/${token}/submit`, {
      answers,
      filled_by: filledBy,
      consent_confirmed: consentConfirmed,
    }),
};
