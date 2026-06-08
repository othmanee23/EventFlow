"use client";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { CreateProjectModal } from "@/components/projects/create-project-modal";
import { ProjectCard } from "@/components/projects/project-card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { PROJECT_STATUSES } from "@/lib/constants";
import { canCreateProject } from "@/lib/permissions";
import { cn, isPastDate } from "@/lib/utils";
import type { Project, ProjectStatus } from "@/types/project";
import type { User } from "@/types/user";

type ProjectListProps = {
  projects: Project[];
  users: User[];
  viewer: User;
};

type StatusFilter = "all" | ProjectStatus;

const statusFilters: StatusFilter[] = ["all", "planning", "active", "completed", "on_hold"];

export function ProjectList({ projects, users, viewer }: ProjectListProps) {
  const [localProjects, setLocalProjects] = useState<Project[]>(projects);
  const [localProjectIds, setLocalProjectIds] = useState<string[]>([]);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const canCreate = canCreateProject(viewer.role);

  const filteredProjects = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return localProjects.filter((project) => {
      const matchesStatus = statusFilter === "all" || project.status === statusFilter;
      const matchesQuery =
        normalizedQuery.length === 0 ||
        project.name.toLowerCase().includes(normalizedQuery) ||
        project.description.toLowerCase().includes(normalizedQuery) ||
        project.leader.name.toLowerCase().includes(normalizedQuery);

      return matchesStatus && matchesQuery;
    });
  }, [localProjects, query, statusFilter]);
  const activeProjects = filteredProjects.filter((project) => !isPastDate(project.endDate));
  const pastProjects = filteredProjects.filter((project) => isPastDate(project.endDate));

  function handleCreateProject(project: Project, options?: { disableNavigation?: boolean }) {
    setLocalProjects((currentProjects) => [project, ...currentProjects]);
    if (options?.disableNavigation) {
      setLocalProjectIds((currentProjectIds) => [project.id, ...currentProjectIds]);
    }
    setQuery("");
    setStatusFilter("all");
  }

  return (
    <section className="grid gap-5">
      <div className="flex flex-col gap-4 rounded-md border border-border-soft bg-white p-5 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-950">Projects</h2>
          <p className="mt-1 text-sm text-slate-500">Track event preparation from planning through completion.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button onClick={() => window.location.assign("/calendar")} type="button" variant="secondary">
            Calendar
          </Button>
          {canCreate ? <Button onClick={() => setCreateModalOpen(true)}>Create project</Button> : null}
        </div>
      </div>
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
          Showing {filteredProjects.length} of {localProjects.length} projects
        </div>
      </div>

      {localProjects.length === 0 ? (
        <EmptyState title="No projects" description="Create the first event project once project creation is enabled." />
      ) : filteredProjects.length > 0 ? (
        <div className="grid gap-8">
          <section className="grid gap-4">
            <div>
              <h3 className="text-base font-semibold text-slate-950">Current and upcoming events</h3>
              <p className="mt-1 text-sm text-slate-500">Events with an end date today or later.</p>
            </div>
            {activeProjects.length > 0 ? (
              <div className="grid gap-4">
                {activeProjects.map((project) => (
                  <ProjectCard
                    disableNavigation={localProjectIds.includes(project.id)}
                    key={project.id}
                    project={project}
                  />
                ))}
              </div>
            ) : (
              <EmptyState title="No active events" description="Matching events will appear here until their end date passes." />
            )}
          </section>
          <section className="grid gap-4">
            <div>
              <h3 className="text-base font-semibold text-slate-950">Past events</h3>
              <p className="mt-1 text-sm text-slate-500">Events grouped here once their end date has passed.</p>
            </div>
            {pastProjects.length > 0 ? (
              <div className="grid gap-4">
                {pastProjects.map((project) => (
                  <ProjectCard
                    disableNavigation={localProjectIds.includes(project.id)}
                    key={project.id}
                    project={project}
                  />
                ))}
              </div>
            ) : (
              <EmptyState title="No past events" description="Completed events will move here after their end date." />
            )}
          </section>
        </div>
      ) : (
        <EmptyState
          title="No matching projects"
          description="Adjust the search terms or status filter to find another project."
        />
      )}
      <CreateProjectModal
        onClose={() => setCreateModalOpen(false)}
        onCreate={handleCreateProject}
        open={createModalOpen}
        users={users}
      />
    </section>
  );
}
