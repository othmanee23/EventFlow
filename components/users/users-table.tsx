import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { RoleBadge } from "@/components/users/role-badge";
import { canManageUserRole, canManageUsers } from "@/lib/permissions";
import type { User } from "@/types/user";

type UsersTableProps = {
  viewer: User;
  users: User[];
};

export function UsersTable({ users, viewer }: UsersTableProps) {
  const showActions = canManageUsers(viewer.role);

  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[780px] border-collapse text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-[0.12em] text-slate-500">
            <tr>
              <th className="px-5 py-3 font-semibold">User</th>
              <th className="px-5 py-3 font-semibold">Department</th>
              <th className="px-5 py-3 font-semibold">Role</th>
              <th className="px-5 py-3 font-semibold">Email</th>
              {showActions ? <th className="px-5 py-3 text-right font-semibold">Actions</th> : null}
            </tr>
          </thead>
          <tbody className="divide-y divide-border-soft">
            {users.map((user) => {
              const canManage = canManageUserRole(viewer, user);

              return (
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
                  {showActions ? (
                    <td className="px-5 py-4 text-right">
                      <Button disabled={!canManage} variant="secondary">
                        Manage role
                      </Button>
                    </td>
                  ) : null}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
