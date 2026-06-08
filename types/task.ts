import type { ChecklistItem } from "@/types/checklist";
import type { Comment } from "@/types/comment";
import type { User } from "@/types/user";

export type TaskStatus = "todo" | "in_progress" | "done";

export type TaskCategory =
  | "event_preparation"
  | "participants"
  | "communication"
  | "logistics"
  | "audiovisual_production"
  | "post_event";

export type TaskPriority = "low" | "medium" | "high";

export type Task = {
  id: string;
  projectId: string;
  title: string;
  description: string;
  category: TaskCategory;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string;
  assignees: User[];
  checklist: ChecklistItem[];
  comments: Comment[];
  createdAt: string;
  updatedAt: string;
};
