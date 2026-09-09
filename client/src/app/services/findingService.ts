import { api } from "./api";

export interface Finding {
  id: number;
  audit_id: number;

  title: string;
  description: string;
audit_department?: string;
  risk_level: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  recommendation: string;

  // AI Fields
  ai_risk_level?: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  ai_confidence?: number;
  ai_reason?: string;
  ai_recommendation?: string;
  ai_analyzed_at?: string;

  created_at: string;
}

export interface CreateFindingPayload {
  audit_id: number;

  title: string;
  description: string;

  risk_level: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  recommendation: string;

  // Optional AI fields
  ai_risk_level?: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  ai_confidence?: number;
  ai_reason?: string;
  ai_recommendation?: string;
}

export interface CreateFindingResponse {
  message: string;
  finding: Finding;
}

export interface FindingsResponse {
  success: boolean;
  count: number;
  data: Finding[];
}

export const findingService = {
  getAll: async (): Promise<Finding[]> => {
    const res = await api.get<Finding[]>("/findings/my");
    return res.data;
  },

  getByAudit: async (auditId: number): Promise<Finding[]> => {
    const res = await api.get<FindingsResponse>(
      `/findings/audit/${auditId}`
    );

    return res.data.data;
  },

  getMyFindings: async (): Promise<Finding[]> => {
    const res = await api.get<FindingsResponse>("/findings/my");
    return res.data.data;
  },

  getById: async (id: number): Promise<Finding> => {
    const res = await api.get<Finding>(`/findings/${id}`);
    return res.data;
  },

  create: async (payload: CreateFindingPayload): Promise<Finding> => {
    const res = await api.post<CreateFindingResponse>(
      "/findings",
      payload
    );

    return res.data.finding;
  },

  update: async (
  id:number,
  payload:Partial<Finding>
):Promise<{message:string}> => {

 const res = await api.put<{message:string}>(
   `/findings/${id}`,
   payload
 );

 return res.data;
},
  delete: async (id: number): Promise<void> => {
    await api.delete(`/findings/${id}`);
  },
};