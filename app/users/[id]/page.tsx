"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import PageContainer from "@/components/layout/PageContainer";
import Icon from "@/components/ui/Icon";
import Badge from "@/components/ui/Badge";
import { ContentCard, EmptyState } from "@/components/ui/States";
import PermissionsMatrix from "@/components/users/PermissionsMatrix";
import type { ManagedUser, UserActivity } from "@/types/user-management";

const MODULE_LINKS: Record<string, string> = {
  "Arsip Kepegawaian": "/arsip",
  "Data Pegawai": "/pegawai",
  "Master Data": "/master-data",
  "Laporan": "/laporan",
  "Kelola User": "/users",
  "Audit Log": "/audit-log",
  Sistem: "/dashboard",
};

function formatActivityDate(value: string) {
  return new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", hourCycle: "h23", timeZone: "Asia/Jakarta" }).format(new Date(value));
}

function formatCreatedDate(value: string) {
  return new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Jakarta" }).format(new Date(value));
}

export default function UserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState<ManagedUser | null>(null);
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/users/${id}`, { cache: "no-store" })
      .then(async (response) => {
        const result = await response.json() as { user?: ManagedUser; activities?: UserActivity[]; message?: string };
        if (!response.ok) throw new Error(result.message ?? "Data pengguna tidak dapat dimuat.");
        setUser(result.user ?? null);
        setActivities(result.activities ?? []);
      })
      .catch((loadError: unknown) => setError(loadError instanceof Error ? loadError.message : "Data pengguna tidak dapat dimuat."))
      .finally(() => setIsLoading(false));
  }, [id]);

  if (isLoading) return <PageContainer title="Detail Informasi Pengguna"><div className="users-loading">Memuat informasi pengguna...</div></PageContainer>;
  if (!user) return <PageContainer title="Detail Informasi Pengguna" breadcrumb={[{ label: "SIARSIP", href: "/dashboard" }, { label: "Kelola User", href: "/users" }, { label: "Detail User" }]}><EmptyState icon="user" title={error || "Pengguna tidak ditemukan."} message="Periksa kembali data atau tautan pengguna." action={<Link className="btn btn-secondary" href="/users">Kembali ke Kelola User</Link>} /></PageContainer>;

  const roleName = user.role === "ADMIN_SISTEM" ? "Admin Sistem" : user.role === "ADMIN_KEPEGAWAIAN" ? "Admin" : "Pegawai";
  return (
    <PageContainer title="Detail Informasi Pengguna" breadcrumb={[{ label: "SIARSIP", href: "/dashboard" }, { label: "Kelola User", href: "/users" }, { label: "Detail User" }]}>
      <div className="user-detail-page">
        <ContentCard padded={false}>
          <section className="user-profile-card">
            <div className="user-profile-main">
              <div className="user-profile-avatar" aria-hidden="true"><Icon name="user" size={34} /></div>
              <div className="user-profile-identity">
                <div className="user-profile-title"><h2>{user.name}</h2><Badge variant={user.status === "ACTIVE" ? "success" : "default"}>{user.status === "ACTIVE" ? "Aktif" : "Nonaktif"}</Badge><Badge variant="info">{roleName}</Badge></div>
                <p>{user.email}</p>
                <span>Terakhir Login: {user.lastLogin}</span>
              </div>
            </div>
            <dl className="user-profile-facts">
              <div><dt>Organisasi</dt><dd>{user.organization}</dd></div>
              <div><dt>Departemen</dt><dd>{user.department}</dd></div>
              <div><dt>Dibuat Pada</dt><dd>{formatCreatedDate(user.createdAt)}</dd></div>
            </dl>
          </section>
        </ContentCard>
        <section className="user-detail-section">
          <h2>Hak Akses User &amp; Matriks Pengguna</h2>
          <ContentCard padded={false}>
            <PermissionsMatrix data={user.permissions} mode="read-only" title="Staf Administrator Matriks Hak Akses" description="Daftar rinci izin modul yang diberikan secara langsung untuk pengerjaan harian." />
          </ContentCard>
        </section>
        <section className="user-detail-section">
          <h2>Riwayat Aktivitas Terakhir</h2>
          <ContentCard padded={false}>
            {activities.length === 0 ? <EmptyState icon="clock" title="Belum ada aktivitas." message="Aktivitas pengguna akan tampil di sini." /> : (
              <div className="table-wrapper">
                <table className="table user-activity-table">
                  <thead><tr><th>No</th><th>Tanggal &amp; Waktu</th><th>Aktivitas</th><th>Modul</th><th>Keterangan</th></tr></thead>
                  <tbody>{activities.map((activity, index) => <tr key={activity.id}><td>{index + 1}</td><td className="user-activity-date">{formatActivityDate(activity.timestamp)}</td><td className="user-activity-name">{activity.activity}</td><td><Link href={MODULE_LINKS[activity.module] ?? "/dashboard"}>{activity.module}</Link></td><td>{activity.description}</td></tr>)}</tbody>
                </table>
              </div>
            )}
          </ContentCard>
        </section>
      </div>
    </PageContainer>
  );
}