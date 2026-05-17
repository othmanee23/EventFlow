import { AppShell } from "@/components/layout/app-shell";
import { ProjectList } from "@/components/projects/project-list";
import { getCurrentSession } from "@/features/auth/auth-service";
import { getProjects } from "@/features/projects/project-service";
import { getUsers } from "@/features/users/user-service";

export default function ProjectsPage() {
  const session = getCurrentSession();
  const projects = getProjects();
  const users = getUsers();

  return (
    <AppShell user={session.user} title="Projects">
      <ProjectList projects={projects} users={users} viewer={session.user} />
    </AppShell>
  );
}
