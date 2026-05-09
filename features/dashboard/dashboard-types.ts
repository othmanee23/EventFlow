import type { TaskCategory } from "@/types/task";

export type UpcomingDeadline = {
  id: string;
  projectId: string;
  projectName: string;
  title: string;
  dueDate: string;
  category: TaskCategory;
  assigneeName: string;
  completed: boolean;
};

