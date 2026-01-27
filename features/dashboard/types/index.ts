export interface DashboardStats {
  divisions: number;
  departments: number;
  users: number;
}

export interface UserListData {
  id: string;
  email: string;
  fullName: string;
  empId: string;
  roles: string[];
  createdAt: string;
}

export interface DashboardData {
  organizationName: string;
  stats: DashboardStats;
  users: UserListData[];
}
