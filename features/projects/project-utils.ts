import { DEFAULT_TASK_CATEGORIES, TASK_CATEGORIES } from "@/lib/constants";
import type { Project } from "@/types/project";
import type { Task } from "@/types/task";
import type { User } from "@/types/user";

export type CreateProjectInput = {
  description: string;
  endDate: string;
  leaderId: string;
  memberIds: string[];
  name: string;
  startDate: string;
};

export type CreateProjectErrors = Partial<Record<"endDate" | "leaderId" | "name" | "startDate", string>>;

export function validateCreateProjectInput(input: CreateProjectInput): CreateProjectErrors {
  const errors: CreateProjectErrors = {};

  if (!input.name.trim()) {
    errors.name = "Project name is required.";
  }

  if (!input.startDate) {
    errors.startDate = "Start date is required.";
  }

  if (!input.endDate) {
    errors.endDate = "End date is required.";
  }

  if (input.startDate && input.endDate && input.endDate < input.startDate) {
    errors.endDate = "End date must be on or after the start date.";
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

export function deriveProjectStatus(project: Pick<Project, "startDate" | "endDate" | "tasks">): Project["status"] {
  if (project.tasks.length > 0 && project.tasks.every((task) => task.status === "done")) {
    return "completed";
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const startDate = new Date(project.startDate);
  startDate.setHours(0, 0, 0, 0);
  const endDate = new Date(project.endDate);
  endDate.setHours(0, 0, 0, 0);

  if (endDate < today) {
    return "completed";
  }

  if (startDate > today) {
    return "planning";
  }

  return "active";
}

export function createProjectFromInput(input: CreateProjectInput, users: User[]): Project {
  const now = new Date().toISOString();
  const projectId = slugify(input.name);
  const leader = users.find((user) => user.id === input.leaderId) ?? users[0];
  const members = users.filter((user) => input.memberIds.includes(user.id) && user.id !== leader.id);
  const tasks = createDefaultTasks(projectId, input.endDate, leader, now);

  const project: Project = {
    id: projectId,
    name: input.name.trim(),
    description: input.description.trim(),
    status: "planning",
    startDate: input.startDate,
    endDate: input.endDate,
    leader,
    members,
    tasks,
    createdAt: now,
    updatedAt: now,
  };

  return {
    ...project,
    status: deriveProjectStatus(project),
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
    assignees: [assignee],
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
