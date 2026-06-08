"use server";

import { revalidatePath } from "next/cache";
import { getRequiredSession } from "@/features/auth/auth-service";
import { mapDatabaseCommentToComment } from "@/features/projects/project-mappers";
import { mapDatabaseUserToUser } from "@/features/users/user-mappers";
import { TASK_STATUS_ORDER } from "@/lib/constants";
import { canAssignTasks, canUpdateAssignedTask } from "@/lib/permissions";
import { getPrisma, shouldUseMockFallback } from "@/lib/prisma";
import {
  TaskCategory as DatabaseTaskCategory,
  TaskPriority as DatabaseTaskPriority,
  TaskStatus as DatabaseTaskStatus,
} from "@/prisma/generated/prisma/enums";
import type { ChecklistItem } from "@/types/checklist";
import type { Comment } from "@/types/comment";
import type { Task, TaskCategory, TaskPriority, TaskStatus } from "@/types/task";

type PersistenceFailureReason = "database_not_configured" | "invalid_input" | "not_found" | "forbidden" | "database_error";

type ActionFailure = {
  message: string;
  persisted: false;
  reason: PersistenceFailureReason;
  success: false;
};

type UpdateTaskStatusResult =
  | {
      persisted: true;
      success: true;
      updatedAt: string;
    }
  | ActionFailure;

type ToggleChecklistItemResult =
  | {
      completedAt?: string;
      persisted: true;
      success: true;
      updatedAt: string;
    }
  | ActionFailure;

type AddTaskCommentResult =
  | {
      comment: Comment;
      persisted: true;
      success: true;
      updatedAt: string;
    }
  | ActionFailure;

type AddChecklistItemResult =
  | {
      item: ChecklistItem;
      persisted: true;
      success: true;
      updatedAt: string;
    }
  | ActionFailure;

type TaskMutationInput = {
  assigneeIds: string[];
  category: TaskCategory;
  description: string;
  dueDate: string;
  priority: TaskPriority;
  status: TaskStatus;
  title: string;
};

type CreateTaskResult =
  | {
      persisted: true;
      success: true;
      task: Task;
    }
  | ActionFailure;

type UpdateTaskResult =
  | {
      persisted: true;
      success: true;
      task: Task;
    }
  | ActionFailure;

type DeleteTaskResult =
  | {
      persisted: true;
      success: true;
      taskId: string;
    }
  | ActionFailure;

const TASK_STATUS_TO_DATABASE: Record<TaskStatus, DatabaseTaskStatus> = {
  todo: DatabaseTaskStatus.TODO,
  in_progress: DatabaseTaskStatus.IN_PROGRESS,
  done: DatabaseTaskStatus.DONE,
};

const TASK_CATEGORY_TO_DATABASE: Record<TaskCategory, DatabaseTaskCategory> = {
  event_preparation: DatabaseTaskCategory.EVENT_PREPARATION,
  participants: DatabaseTaskCategory.PARTICIPANTS,
  communication: DatabaseTaskCategory.COMMUNICATION,
  logistics: DatabaseTaskCategory.LOGISTICS,
  audiovisual_production: DatabaseTaskCategory.AUDIOVISUAL_PRODUCTION,
  post_event: DatabaseTaskCategory.POST_EVENT,
};

const TASK_PRIORITY_TO_DATABASE: Record<TaskPriority, DatabaseTaskPriority> = {
  low: DatabaseTaskPriority.LOW,
  medium: DatabaseTaskPriority.MEDIUM,
  high: DatabaseTaskPriority.HIGH,
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

type DatabaseTaskPayload = {
  assignments: Array<{
    user: {
      avatarUrl: string | null;
      department: string;
      email: string;
      id: string;
      name: string;
      role: string;
    };
  }>;
  category: string;
  checklist: Array<{
    completed: boolean;
    completedAt: Date | null;
    id: string;
    label: string;
    taskId: string;
  }>;
  comments: Array<{
    author: {
      avatarUrl: string | null;
      department: string;
      email: string;
      id: string;
      name: string;
      role: string;
    };
    body: string;
    createdAt: Date;
    id: string;
    taskId: string;
  }>;
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

export async function updateTaskStatusAction(
  taskId: string,
  status: TaskStatus,
): Promise<UpdateTaskStatusResult> {
  const session = await getRequiredSession();
  const prisma = getPrisma();

  if (!prisma) {
    return createDatabaseNotConfiguredResult();
  }

  try {
    const existingTask = await prisma.task.findUnique({
      where: {
        id: taskId,
      },
      select: {
        assignments: {
          select: {
            userId: true,
          },
        },
        project: {
          select: {
            slug: true,
          },
        },
      },
    });

    if (!existingTask) {
      return createNotFoundResult("Task was not found in the database.");
    }

    if (!canUpdateAssignedTask(session.user, existingTask.assignments.map((assignment) => assignment.userId))) {
      return createForbiddenResult("You do not have permission to update this task.");
    }

    const task = await prisma.task.update({
      where: {
        id: taskId,
      },
      data: {
        status: TASK_STATUS_TO_DATABASE[status],
      },
      select: {
        updatedAt: true,
      },
    });

    revalidateTaskPaths(existingTask.project.slug);

    return {
      success: true,
      persisted: true,
      updatedAt: task.updatedAt.toISOString(),
    };
  } catch (error) {
    console.error("Task status update failed.", error);
    return createDatabaseErrorResult("Task status could not be saved.");
  }
}

export async function createTaskAction(projectId: string, input: TaskMutationInput): Promise<CreateTaskResult> {
  const session = await getRequiredSession();
  const validationError = validateTaskMutationInput(input);

  if (validationError) {
    return createInvalidInputResult(validationError);
  }

  if (!canAssignTasks(session.user.role)) {
    return createForbiddenResult("You do not have permission to create tasks.");
  }

  const prisma = getPrisma();

  if (!prisma) {
    return createDatabaseNotConfiguredResult();
  }

  try {
    const project = await prisma.project.findFirst({
      where: {
        OR: [{ id: projectId }, { slug: projectId }],
      },
      select: {
        id: true,
        leaderId: true,
        members: {
          select: {
            userId: true,
          },
        },
        slug: true,
      },
    });

    if (!project) {
      return createNotFoundResult("Project was not found in the database.");
    }

    const validAssigneeIds = validateAssigneeIdsForProject(input.assigneeIds, project);

    if (!validAssigneeIds.valid) {
      return createInvalidInputResult(validAssigneeIds.message);
    }

    const task = await prisma.task.create({
      data: {
        projectId: project.id,
        title: input.title.trim(),
        description: input.description.trim(),
        category: TASK_CATEGORY_TO_DATABASE[input.category],
        status: TASK_STATUS_TO_DATABASE[input.status],
        priority: TASK_PRIORITY_TO_DATABASE[input.priority],
        dueDate: createDateFromInput(input.dueDate),
        assignments: {
          create: input.assigneeIds.map((userId) => ({
            userId,
          })),
        },
      },
      include: taskInclude,
    });

    revalidateTaskPaths(project.slug);

    return {
      success: true,
      persisted: true,
      task: mapTaskRecord(task),
    };
  } catch (error) {
    console.error("Task creation failed.", error);
    return createDatabaseErrorResult("Task could not be created.");
  }
}

export async function updateTaskAction(taskId: string, input: TaskMutationInput): Promise<UpdateTaskResult> {
  const session = await getRequiredSession();
  const validationError = validateTaskMutationInput(input);

  if (validationError) {
    return createInvalidInputResult(validationError);
  }

  if (!canAssignTasks(session.user.role)) {
    return createForbiddenResult("You do not have permission to edit tasks.");
  }

  const prisma = getPrisma();

  if (!prisma) {
    return createDatabaseNotConfiguredResult();
  }

  try {
    const existingTask = await prisma.task.findUnique({
      where: {
        id: taskId,
      },
      select: {
        id: true,
        project: {
          select: {
            leaderId: true,
            members: {
              select: {
                userId: true,
              },
            },
            slug: true,
          },
        },
      },
    });

    if (!existingTask) {
      return createNotFoundResult("Task was not found in the database.");
    }

    const validAssigneeIds = validateAssigneeIdsForProject(input.assigneeIds, existingTask.project);

    if (!validAssigneeIds.valid) {
      return createInvalidInputResult(validAssigneeIds.message);
    }

    const task = await prisma.task.update({
      where: {
        id: taskId,
      },
      data: {
        title: input.title.trim(),
        description: input.description.trim(),
        category: TASK_CATEGORY_TO_DATABASE[input.category],
        status: TASK_STATUS_TO_DATABASE[input.status],
        priority: TASK_PRIORITY_TO_DATABASE[input.priority],
        dueDate: createDateFromInput(input.dueDate),
        assignments: {
          deleteMany: {},
          create: input.assigneeIds.map((userId) => ({
            userId,
          })),
        },
      },
      include: taskInclude,
    });

    revalidateTaskPaths(existingTask.project.slug);

    return {
      success: true,
      persisted: true,
      task: mapTaskRecord(task),
    };
  } catch (error) {
    console.error("Task update failed.", error);
    return createDatabaseErrorResult("Task could not be updated.");
  }
}

export async function deleteTaskAction(taskId: string): Promise<DeleteTaskResult> {
  const session = await getRequiredSession();

  if (!canAssignTasks(session.user.role)) {
    return createForbiddenResult("You do not have permission to delete tasks.");
  }

  const prisma = getPrisma();

  if (!prisma) {
    return createDatabaseNotConfiguredResult();
  }

  try {
    const existingTask = await prisma.task.findUnique({
      where: {
        id: taskId,
      },
      select: {
        id: true,
        project: {
          select: {
            slug: true,
          },
        },
      },
    });

    if (!existingTask) {
      return createNotFoundResult("Task was not found in the database.");
    }

    await prisma.task.delete({
      where: {
        id: taskId,
      },
    });

    revalidateTaskPaths(existingTask.project.slug);

    return {
      success: true,
      persisted: true,
      taskId,
    };
  } catch (error) {
    console.error("Task deletion failed.", error);
    return createDatabaseErrorResult("Task could not be deleted.");
  }
}

export async function toggleChecklistItemAction(
  itemId: string,
  completed: boolean,
): Promise<ToggleChecklistItemResult> {
  const session = await getRequiredSession();
  const prisma = getPrisma();

  if (!prisma) {
    return createDatabaseNotConfiguredResult();
  }

  try {
    const completedAt = completed ? new Date() : null;
    const existingItem = await prisma.checklistItem.findUnique({
      where: {
        id: itemId,
      },
      select: {
        task: {
          select: {
            assignments: {
              select: {
                userId: true,
              },
            },
            project: {
              select: {
                slug: true,
              },
            },
          },
        },
      },
    });

    if (!existingItem) {
      return createNotFoundResult("Checklist item was not found in the database.");
    }

    if (!canUpdateAssignedTask(session.user, existingItem.task.assignments.map((assignment) => assignment.userId))) {
      return createForbiddenResult("You do not have permission to update this checklist item.");
    }

    const item = await prisma.checklistItem.update({
      where: {
        id: itemId,
      },
      data: {
        completed,
        completedAt,
      },
      select: {
        completedAt: true,
        updatedAt: true,
      },
    });

    revalidateTaskPaths(existingItem.task.project.slug);

    return {
      success: true,
      persisted: true,
      completedAt: item.completedAt?.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
    };
  } catch (error) {
    console.error("Checklist item update failed.", error);
    return createDatabaseErrorResult("Checklist item could not be saved.");
  }
}

export async function addTaskCommentAction(
  taskId: string,
  body: string,
): Promise<AddTaskCommentResult> {
  const session = await getRequiredSession();
  const trimmedBody = body.trim();

  if (!trimmedBody) {
    return {
      success: false,
      persisted: false,
      reason: "invalid_input",
      message: "Comment cannot be empty.",
    };
  }

  const prisma = getPrisma();

  if (!prisma) {
    return createDatabaseNotConfiguredResult();
  }

  try {
    const task = await prisma.task.findUnique({
      where: {
        id: taskId,
      },
      select: {
        assignments: {
          select: {
            userId: true,
          },
        },
        project: {
          select: {
            slug: true,
          },
        },
      },
    });

    if (!task) {
      return createNotFoundResult("Task was not found in the database.");
    }

    const comment = await prisma.comment.create({
      data: {
        taskId,
        authorId: session.user.id,
        body: trimmedBody,
      },
      include: {
        author: true,
      },
    });
    const updatedTask = await prisma.task.update({
      where: {
        id: taskId,
      },
      data: {
        updatedAt: new Date(),
      },
      select: {
        updatedAt: true,
        project: {
          select: {
            slug: true,
          },
        },
      },
    });

    revalidateTaskPaths(updatedTask.project.slug);

    return {
      success: true,
      persisted: true,
      comment: mapDatabaseCommentToComment(comment),
      updatedAt: updatedTask.updatedAt.toISOString(),
    };
  } catch (error) {
    console.error("Task comment creation failed.", error);
    return createDatabaseErrorResult("Comment could not be saved.");
  }
}

export async function addChecklistItemAction(
  taskId: string,
  label: string,
): Promise<AddChecklistItemResult> {
  const session = await getRequiredSession();
  const trimmedLabel = label.trim();

  if (!trimmedLabel) {
    return {
      success: false,
      persisted: false,
      reason: "invalid_input",
      message: "Checklist item cannot be empty.",
    };
  }

  const prisma = getPrisma();

  if (!prisma) {
    return createDatabaseNotConfiguredResult();
  }

  try {
    const task = await prisma.task.findUnique({
      where: {
        id: taskId,
      },
      select: {
        assignments: {
          select: {
            userId: true,
          },
        },
        project: {
          select: {
            slug: true,
          },
        },
      },
    });

    if (!task) {
      return createNotFoundResult("Task was not found in the database.");
    }

    if (!canUpdateAssignedTask(session.user, task.assignments.map((assignment) => assignment.userId))) {
      return createForbiddenResult("You do not have permission to add checklist items to this task.");
    }

    const item = await prisma.checklistItem.create({
      data: {
        taskId,
        label: trimmedLabel,
        completed: false,
      },
      select: {
        id: true,
        taskId: true,
        label: true,
        completed: true,
        completedAt: true,
      },
    });
    const updatedTask = await prisma.task.update({
      where: {
        id: taskId,
      },
      data: {
        updatedAt: new Date(),
      },
      select: {
        updatedAt: true,
      },
    });

    revalidateTaskPaths(task.project.slug);

    return {
      success: true,
      persisted: true,
      item: {
        id: item.id,
        taskId: item.taskId,
        label: item.label,
        completed: item.completed,
        completedAt: item.completedAt?.toISOString(),
      },
      updatedAt: updatedTask.updatedAt.toISOString(),
    };
  } catch (error) {
    console.error("Checklist item creation failed.", error);
    return createDatabaseErrorResult("Checklist item could not be saved.");
  }
}

function createDatabaseNotConfiguredResult(): ActionFailure {
  if (!shouldUseMockFallback()) {
    return {
      success: false,
      persisted: false,
      reason: "database_not_configured",
      message: "Database access is required in this environment. Configure DATABASE_URL and try again.",
    };
  }

  return {
    success: false,
    persisted: false,
    reason: "database_not_configured",
    message: "No database is configured, so the change was kept locally for this session.",
  };
}

function createDatabaseErrorResult(message: string): ActionFailure {
  return {
    success: false,
    persisted: false,
    reason: "database_error",
    message,
  };
}

function createInvalidInputResult(message: string): ActionFailure {
  return {
    success: false,
    persisted: false,
    reason: "invalid_input",
    message,
  };
}

function createNotFoundResult(message: string): ActionFailure {
  return {
    success: false,
    persisted: false,
    reason: "not_found",
    message,
  };
}

function createForbiddenResult(message: string): ActionFailure {
  return {
    success: false,
    persisted: false,
    reason: "forbidden",
    message,
  };
}

function revalidateTaskPaths(projectSlug: string) {
  revalidatePath("/dashboard");
  revalidatePath("/projects");
  revalidatePath(`/projects/${projectSlug}`);
}

const taskInclude = {
  assignments: {
    include: {
      user: true,
    },
  },
  checklist: {
    orderBy: {
      createdAt: "asc",
    },
  },
  comments: {
    include: {
      author: true,
    },
    orderBy: {
      createdAt: "asc",
    },
  },
} as const;

function validateTaskMutationInput(input: TaskMutationInput) {
  if (!input.title.trim()) {
    return "Task title is required.";
  }

  if (!input.dueDate) {
    return "Task due date is required.";
  }

  if (!input.assigneeIds.length) {
    return "Assign at least one user to the task.";
  }

  if (!TASK_STATUS_ORDER.includes(input.status)) {
    return "Select a valid task status.";
  }

  return null;
}

function validateAssigneeIdsForProject(
  assigneeIds: string[],
  project: {
    leaderId: string;
    members: Array<{
      userId: string;
    }>;
  },
) {
  const availableUserIds = new Set([project.leaderId, ...project.members.map((member) => member.userId)]);
  const normalizedAssigneeIds = [...new Set(assigneeIds)];

  if (normalizedAssigneeIds.length === 0) {
    return {
      valid: false,
      message: "Assign at least one user to the task.",
    };
  }

  const hasInvalidAssignee = normalizedAssigneeIds.some((userId) => !availableUserIds.has(userId));

  if (hasInvalidAssignee) {
    return {
      valid: false,
      message: "Choose assignees from the project team.",
    };
  }

  return {
    valid: true,
    message: "",
  };
}

function mapTaskRecord(task: DatabaseTaskPayload): Task {
  return {
    id: task.id,
    projectId: task.projectId,
    title: task.title,
    description: task.description,
    category: TASK_CATEGORY_FROM_DATABASE[task.category] ?? "event_preparation",
    status: task.status === "IN_PROGRESS" ? "in_progress" : task.status === "DONE" ? "done" : "todo",
    priority: TASK_PRIORITY_FROM_DATABASE[task.priority] ?? "medium",
    dueDate: task.dueDate.toISOString().slice(0, 10),
    assignees: task.assignments.map((assignment) => mapDatabaseUserToUser(assignment.user)),
    checklist: task.checklist.map((item) => ({
      id: item.id,
      taskId: item.taskId,
      label: item.label,
      completed: item.completed,
      completedAt: item.completedAt?.toISOString(),
    })),
    comments: task.comments.map(mapDatabaseCommentToComment),
    createdAt: task.createdAt.toISOString(),
    updatedAt: task.updatedAt.toISOString(),
  };
}

function createDateFromInput(value: string) {
  return new Date(`${value}T00:00:00.000Z`);
}
