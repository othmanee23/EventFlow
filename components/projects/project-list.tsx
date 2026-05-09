"use client";

import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { ProjectCard } from "@/components/projects/project-card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { PROJECT_STATUSES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { Project, ProjectStatus } from "@/types/project";

type ProjectListProps = {
  projects: Project[];
};

type StatusFilter = "all" | ProjectStatus;

const statusFilters: StatusFilter[] = ["all", "planning", "active", "completed", "on_hold"];

export function ProjectList({ projects }: ProjectListProps) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const filteredProjects = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return projects.filter((project) => {
      const matchesStatus = statusFilter === "all" || project.status === statusFilter;
      const matchesQuery =
        normalizedQuery.length === 0 ||
        project.name.toLowerCase().includes(normalizedQuery) ||
        project.description.toLowerCase().includes(normalizedQuery) ||
        project.leader.name.toLowerCase().includes(normalizedQuery);

      return matchesStatus && matchesQuery;
    });
  }, [projects, query, statusFilter]);

  if (projects.length === 0) {
    return <EmptyState title="No projects" description="Create the first event project once project creation is enabled." />;
  }

  return (
    <section className="grid gap-5">
      <div className="rounded-md border border-border-soft bg-white p-4">
        <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
          <div className="relative">
            <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-9 h-4 w-4 text-slate-400" />
            <Input
              className="pl-9"
              label="Search projects"
              name="project-search"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by project, description, or leader"
              type="search"
              value={query}
            />
          </div>
          <div className="grid gap-2">
            <p className="text-sm font-medium text-slate-700">Status</p>
            <div className="flex flex-wrap gap-2">
              {statusFilters.map((status) => (
                <button
                  className={cn(
                    "h-10 rounded-md border border-border-soft px-3 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50",
                    statusFilter === status && "border-brand-blue bg-brand-sky text-brand-blue",
                  )}
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  type="button"
                >
                  {status === "all" ? "All" : PROJECT_STATUSES[status]}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-4 text-sm text-slate-500">
          Showing {filteredProjects.length} of {projects.length} projects
        </div>
      </div>

      {filteredProjects.length > 0 ? (
        <div className="grid gap-4">
          {filteredProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No matching projects"
          description="Adjust the search terms or status filter to find another project."
        />
      )}
    </section>
  );
}
