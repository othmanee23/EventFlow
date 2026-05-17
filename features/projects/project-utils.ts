import { DEFAULT_TASK_CATEGORIES, TASK_CATEGORIES } from "@/lib/constants";
import type { Project } from "@/types/project";
import type { Task } from "@/types/task";
import type { User } from "@/types/user";

export type CreateProjectInput = {
  description: string;
  eventDate: string;
  leaderId: string;
  memberIds: string[];
  name: string;
};

export type CreateProjectErrors = Partial<Record<"eventDate" | "leaderId" | "name", string>>;

export function validateCreateProjectInput(input: CreateProjectInput): CreateProjectErrors {
  const errors: CreateProjectErrors = {};

  if (!input.name.trim()) {
    errors.name = "Project name is required.";
  }

  if (!input.eventDate) {
    errors.eventDate = "Event date is required.";
  }

  if (!input.leaderId) {
    errors.leaderId = "Leader is required.";
  }

  return errors;
}

export function hasCreateProjectErrors(errors: CreateProjectErrors) {
  return Object.keys(errors).length > 0;
}

export function getProjectProgress(project: Project) {
  if (project.tasks.length === 0) {
    return 0;
  }

  const completedTasks = project.tasks.filter((task) => task.status === "done").length;
  return Math.round((completedTasks / project.tasks.length) * 100);
}

export function createProjectFromInput(input: CreateProjectInput, users: User[]): Project {
  const now = new Date().toISOString();
  const projectId = slugify(input.name);
  const leader = users.find((user) => user.id === input.leaderId) ?? users[0];
  const members = users.filter((user) => input.memberIds.includes(user.id) && user.id !== leader.id);

  return {
    id: projectId,
    name: input.name.trim(),
    description: input.description.trim(),
    status: "planning",
    eventDate: input.eventDate,
    leader,
    members,
    tasks: createDefaultTasks(projectId, input.eventDate, leader, now),
    createdAt: now,
    updatedAt: now,
  };
}

function createDefaultTasks(projectId: string, dueDate: string, assignee: User, now: string): Task[] {
  return DEFAULT_TASK_CATEGORIES.map((category) => ({
    id: `${projectId}-${category}`,
    projectId,
    title: TASK_CATEGORIES[category],
    description: `Initial ${TASK_CATEGORIES[category].toLowerCase()} task for this event project.`,
    category,
    status: "todo",
    priority: "medium",
    dueDate,
    assignee,
    checklist: [],
    comments: [],
    createdAt: now,
    updatedAt: now,
  }));
}

export function slugify(value: string) {
  const slug = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

  return slug || `project-${Date.now()}`;
}
