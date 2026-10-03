export type EmployeeStatus = "PNS_AKTIF" | "PPPK_KONTRAK" | "PENSIUN";

export interface Employee {
  id: string;
  nip: string;
  name: string;
  position: string;
  department: string;
  bidang?: string;
  golongan?: string;
  email?: string;
  phone?: string;
  status: EmployeeStatus;
}

export type EmployeeInput = Omit<Employee, "id">;