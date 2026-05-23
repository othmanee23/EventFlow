"use server";

import { revalidatePath } from "next/cache";
import { getRequiredSession } from "@/features/auth/auth-service";
import { mapDatabaseCommentToComment } from "@/features/projects/project-mappers";
import { canUpdateAssignedTask } from "@/lib/permissions";
import { getPrisma, shouldUseMockFallback } from "@/lib/prisma";
import { TaskStatus as DatabaseTaskStatus } from "@/prisma/generated/prisma/enums";
import type { Comment } from "@/types/comment";
import type { TaskStatus } from "@/types/task";

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

const TASK_STATUS_TO_DATABASE: Record<TaskStatus, DatabaseTaskStatus> = {
  todo: DatabaseTaskStatus.TODO,
  in_progress: DatabaseTaskStatus.IN_PROGRESS,
  done: DatabaseTaskStatus.DONE,
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
        assigneeId: true,
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

    if (!canUpdateAssignedTask(session.user, existingTask.assigneeId)) {
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
            assigneeId: true,
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

    if (!canUpdateAssignedTask(session.user, existingItem.task.assigneeId)) {
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
