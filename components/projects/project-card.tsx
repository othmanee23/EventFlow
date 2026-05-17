import Link from "next/link";
import { CalendarDays, ListChecks, UserRound } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getProjectProgress } from "@/features/projects/project-service";
import { PROJECT_STATUSES } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import type { Project } from "@/types/project";

type ProjectCardProps = {
  disableNavigation?: boolean;
  project: Project;
};

export function ProjectCard({ disableNavigation = false, project }: ProjectCardProps) {
  const progress = getProjectProgress(project);

  return (
    <Card className="transition-colors hover:border-blue-200">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div>
            <Badge variant={project.status === "completed" ? "green" : "blue"}>{PROJECT_STATUSES[project.status]}</Badge>
            <CardTitle className="mt-3 text-lg">
              {disableNavigation ? (
                <span>{project.name}</span>
              ) : (
                <Link href={`/projects/${project.id}`}>{project.name}</Link>
              )}
            </CardTitle>
          </div>
          <span className="text-sm font-semibold text-brand-blue">{progress}%</span>
        </div>
      </CardHeader>
      <CardContent>
        <p className="line-clamp-2 text-sm leading-6 text-slate-600">{project.description}</p>
        <div className="mt-5 grid gap-3 text-sm text-slate-500 sm:grid-cols-3">
          <span className="flex items-center gap-2">
            <CalendarDays aria-hidden="true" className="h-4 w-4" />
            {formatDate(project.eventDate)}
          </span>
          <span className="flex items-center gap-2">
            <UserRound aria-hidden="true" className="h-4 w-4" />
            {project.leader.name}
          </span>
          <span className="flex items-center gap-2">
            <ListChecks aria-hidden="true" className="h-4 w-4" />
            {project.tasks.length} tasks
          </span>
        </div>
        <div className="mt-5 h-2 rounded-full bg-slate-100">
          <div className="h-2 rounded-full bg-brand-blue" style={{ width: `${progress}%` }} />
        </div>
      </CardContent>
    </Card>
  );
}
