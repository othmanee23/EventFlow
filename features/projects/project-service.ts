import { mockProjects } from "@/lib/mock-data";
import type { Project } from "@/types/project";

export function getProjects(): Project[] {
  return mockProjects;
}

export function getProjectById(projectId: string): Project | undefined {
  return mockProjects.find((project) => project.id === projectId);
}

export function getProjectProgress(project: Project) {
  if (project.tasks.length === 0) {
    return 0;
  }

  const completedTasks = project.tasks.filter((task) => task.status === "done").length;
  return Math.round((completedTasks / project.tasks.length) * 100);
}

