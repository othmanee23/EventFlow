import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { RolePermissions } from "@/components/users/role-permissions";
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
        <section className="flex flex-col gap-4 rounded-md border border-border-soft bg-white p-5 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-950">User management</h2>
            <p className="mt-1 text-sm text-slate-500">
              Review internal access and role responsibilities for the Events workspace.
            </p>
          </div>
          {canManageUsers(session.user.role) ? <Button>Invite user</Button> : null}
        </section>
        <UsersRoleSummary users={users} />
        <UsersTable users={users} viewer={session.user} />
        <RolePermissions />
      </div>
    </AppShell>
  );
}
