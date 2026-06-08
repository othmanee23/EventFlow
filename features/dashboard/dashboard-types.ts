import type { TaskCategory } from "@/types/task";

export type UpcomingDeadline = {
  id: string;
  projectId: string;
  projectName: string;
  title: string;
  dueDate: string;
  category: TaskCategory;
  assigneeNames: string;
  completed: boolean;
};
