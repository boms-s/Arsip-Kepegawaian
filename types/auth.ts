/**
 * Tipe role yang tersedia dalam sistem.
 *
 * TODO: Nanti diganti dengan tipe yang dihasilkan dari API/authentication backend.
 */
export type UserRole = "ADMIN_SISTEM" | "ADMIN_KEPEGAWAIAN" | "PEGAWAI";

/**
 * Representasi user yang sedang login.
 *
 * TODO: Nanti diganti dengan data asli dari session/token API.
 */
export interface CurrentUser {
  id: string;
  name: string;
  role: UserRole;
}
