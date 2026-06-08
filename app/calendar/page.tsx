import { AppShell } from "@/components/layout/app-shell";
import { ProjectsCalendar } from "@/components/projects/projects-calendar";
import { getRequiredSession } from "@/features/auth/auth-service";
import { getProjects } from "@/features/projects/project-service";

export const dynamic = "force-dynamic";

export default async function CalendarPage() {
  const session = await getRequiredSession();
  const projects = await getProjects(session.user);

  return (
    <AppShell user={session.user} title="Calendar">
      <div className="grid gap-6">
        <section className="rounded-md border border-border-soft bg-white p-5">
          <h2 className="text-lg font-semibold text-slate-950">Events calendar</h2>
          <p className="mt-1 text-sm text-slate-500">View scheduled event windows grouped by month.</p>
        </section>
        <ProjectsCalendar projects={projects} />
      </div>
    </AppShell>
  );
}
