import Link from "next/link";
import { cookies } from "next/headers";
import { AUTH_SESSION_COOKIE, verifySessionToken } from "@/config/authSession";

export default async function UsersLayout({ children }: LayoutProps<"/users">) {
  const cookieStore = await cookies();
  const session = verifySessionToken(cookieStore.get(AUTH_SESSION_COOKIE)?.value);
  if (session?.role === "ADMIN_SISTEM") return children;

  return (
    <section className="users-forbidden" role="alert">
      <span className="users-forbidden-code">403</span>
      <h1>Anda tidak memiliki akses</h1>
      <p>Halaman Kelola User hanya dapat dibuka oleh Admin Sistem.</p>
      <Link className="btn btn-primary" href="/dashboard">Kembali ke Dashboard</Link>
    </section>
  );
}