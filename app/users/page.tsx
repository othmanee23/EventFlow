import { AppShell } from "@/components/layout/app-shell";
import { RolePermissions } from "@/components/users/role-permissions";
import { UsersManagementHeader } from "@/components/users/users-management-header";
import { UsersRoleSummary } from "@/components/users/users-role-summary";
import { UsersTable } from "@/components/users/users-table";
import { getRequiredSession } from "@/features/auth/auth-service";
import { getUsers } from "@/features/users/user-service";
import { canManageUsers } from "@/lib/permissions";

export const dynamic = "force-dynamic";

export default async function UsersPage() {
  const session = await getRequiredSession();
  const users = await getUsers();

  return (
    <AppShell user={session.user} title="Users">
      <div className="grid gap-6">
        <UsersManagementHeader canInviteUsers={canManageUsers(session.user.role)} />
        <UsersRoleSummary users={users} />
        <UsersTable users={users} viewer={session.user} />
        <RolePermissions />
      </div>
    </AppShell>
  );
}
