import Icon from "@/components/ui/Icon";

interface StatCardProps {
  label: string;
  value: number;
  icon: string;
  iconClassName: string;
}

export default function StatCard({
  label,
  value,
  icon,
  iconClassName,
}: StatCardProps) {
  return (
    <article className="stat-card">
      <div className={`stat-card-icon-wrapper ${iconClassName}`} aria-hidden="true">
        <Icon name={icon} size={21} />
      </div>
      <div className="stat-card-body">
        <p className="stat-card-label">{label}</p>
        <p className="stat-card-value">{value.toLocaleString("id-ID")}</p>
        <p className="stat-card-sub">Data contoh frontend</p>
      </div>
    </article>
  );
}