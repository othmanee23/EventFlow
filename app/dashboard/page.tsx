import { DashboardStats } from "@/components/dashboard/dashboard-stats";
import { RecentProjects } from "@/components/dashboard/recent-projects";
import { AppShell } from "@/components/layout/app-shell";
import { getCurrentSession } from "@/features/auth/auth-service";
import { getProjects } from "@/features/projects/project-service";

export default function DashboardPage() {
  const session = getCurrentSession();
  const projects = getProjects();

  return (
    <AppShell user={session.user} title="Dashboard">
      <div className="grid gap-6">
        <DashboardStats projects={projects} />
        <RecentProjects projects={projects} />
      </div>
    </AppShell>
  );
}

