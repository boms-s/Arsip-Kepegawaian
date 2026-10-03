import { redirect } from "next/navigation";

/**
 * Root page (/) — mulai aplikasi dari halaman login.
 */
export default function RootPage() {
  redirect("/login");
}
