import { api } from "./api";

export interface Report {
  id: number;
  audit_id: number;
  summary: string;
  overall_risk: string;
  generated_date: string;
  ai_summary?: string;
  ai_observations?: string;
  ai_recommendations?: string;
  ai_priority_actions?: string;
  ai_generated?: boolean;
  ai_generated_at?: string;

  audit?: {
    id: number;
    title: string;
    department: string;

    start_date?: string;
    due_date?: string;
    status?: string;

    assigned_auditor?: {
      id: number;
      name: string;
    };
  };

  recommendations?: string;
}

export const reportService = {
  getAll: async (): Promise<Report[]> => {
    const res = await api.get<Report[]>("/reports");
    return res.data;
  },

  getById: async (id: number): Promise<Report> => {
    const res = await api.get<Report>(`/reports/${id}`);
    return res.data;
  },

  getByAudit: async (auditId: number): Promise<Report> => {
    const res = await api.get<Report>(`/reports/audit/${auditId}`);
    return res.data;
  },

  generateReport: async (
    auditId: number
  ): Promise<{ message: string; reportId: number }> => {
    const res = await api.post(`/reports/generate/${auditId}`);
    return res.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/reports/${id}`);
  },

  generateAIReport: async (
  auditId: number
): Promise<{
  message: string;
  data: {
    executiveSummary: string;
    keyRisks: string[];
    recommendations: string[];
    conclusion: string;
  };
}> => {
  const res = await api.post(`/ai/generate-report/${auditId}`);
  return res.data;
},

  notifyDownload: async (reportId: number): Promise<void> => {
    await api.post(`/reports/${reportId}/notify-download`);
  },

};