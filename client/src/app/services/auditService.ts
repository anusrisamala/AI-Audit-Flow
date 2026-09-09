import { api } from "./api";

export interface Audit {
  id: number;
  title: string;
  department: string;
  description: string;
  start_date: string;
  due_date: string;
  status: string;
  created_by?: number;
  assigned_to?: number;
  auditor_id?: number;
  assigned_auditor?: string;
  created_at: string;
}

export interface CreateAuditPayload {
  title: string;
  department: string;
  description: string;
  start_date: string;
  due_date: string;
  assigned_to?: number;
}

export const auditService = {
  getAll: async (): Promise<Audit[]> => {
    const res = await api.get<Audit[]>("/audits");
    return res.data;
  },

  getMyAudits: async (): Promise<Audit[]> => {
    const res = await api.get<Audit[]>("/audits/my-audits");
    return res.data;
  },

  getById: async (id: number): Promise<Audit> => {
    const res = await api.get<Audit>(`/audits/${id}`);
    return res.data;
  },

  create: async (payload: CreateAuditPayload): Promise<Audit> => {
    const res = await api.post<Audit>("/audits", payload);
    return res.data;
  },

  update: async (
    id: number,
    payload: Partial<CreateAuditPayload>,
  ): Promise<Audit> => {
    const res = await api.put<Audit>(`/audits/${id}`, payload);
    return res.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/audits/${id}`);
  },

  assign: async (
    id: number,
    auditorId: number
): Promise<void> => {

    await api.put(`/audits/${id}/assign`, {
        assigned_to: auditorId,
    });
},

  submit: async (id: number): Promise<Audit> => {
    const res = await api.put<Audit>(`/audits/${id}/submit`);
    return res.data;
  },
};
