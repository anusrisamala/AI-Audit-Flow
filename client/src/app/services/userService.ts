import { api } from './api';

export interface UserProfile {
  id: number;
  name: string;
  email: string;
  role: 'ADMIN' | 'AUDITOR';
  notify_audits?: boolean;
  notify_findings?: boolean;
  notify_reports?: boolean;
  notify_registrations?: boolean;
}

export const userService = {
  getProfile: async (): Promise<UserProfile> => {
    const res = await api.get<UserProfile>('/users/profile');
    return res.data;
  },

  getAuditors: async (): Promise<UserProfile[]> => {
    const res = await api.get<UserProfile[]>('/users/auditors');
    return res.data;
  },

  updateProfile: async (payload: { name: string; email: string }): Promise<{ message: string; user: UserProfile }> => {
    const res = await api.put<{ message: string; user: UserProfile }>('/users/profile', payload);
    return res.data;
  },

  changePassword: async (payload: { currentPassword: string; newPassword: string }): Promise<{ message: string }> => {
    const res = await api.put<{ message: string }>('/users/change-password', payload);
    return res.data;
  },

  updateNotificationPreferences: async (payload: {
    notify_audits: boolean;
    notify_findings: boolean;
    notify_reports: boolean;
    notify_registrations: boolean;
  }): Promise<{ message: string; user: UserProfile }> => {
    const res = await api.put<{ message: string; user: UserProfile }>('/users/notification-preferences', payload);
    return res.data;
  },
};

