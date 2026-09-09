// import { api } from "./api";

// export interface AdminDashboardData {
//   totalAudits: number;
//   activeAudits: number;
//   completedAudits: number;
//   highRiskFindings: number;
//   recentAudits?: Array<{
//     id: string;
//     title: string;
//     department: string;
//     status: string;
//     due_date: string;
//     assignedAuditor?: number;
//   }>;
// }

// export interface KPIs {
//   assignedAudits: number;
//   completedAudits: number;
//   pendingAudits: number;
//   overdue: number;
// }

// export interface AuditStatus {
//   assignedAudits: number;
//   completedAudits: number;
//   pendingAudits: number;
// }

// export interface FindingsByRisk {
//   high: number;
//   medium: number;
//   low: number;
//   critical:number;
// }

// export interface MonthlyCompletedAudit {
//   month: string;
//   count: number;
// }

// export interface RecentAudit {
//   id: number;
//   audit_name: string;
//   department: string;
//   status: "PENDING" | "IN_PROGRESS" | "COMPLETED";
//   due_date: string;
// }

// export interface AuditorDashboardData {
//   kpis: KPIs;
//   auditStatus: AuditStatus;
//   findingsByRisk: FindingsByRisk;
//   monthlyCompletedAudits: MonthlyCompletedAudit[];
//   recentAudits: RecentAudit[];
// }

// export const dashboardService = {
//   getAdminDashboard: async (): Promise<AdminDashboardData> => {
//     const response = await api.get<AdminDashboardData>("/dashboard/admin");
//     return response.data;
//   },


//   async getAuditorDashboardData(): Promise<AuditorDashboardData> {
//     const response = await api.get<AuditorDashboardData>("/dashboard/auditor");
//     return response.data;
//   }
// }
import { api } from "./api";

/* ==========================================
   Generic API Response
========================================== */

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

/* ==========================================
   Shared Interfaces
========================================== */

export interface FindingsByRisk {
  critical: number;
  high: number;
  medium: number;
  low: number;
}

export interface MonthlyCompletedAudit {
  month: string;
  count: number;
}

/* ==========================================
   Admin Dashboard Interfaces
========================================== */

export interface AdminKPIs {
  totalAudits: number;
  activeAudits: number;
  completedAudits: number;
  highRiskFindings: number;
}

export interface AdminAuditStatus {
  pending: number;
  inProgress: number;
  completed: number;
}

export interface DepartmentAudit {
  department: string;
  count: number;
}

export interface AuditorWorkload {
  auditor: string;
  assignedAudits: number;
}

export interface AdminRecentAudit {
  id: number;
  title: string;
  department: string;
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED";
  due_date: string;
  assignedAuditor: string | null;
}

export interface AdminDashboardData {
  kpis: AdminKPIs;
  auditStatus: AdminAuditStatus;
  findingsByRisk: FindingsByRisk;
  monthlyCompletedAudits: MonthlyCompletedAudit[];
  auditsByDepartment: DepartmentAudit[];
  auditorWorkload: AuditorWorkload[];
  recentAudits: AdminRecentAudit[];
}

/* ==========================================
   Auditor Dashboard Interfaces
========================================== */

export interface AuditorKPIs {
  assignedAudits: number;
  completedAudits: number;
  pendingAudits: number;
  overdue: number;
}

export interface AuditorAuditStatus {
  pending: number;
  completed: number;
}

export interface AuditorRecentAudit {
  id: number;
  audit_name: string;
  department: string;
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED";
  due_date: string;
}

export interface AuditorDashboardData {
  kpis: AuditorKPIs;
  auditStatus: AuditorAuditStatus;
  findingsByRisk: FindingsByRisk;
  monthlyCompletedAudits: MonthlyCompletedAudit[];
  recentAudits: AuditorRecentAudit[];
}

/* ==========================================
   Dashboard Service
========================================== */

export const dashboardService = {
  async getAdminDashboard(): Promise<AdminDashboardData> {
    const response = await api.get<ApiResponse<AdminDashboardData>>(
      "/dashboard/admin"
    );

    return response.data.data;
  },

  async getAuditorDashboardData(): Promise<AuditorDashboardData> {
    const response = await api.get<ApiResponse<AuditorDashboardData>>(
      "/dashboard/auditor"
    );

    return response.data.data;
  },
};