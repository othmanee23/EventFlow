import { CheckCircle2, MinusCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { ROLES } from "@/lib/constants";
import { ROLE_PERMISSIONS } from "@/lib/permissions";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/types/user";

const permissionRows = [
  {
    key: "createProjects",
    label: "Create projects",
  },
  {
    key: "editProjects",
    label: "Edit projects",
  },
  {
    key: "assignTasks",
    label: "Assign tasks",
  },
  {
    key: "manageUsers",
    label: "Manage users",
  },
] as const;

export function RolePermissions() {
  const roles: UserRole[] = ["admin", "leader", "member"];

  return (
    <Card className="overflow-hidden">
      <div className="border-b border-border-soft p-5">
        <h2 className="text-lg font-semibold text-slate-950">Role permissions</h2>
        <p className="mt-1 text-sm text-slate-500">Centralized permission rules currently used by the interface.</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-[0.12em] text-slate-500">
            <tr>
              <th className="px-5 py-3 font-semibold">Permission</th>
              {roles.map((role) => (
                <th className="px-5 py-3 text-center font-semibold" key={role}>
                  {ROLES[role]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border-soft">
            {permissionRows.map((permission) => (
              <tr key={permission.key}>
                <td className="px-5 py-4 font-medium text-slate-950">{permission.label}</td>
                {roles.map((role) => {
                  const allowed = ROLE_PERMISSIONS[role][permission.key];
                  const Icon = allowed ? CheckCircle2 : MinusCircle;

                  return (
                    <td className="px-5 py-4 text-center" key={role}>
                      <Icon
                        aria-label={allowed ? "Allowed" : "Not allowed"}
                        className={cn("mx-auto h-5 w-5", allowed ? "text-emerald-600" : "text-slate-300")}
                      />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

