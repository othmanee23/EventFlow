import { AppShell } from "@/components/layout/app-shell";
import { UsersTable } from "@/components/users/users-table";
import { getCurrentSession } from "@/features/auth/auth-service";
import { getUsers } from "@/features/users/user-service";

export default function UsersPage() {
  const session = getCurrentSession();
  const users = getUsers();

  return (
    <AppShell user={session.user} title="Users">
      <UsersTable users={users} />
    </AppShell>
  );
}

