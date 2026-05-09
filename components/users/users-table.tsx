import { Avatar } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { RoleBadge } from "@/components/users/role-badge";
import type { User } from "@/types/user";

type UsersTableProps = {
  users: User[];
};

export function UsersTable({ users }: UsersTableProps) {
  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[680px] border-collapse text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-[0.12em] text-slate-500">
            <tr>
              <th className="px-5 py-3 font-semibold">User</th>
              <th className="px-5 py-3 font-semibold">Department</th>
              <th className="px-5 py-3 font-semibold">Role</th>
              <th className="px-5 py-3 font-semibold">Email</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-soft">
            {users.map((user) => (
              <tr className="bg-white" key={user.id}>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <Avatar name={user.name} />
                    <span className="font-medium text-slate-950">{user.name}</span>
                  </div>
                </td>
                <td className="px-5 py-4 text-slate-600">{user.department}</td>
                <td className="px-5 py-4">
                  <RoleBadge role={user.role} />
                </td>
                <td className="px-5 py-4 text-slate-600">{user.email}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

