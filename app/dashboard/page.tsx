import { DashboardStats } from "@/components/dashboard/dashboard-stats";
import { RecentProjects } from "@/components/dashboard/recent-projects";
import { UpcomingDeadlines } from "@/components/dashboard/upcoming-deadlines";
import { AppShell } from "@/components/layout/app-shell";
import { getRequiredSession } from "@/features/auth/auth-service";
import { getUpcomingDeadlines } from "@/features/dashboard/dashboard-service";
import { getProjects } from "@/features/projects/project-service";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await getRequiredSession();
  const projects = await getProjects();
  const deadlines = getUpcomingDeadlines(projects);

  return (
    <AppShell user={session.user} title="Dashboard">
      <div className="grid gap-6">
        <DashboardStats projects={projects} />
        <div className="grid gap-6 xl:grid-cols-[1.3fr_0.9fr]">
          <RecentProjects projects={projects} />
          <UpcomingDeadlines deadlines={deadlines} />
        </div>
      </div>
    </AppShell>
  );
}
