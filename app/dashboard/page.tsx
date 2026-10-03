import type { Metadata } from "next";
import PageContainer from "@/components/layout/PageContainer";
import Link from "next/link";
import Icon from "@/components/ui/Icon";
import Badge from "@/components/ui/Badge";
import Alert from "@/components/ui/Alert";
import StatCard from "@/components/dashboard/StatCard";
import { ContentCard, EmptyState, ErrorState, LoadingState } from "@/components/ui/States";
import { DUMMY_DASHBOARD, type DashboardData } from "@/config/dummyDashboard";

export const metadata: Metadata = {
  title: "Dashboard",
};

type DashboardStatus = "loading" | "empty" | "error" | "success";

function DashboardContent({
  status,
  data,
}: {
  status: DashboardStatus;
  data: DashboardData;
}) {
  return (
    <PageContainer
      title="Dashboard"
      description="Ringkasan sistem arsip dan kepegawaian."
      breadcrumb={[{ label: "Dashboard" }]}
    >
      {status === "loading" ? <LoadingState /> : null}
      {status === "empty" ? <EmptyState message="Belum ada ringkasan untuk ditampilkan." /> : null}
      {status === "error" ? <ErrorState /> : null}
      {status === "success" && (
        <div className="dashboard-content">
          <Alert
            variant="info"
            message="Angka dan aktivitas berikut adalah data contoh untuk tampilan, bukan data database."
          />

          <section className="stat-cards-grid" aria-label="Ringkasan statistik">
            <StatCard label="Total Pegawai" value={data.summary.totalPegawai} icon="users" iconClassName="stat-icon-blue" />
            <StatCard label="Total Arsip" value={data.summary.totalArsip} icon="archive" iconClassName="stat-icon-green" />
            <StatCard label="Kategori Dokumen" value={data.summary.totalKategori} icon="folder" iconClassName="stat-icon-amber" />
            <StatCard label="Jenis Dokumen" value={data.summary.totalJenisDokumen} icon="file-text" iconClassName="stat-icon-rose" />
          </section>

          <ContentCard padded={false}>
            <div className="dashboard-section-heading">
              <div>
                <h2>Aktivitas terbaru</h2>
                <p>Contoh arsip untuk pratinjau antarmuka</p>
              </div>
              <Icon name="clock" size={19} className="dashboard-heading-icon" />
            </div>
            {data.activities.length === 0 ? (
              <EmptyState message="Belum ada aktivitas terbaru." />
            ) : (
              <div className="table-wrapper">
                <table className="table">
                  <thead>
                    <tr>
                      <th scope="col">Nama Dokumen</th>
                      <th scope="col">Kategori</th>
                      <th scope="col">Tanggal</th>
                      <th scope="col">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.activities.map((activity) => (
                      <tr key={activity.id}>
                        <td>{activity.documentName}</td>
                        <td>{activity.category}</td>
                        <td>{new Date(`${activity.date}T00:00:00`).toLocaleDateString("id-ID")}</td>
                        <td>
                          <Badge variant={activity.status === "Tersimpan" ? "success" : "warning"}>
                            {activity.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </ContentCard>

          <section className="dashboard-quick-actions" aria-labelledby="quick-actions-title">
            <div className="dashboard-section-heading dashboard-quick-heading">
              <div>
                <h2 id="quick-actions-title">Akses cepat</h2>
                <p>Pintasan ke halaman kerja</p>
              </div>
            </div>
            <div className="quick-action-grid">
              <Link href="/pegawai" className="quick-action-card">
                <span className="quick-action-icon quick-icon-blue"><Icon name="users" size={20} /></span>
                <span className="quick-action-label">Data Pegawai</span>
              </Link>
              <Link href="/arsip" className="quick-action-card">
                <span className="quick-action-icon quick-icon-green"><Icon name="archive" size={20} /></span>
                <span className="quick-action-label">Kelola Arsip</span>
              </Link>
              <Link href="/pencarian" className="quick-action-card">
                <span className="quick-action-icon quick-icon-amber"><Icon name="search" size={20} /></span>
                <span className="quick-action-label">Pencarian Arsip</span>
              </Link>
            </div>
          </section>
        </div>
      )}
    </PageContainer>
  );
}

export default function DashboardPage() {
  return <DashboardContent status="success" data={DUMMY_DASHBOARD} />;
}
