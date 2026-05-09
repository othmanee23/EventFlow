import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ProjectCard } from "@/components/projects/project-card";
import { EmptyState } from "@/components/ui/empty-state";
import type { Project } from "@/types/project";

type RecentProjectsProps = {
  projects: Project[];
};

export function RecentProjects({ projects }: RecentProjectsProps) {
  if (projects.length === 0) {
    return <EmptyState title="No projects yet" description="Projects will appear here when the event pipeline starts." />;
  }

  return (
    <section>
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-950">Recent projects</h2>
          <p className="text-sm text-slate-500">Latest event preparation workspaces.</p>
        </div>
        <Link className="inline-flex items-center gap-2 text-sm font-medium text-brand-blue" href="/projects">
          View all
          <ArrowRight aria-hidden="true" className="h-4 w-4" />
        </Link>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {projects.slice(0, 4).map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </section>
  );
}

