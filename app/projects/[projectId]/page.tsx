import { notFound } from "next/navigation";
import { KanbanBoard } from "@/components/kanban/kanban-board";
import { AppShell } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { getCurrentSession } from "@/features/auth/auth-service";
import { getProjectById } from "@/features/projects/project-service";
import { PROJECT_STATUSES } from "@/lib/constants";
import { formatDate } from "@/lib/utils";

type ProjectPageProps = {
  params: Promise<{
    projectId: string;
  }>;
};

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { projectId } = await params;
  const session = getCurrentSession();
  const project = getProjectById(projectId);

  if (!project) {
    notFound();
  }

  return (
    <AppShell user={session.user} title={project.name}>
      <div className="grid gap-6">
        <section className="rounded-md border border-border-soft bg-white p-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <Badge variant="blue">{PROJECT_STATUSES[project.status]}</Badge>
                <span className="text-sm text-slate-500">Event date: {formatDate(project.eventDate)}</span>
              </div>
              <p className="max-w-3xl text-sm leading-6 text-slate-600">{project.description}</p>
            </div>
            <div className="text-sm text-slate-600">
              <span className="font-medium text-slate-900">Leader:</span> {project.leader.name}
            </div>
          </div>
        </section>
        <KanbanBoard tasks={project.tasks} />
      </div>
    </AppShell>
  );
}

