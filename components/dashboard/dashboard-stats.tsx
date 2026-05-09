import { CalendarDays, CheckCircle2, ClipboardList, FolderKanban } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { Project } from "@/types/project";

type DashboardStatsProps = {
  projects: Project[];
};

export function DashboardStats({ projects }: DashboardStatsProps) {
  const taskCount = projects.reduce((total, project) => total + project.tasks.length, 0);
  const completedTaskCount = projects.reduce(
    (total, project) => total + project.tasks.filter((task) => task.status === "done").length,
    0,
  );
  const activeProjectCount = projects.filter((project) => project.status === "active").length;

  const stats = [
    {
      label: "Active projects",
      value: activeProjectCount,
      icon: FolderKanban,
    },
    {
      label: "Tracked tasks",
      value: taskCount,
      icon: ClipboardList,
    },
    {
      label: "Completed tasks",
      value: completedTaskCount,
      icon: CheckCircle2,
    },
    {
      label: "Upcoming events",
      value: projects.length,
      icon: CalendarDays,
    },
  ];

  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;

        return (
          <Card key={stat.label}>
            <CardContent className="flex items-center justify-between p-5">
              <div>
                <p className="text-sm text-slate-500">{stat.label}</p>
                <p className="mt-2 text-3xl font-semibold tracking-normal text-slate-950">{stat.value}</p>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-md bg-brand-sky text-brand-blue">
                <Icon aria-hidden="true" className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </section>
  );
}

