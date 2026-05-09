import type { UpcomingDeadline } from "@/features/dashboard/dashboard-types";
import type { Project } from "@/types/project";

export function getUpcomingDeadlines(projects: Project[], limit = 5): UpcomingDeadline[] {
  return projects
    .flatMap((project) =>
      project.tasks.map((task) => ({
        id: task.id,
        projectId: project.id,
        projectName: project.name,
        title: task.title,
        dueDate: task.dueDate,
        category: task.category,
        assigneeName: task.assignee.name,
        completed: task.status === "done",
      })),
    )
    .filter((deadline) => !deadline.completed)
    .sort((first, second) => new Date(first.dueDate).getTime() - new Date(second.dueDate).getTime())
    .slice(0, limit);
}

