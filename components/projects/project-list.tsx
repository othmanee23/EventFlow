import { ProjectCard } from "@/components/projects/project-card";
import { EmptyState } from "@/components/ui/empty-state";
import type { Project } from "@/types/project";

type ProjectListProps = {
  projects: Project[];
};

export function ProjectList({ projects }: ProjectListProps) {
  if (projects.length === 0) {
    return <EmptyState title="No projects" description="Create the first event project once project creation is enabled." />;
  }

  return (
    <section className="grid gap-4">
      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </section>
  );
}

