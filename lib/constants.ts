import type { ProjectStatus } from "@/types/project";
import type { TaskCategory, TaskStatus } from "@/types/task";
import type { UserRole } from "@/types/user";

export const APP_NAME = "EventFlow";

export const ROLES: Record<UserRole, string> = {
  admin: "Admin",
  leader: "Leader",
  member: "Member",
};

export const PROJECT_STATUSES: Record<ProjectStatus, string> = {
  planning: "Planning",
  active: "Active",
  completed: "Completed",
  on_hold: "On hold",
};

export const TASK_STATUSES: Record<TaskStatus, string> = {
  todo: "To Do",
  in_progress: "In Progress",
  done: "Done",
};

export const TASK_STATUS_ORDER: TaskStatus[] = ["todo", "in_progress", "done"];

export const TASK_CATEGORIES: Record<TaskCategory, string> = {
  event_preparation: "Event preparation",
  participants: "Participants",
  communication: "Communication",
  logistics: "Logistics",
  audiovisual_production: "Audiovisual production",
  post_event: "Post-event",
};

export const DEFAULT_TASK_CATEGORIES: TaskCategory[] = [
  "event_preparation",
  "participants",
  "communication",
  "logistics",
  "audiovisual_production",
  "post_event",
];

