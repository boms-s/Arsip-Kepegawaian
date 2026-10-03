"use client";

import type { PermissionEntry } from "@/types/user-management";

interface PermissionsMatrixProps {
  data: PermissionEntry[];
  mode: "read-only" | "editable";
  canManageUsers?: boolean;
  onChange?: (permissions: PermissionEntry[]) => void;
  title: string;
  description: string;
}

const COLUMNS = [
  ["view", "Lihat"],
  ["create", "Tambah"],
  ["edit", "Edit"],
  ["delete", "Hapus"],
] as const;

export default function PermissionsMatrix({ data, mode, canManageUsers = false, onChange, title, description }: PermissionsMatrixProps) {
  function toggle(module: string, key: typeof COLUMNS[number][0]) {
    if (mode !== "editable" || !onChange) return;
    onChange(data.map((permission) => permission.module === module
      ? { ...permission, [key]: !permission[key] }
      : permission));
  }

  return (
    <section className="permission-matrix-section">
      <div className="permission-matrix-heading">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
      <div className="table-wrapper">
        <table className="table permission-matrix-table">
          <thead><tr><th>Modul</th>{COLUMNS.map(([, label]) => <th key={label}>{label}</th>)}</tr></thead>
          <tbody>
            {data.map((permission) => (
              <tr key={permission.module}>
                <th scope="row">{permission.module}</th>
                {COLUMNS.map(([key, label]) => {
                  const isDisabled = mode === "read-only" || (permission.module === "Kelola User" && !canManageUsers);
                  return (
                    <td key={key}>
                      <input
                        type="checkbox"
                        aria-label={`${label} ${permission.module}`}
                        checked={permission[key]}
                        disabled={isDisabled}
                        onChange={() => toggle(permission.module, key)}
                      />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}