// lib/dashboardService.ts
import axios from 'axios';

export interface UserDashboardStats {
  availableDocuments: number;
  recentRecordsCount: number;
  recordsPerDay: { date: string; count: number }[];
  myDocuments: {
    id: number;
    name: string;
    description: string;
    can_create: boolean;
    can_edit: boolean;
  }[];
}

export interface AdminDashboardStats {
  totalUsers: number;
  totalDocuments: number;
  totalRecords: number;
  formsActiveToday: number;
  recordsPerDay: Array<{ date: string; count: number }>;
  recordsByDocument: Array<{ name: string; count: number }>;
  pendingForms: Array<{
    id: number;
    user: string;
    description: string;
    created_at: string;
  }>;
}

export interface SuperAdminDashboardStats {
  totalUsers: number;
  totalDocuments: number;
  totalRecords: number;
  totalActivities: number;
  usersByRole: Array<{ role: string; count: number }>;
  mostActiveDocuments: Array<{ name: string; count: number }>;
  userActivityPerDay: Array<{ date: string; count: number }>;
  documentCreationTrend: Array<{ date: string; count: number }>;
  activityLogPreview: Array<{
    id: number;
    user: string;
    action: string;
    entity_type: string;
    description: string;
    created_at: string;
  }>;
}

export const dashboardService = {
  async getUserDashboardStats(): Promise<UserDashboardStats> {
    const response = await axios.get('/api/users/dashboard-stats');
    return response.data;
  },

  async getAdminDashboardStats(): Promise<AdminDashboardStats> {
    const response = await axios.get('/api/admin/dashboard-stats');
    return response.data;
  },

  async getSuperAdminDashboardStats(): Promise<SuperAdminDashboardStats> {
    const response = await axios.get('/api/superadmin/dashboard-stats');
    return response.data;
  },
};
