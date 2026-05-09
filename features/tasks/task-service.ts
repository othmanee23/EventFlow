import type { ChecklistItem } from "@/types/checklist";
import type { Task, TaskStatus } from "@/types/task";

export function getTasksByStatus(tasks: Task[], status: TaskStatus) {
  return tasks.filter((task) => task.status === status);
}

export function getChecklistProgress(checklist: ChecklistItem[]) {
  if (checklist.length === 0) {
    return 0;
  }

  const completedItems = checklist.filter((item) => item.completed).length;
  return Math.round((completedItems / checklist.length) * 100);
}

