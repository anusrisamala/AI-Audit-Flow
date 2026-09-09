import { api } from "./api";


export interface Notification {

  id: number;

  user_id: number;

  title: string;

  message: string;

  type:
    | "AUDIT_ASSIGNED"
    | "AUDIT_DUE"
    | "AUDIT_OVERDUE"
    | "FINDING_RETURNED"
    | "HIGH_RISK_FINDING"
    | "CRITICAL_FINDING"
    | "AUDIT_COMPLETED"
    | "REPORT_GENERATED"
    | "NEW_AUDITOR"
    | "SYSTEM_ALERT"
    | "AUDITOR_REGISTERED"
    | "AUDIT_UPDATED"
    | "AI_REPORT_GENERATED"
    | "AUDIT_DUE_SOON";

  is_read: boolean;

  created_at: string;
}


export interface NotificationsResponse {

  count?: number;

  data?: Notification[];

}


export interface UnreadCountResponse {

  count: number;

}


export const notificationService = {


  // Get logged-in user's notifications
  getAll: async (): Promise<Notification[]> => {

    const res = await api.get<Notification[]>(
      "/notifications"
    );

    return res.data;

  },


  // Get unread notification count for bell badge
  getUnreadCount: async (): Promise<number> => {

    const res = await api.get<UnreadCountResponse>(
      "/notifications/unread-count"
    );

    return res.data.count;

  },


  // Mark single notification as read
  markRead: async (
    id: number
  ): Promise<void> => {

    await api.put(
      `/notifications/read/${id}`
    );

  },


  // Mark all notifications as read
  markAllRead: async (): Promise<void> => {

    await api.put(
      "/notifications/read-all"
    );

  },


};