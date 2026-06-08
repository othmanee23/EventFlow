import { mapDatabaseUserToUser, type DatabaseUser } from "@/features/users/user-mappers";
import { deriveProjectStatus } from "@/features/projects/project-utils";
import type { ChecklistItem } from "@/types/checklist";
import type { Comment } from "@/types/comment";
import type { Project, ProjectStatus } from "@/types/project";
import type { Task, TaskCategory, TaskPriority, TaskStatus } from "@/types/task";

type DatabaseChecklistItem = {
  completed: boolean;
  completedAt: Date | null;
  id: string;
  label: string;
  taskId: string;
};

export type DatabaseComment = {
  author: DatabaseUser;
  body: string;
  createdAt: Date;
  id: string;
  taskId: string;
};

type DatabaseTask = {
  assignments: Array<{
    user: DatabaseUser;
  }>;
  category: string;
  checklist: DatabaseChecklistItem[];
  comments: DatabaseComment[];
  createdAt: Date;
  description: string;
  dueDate: Date;
  id: string;
  priority: string;
  projectId: string;
  status: string;
  title: string;
  updatedAt: Date;
};

export type DatabaseProject = {
  createdAt: Date;
  description: string;
  endDate: Date;
  id: string;
  leader: DatabaseUser;
  members: Array<{
    user: DatabaseUser;
  }>;
  name: string;
  slug: string;
  startDate: Date;
  status: string;
  tasks: DatabaseTask[];
  updatedAt: Date;
};

const PROJECT_STATUS_FROM_DATABASE: Record<string, ProjectStatus> = {
  PLANNING: "planning",
  ACTIVE: "active",
  COMPLETED: "completed",
  ON_HOLD: "on_hold",
};

const TASK_STATUS_FROM_DATABASE: Record<string, TaskStatus> = {
  TODO: "todo",
  IN_PROGRESS: "in_progress",
  DONE: "done",
};

const TASK_CATEGORY_FROM_DATABASE: Record<string, TaskCategory> = {
  EVENT_PREPARATION: "event_preparation",
  PARTICIPANTS: "participants",
  COMMUNICATION: "communication",
  LOGISTICS: "logistics",
  AUDIOVISUAL_PRODUCTION: "audiovisual_production",
  POST_EVENT: "post_event",
};

const TASK_PRIORITY_FROM_DATABASE: Record<string, TaskPriority> = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
};

export function mapDatabaseProjectToProject(project: DatabaseProject): Project {
  const mappedProject: Project = {
    id: project.slug,
    name: project.name,
    description: project.description,
    status: PROJECT_STATUS_FROM_DATABASE[project.status] ?? "planning",
    startDate: formatDateOnly(project.startDate),
    endDate: formatDateOnly(project.endDate),
    leader: mapDatabaseUserToUser(project.leader),
    members: project.members.map((member) => mapDatabaseUserToUser(member.user)),
    tasks: project.tasks.map(mapDatabaseTaskToTask),
    createdAt: project.createdAt.toISOString(),
    updatedAt: project.updatedAt.toISOString(),
  };

  return {
    ...mappedProject,
    status: deriveProjectStatus(mappedProject),
  };
}

function mapDatabaseTaskToTask(task: DatabaseTask): Task {
  return {
    id: task.id,
    projectId: task.projectId,
    title: task.title,
    description: task.description,
    category: TASK_CATEGORY_FROM_DATABASE[task.category] ?? "event_preparation",
    status: TASK_STATUS_FROM_DATABASE[task.status] ?? "todo",
    priority: TASK_PRIORITY_FROM_DATABASE[task.priority] ?? "medium",
    dueDate: formatDateOnly(task.dueDate),
    assignees: task.assignments.map((assignment) => mapDatabaseUserToUser(assignment.user)),
    checklist: task.checklist.map(mapDatabaseChecklistItemToChecklistItem),
    comments: task.comments.map(mapDatabaseCommentToComment),
    createdAt: task.createdAt.toISOString(),
    updatedAt: task.updatedAt.toISOString(),
  };
}

function mapDatabaseChecklistItemToChecklistItem(item: DatabaseChecklistItem): ChecklistItem {
  return {
    id: item.id,
    taskId: item.taskId,
    label: item.label,
    completed: item.completed,
    completedAt: item.completedAt?.toISOString(),
  };
}

export function mapDatabaseCommentToComment(comment: DatabaseComment): Comment {
  return {
    id: comment.id,
    taskId: comment.taskId,
    author: mapDatabaseUserToUser(comment.author),
    body: comment.body,
    createdAt: comment.createdAt.toISOString(),
  };
}

function formatDateOnly(date: Date) {
  return date.toISOString().slice(0, 10);
}
