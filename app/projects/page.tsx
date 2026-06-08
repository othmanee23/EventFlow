import { AppShell } from "@/components/layout/app-shell";
import { ProjectList } from "@/components/projects/project-list";
import { getRequiredSession } from "@/features/auth/auth-service";
import { getProjects } from "@/features/projects/project-service";
import { getUsers } from "@/features/users/user-service";

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const session = await getRequiredSession();
  const projects = await getProjects(session.user);
  const users = await getUsers();

  return (
    <AppShell user={session.user} title="Projects">
      <ProjectList projects={projects} users={users} viewer={session.user} />
    </AppShell>
  );
}
