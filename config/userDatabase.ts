import { randomUUID, scryptSync, timingSafeEqual } from "node:crypto";
import { ADMIN_SYSTEM_PERMISSIONS, DUMMY_USER_ACTIVITIES, DUMMY_USERS, EMPLOYEE_PERMISSIONS, HR_OFFICER_PERMISSIONS } from "@/config/dummyUsers";
import type { ManagedUser, ManagedUserRole, ManagedUserStatus, PermissionEntry, UserActivity } from "@/types/user-management";

interface UserDatabase {
  users: ManagedUser[];
  activities: UserActivity[];
}

const globalUserStore = globalThis as typeof globalThis & { siarsipUserDatabase?: UserDatabase };

export function getUserDatabase() {
  globalUserStore.siarsipUserDatabase ??= {
    users: structuredClone(DUMMY_USERS),
    activities: structuredClone(DUMMY_USER_ACTIVITIES),
  };
  return globalUserStore.siarsipUserDatabase;
}

export function publicUser(user: ManagedUser) {
  const safeUser: Partial<ManagedUser> = { ...user };
  delete safeUser.passwordHash;
  return safeUser as Omit<ManagedUser, "passwordHash">;
}

export function permissionsForRole(role: ManagedUserRole): PermissionEntry[] {
  if (role === "ADMIN_SISTEM") return structuredClone(ADMIN_SYSTEM_PERMISSIONS);
  if (role === "ADMIN_KEPEGAWAIAN") return structuredClone(HR_OFFICER_PERMISSIONS);
  return structuredClone(EMPLOYEE_PERMISSIONS);
}

export function parseRole(value: unknown): ManagedUserRole | null {
  return value === "ADMIN_SISTEM" || value === "ADMIN_KEPEGAWAIAN" || value === "PEGAWAI" ? value : null;
}

export function parseStatus(value: unknown): ManagedUserStatus | null {
  return value === "ACTIVE" || value === "INACTIVE" ? value : null;
}

export function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function verifyManagedUserPassword(password: string, passwordHash?: string) {
  if (!passwordHash) return false;
  const [salt, storedHash, extra] = passwordHash.split(":");
  if (!salt || !storedHash || extra) return false;
  const expected = Buffer.from(storedHash, "hex");
  const actual = scryptSync(password, salt, expected.length);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

export function addUserActivity(userId: string, activity: string, description: string) {
  const database = getUserDatabase();
  database.activities.unshift({
    id: randomUUID(),
    userId,
    timestamp: new Date().toISOString(),
    activity,
    module: "Kelola User",
    description,
  });
}