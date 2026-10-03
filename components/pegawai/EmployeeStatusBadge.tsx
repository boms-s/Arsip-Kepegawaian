import Badge from "@/components/ui/Badge";
import type { EmployeeStatus } from "@/types/employee";

interface EmployeeStatusBadgeProps {
  status: EmployeeStatus;
}

const STATUS_LABELS: Record<EmployeeStatus, string> = {
  PNS_AKTIF: "PNS Aktif",
  PPPK_KONTRAK: "PPPK Kontrak",
  PENSIUN: "Pensiun",
};

const STATUS_VARIANTS = {
  PNS_AKTIF: "success",
  PPPK_KONTRAK: "warning",
  PENSIUN: "default",
} as const;

export default function EmployeeStatusBadge({ status }: EmployeeStatusBadgeProps) {
  return <Badge variant={STATUS_VARIANTS[status]}>{STATUS_LABELS[status]}</Badge>;
}