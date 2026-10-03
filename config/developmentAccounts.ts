import type { CurrentUser } from "@/types/auth";

export const DEVELOPMENT_ACCOUNTS = [
  {
    username: "admin.sistem",
    password: "AdminSistem123!",
    user: { id: "dev-admin-system", name: "Hendra Wijaya, S.Kom", role: "ADMIN_SISTEM" },
  },
  {
    username: "admin.kepegawaian",
    password: "AdminPegawai123!",
    user: {
      id: "dev-admin-employee",
      name: "Admin Kepegawaian",
      role: "ADMIN_KEPEGAWAIAN",
    },
  },
] satisfies { username: string; password: string; user: CurrentUser }[];