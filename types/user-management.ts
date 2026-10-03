export type ManagedUserRole = "ADMIN_SISTEM" | "ADMIN_KEPEGAWAIAN" | "PEGAWAI";
export type ManagedUserStatus = "ACTIVE" | "INACTIVE";

export interface PermissionEntry {
  module: string;
  view: boolean;
  create: boolean;
  edit: boolean;
  delete: boolean;
}

export interface UserActivity {
  id: string;
  userId: string;
  timestamp: string;
  activity: string;
  module: string;
  description: string;
}

export interface ManagedUser {
  id: string;
  name: string;
  email: string;
  role: ManagedUserRole;
  status: ManagedUserStatus;
  lastLogin: string;
  organization: string;
  department: string;
  createdAt: string;
  permissions: PermissionEntry[];
  passwordHash?: string;
}

export type PublicManagedUser = Omit<ManagedUser, "passwordHash">;