import { formatDateRange } from "@/lib/utils";
import type { Project } from "@/types/project";

type ProjectsCalendarProps = {
  projects: Project[];
};

export function ProjectsCalendar({ projects }: ProjectsCalendarProps) {
  const sortedProjects = [...projects].sort(
    (first, second) => new Date(first.startDate).getTime() - new Date(second.startDate).getTime(),
  );
  const monthMap = new Map<string, Project[]>();

  for (const project of sortedProjects) {
    const monthKey = new Intl.DateTimeFormat("en", {
      month: "long",
      year: "numeric",
    }).format(new Date(project.startDate));
    const currentMonthProjects = monthMap.get(monthKey) ?? [];
    currentMonthProjects.push(project);
    monthMap.set(monthKey, currentMonthProjects);
  }

  const months = Array.from(monthMap.entries());

  return (
    <div className="grid gap-8">
      {months.map(([month, monthProjects]) => (
        <section className="grid gap-4" key={month}>
          <div>
            <h2 className="text-lg font-semibold text-slate-950">{month}</h2>
            <p className="text-sm text-slate-500">Scheduled events and date ranges.</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {monthProjects.map((project) => (
              <article className="rounded-md border border-border-soft bg-white p-5" key={project.id}>
                <p className="text-xs font-medium uppercase tracking-[0.12em] text-slate-500">{project.status}</p>
                <h3 className="mt-2 text-base font-semibold text-slate-950">{project.name}</h3>
                <p className="mt-2 text-sm text-slate-600">{project.description}</p>
                <p className="mt-4 text-sm font-medium text-brand-blue">
                  {formatDateRange(project.startDate, project.endDate)}
                </p>
                <p className="mt-2 text-sm text-slate-500">Leader: {project.leader.name}</p>
              </article>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
