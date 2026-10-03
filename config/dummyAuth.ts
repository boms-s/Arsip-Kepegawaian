/**
 * DUMMY AUTH CONFIG — HANYA UNTUK DEVELOPMENT/FRONTEND SEMENTARA
 *
 * File ini menyimpan konfigurasi user dummy yang digunakan selama
 * backend authentication belum tersedia.
 *
 * TODO: Hapus file ini dan ganti dengan data dari authentication API
 *       (misalnya NextAuth.js session, JWT token, atau endpoint /me).
 */

import type { CurrentUser } from "@/types/auth";

const AUTH_STORAGE_KEY = "arsippegawai.currentUser";
const AUTH_CHANGE_EVENT = "arsippegawai-auth-change";

/**
 * Ganti nilai `role` untuk mensimulasikan role yang berbeda:
 *   - "ADMIN_SISTEM"        → melihat semua menu termasuk Audit Log & User Management
 *   - "ADMIN_KEPEGAWAIAN"   → melihat menu standar tanpa Audit Log & User Management
 */
export const DUMMY_CURRENT_USER: CurrentUser = {
  id: "dev-user-001",
  name: "Admin Kepegawaian",
  role: "ADMIN_KEPEGAWAIAN",
};

export async function login(username: string, password: string): Promise<CurrentUser | null> {
  const response = await fetch("/api/auth/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  }).catch(() => null);
  if (!response?.ok) return null;
  const result = await response.json() as { user: CurrentUser };
  const user = result.user;
  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
  window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
  return user;
}

export async function logout(): Promise<void> {
  await fetch("/api/auth/session", { method: "DELETE" }).catch(() => undefined);
  window.localStorage.removeItem(AUTH_STORAGE_KEY);
  window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
}

export function getCurrentUserJson(): string | null {
  return typeof window === "undefined"
    ? null
    : window.localStorage.getItem(AUTH_STORAGE_KEY);
}

export function subscribeToAuthChanges(onChange: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(AUTH_CHANGE_EVENT, onChange);
  return () => window.removeEventListener(AUTH_CHANGE_EVENT, onChange);
}

function isCurrentUser(value: unknown): value is CurrentUser {
  return (
    typeof value === "object" &&
    value !== null &&
    "id" in value &&
    typeof value.id === "string" &&
    "name" in value &&
    typeof value.name === "string" &&
    "role" in value &&
    (value.role === "ADMIN_SISTEM" || value.role === "ADMIN_KEPEGAWAIAN" || value.role === "PEGAWAI")
  );
}

export function parseCurrentUser(value: string | null): CurrentUser | null {
  if (!value) return null;

  try {
    const parsed: unknown = JSON.parse(value);
    return isCurrentUser(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function getCurrentUser(): CurrentUser | null {
  return parseCurrentUser(getCurrentUserJson());
}
