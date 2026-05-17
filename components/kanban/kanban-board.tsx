"use client";

import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  pointerWithin,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { useMemo, useState } from "react";
import { KanbanColumn } from "@/components/kanban/kanban-column";
import { TaskCard } from "@/components/kanban/task-card";
import { TaskDetailModal } from "@/components/kanban/task-detail-modal";
import { addTaskCommentAction, toggleChecklistItemAction, updateTaskStatusAction } from "@/features/tasks/task-actions";
import { TASK_STATUS_ORDER, TASK_STATUSES } from "@/lib/constants";
import { getTasksByStatus } from "@/features/tasks/task-service";
import type { Comment } from "@/types/comment";
import type { Task, TaskStatus } from "@/types/task";
import type { User } from "@/types/user";

type KanbanBoardProps = {
  tasks: Task[];
  user: User;
};

export function KanbanBoard({ tasks, user }: KanbanBoardProps) {
  const [boardTasks, setBoardTasks] = useState(tasks);
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [boardError, setBoardError] = useState("");
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 6,
      },
    }),
  );

  const activeTask = useMemo(
    () => boardTasks.find((task) => task.id === activeTaskId),
    [activeTaskId, boardTasks],
  );
  const selectedTask = useMemo(
    () => boardTasks.find((task) => task.id === selectedTaskId),
    [boardTasks, selectedTaskId],
  );

  function handleDragStart(event: DragStartEvent) {
    setActiveTaskId(String(event.active.id));
  }

  function handleDragEnd(event: DragEndEvent) {
    const activeId = String(event.active.id);
    const nextStatus = event.over?.id;

    setActiveTaskId(null);

    if (!isTaskStatus(nextStatus)) {
      return;
    }

    const currentTask = boardTasks.find((task) => task.id === activeId);

    if (!currentTask || currentTask.status === nextStatus) {
      return;
    }

    setBoardTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.id === activeId
          ? {
              ...task,
              status: nextStatus,
              updatedAt: new Date().toISOString(),
            }
          : task,
      ),
    );
    void persistTaskStatus(activeId, nextStatus);
  }

  function handleDragCancel() {
    setActiveTaskId(null);
  }

  function handleChecklistToggle(taskId: string, itemId: string, completed: boolean) {
    const completedAt = completed ? new Date().toISOString() : undefined;

    setBoardTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.id === taskId
          ? {
              ...task,
              checklist: task.checklist.map((item) =>
                item.id === itemId
                  ? {
                      ...item,
                      completed,
                      completedAt,
                    }
                  : item,
              ),
              updatedAt: new Date().toISOString(),
            }
          : task,
      ),
    );
    void persistChecklistToggle(taskId, itemId, completed);
  }

  async function handleCommentAdd(taskId: string, body: string) {
    const createdAt = new Date().toISOString();
    const result = await addTaskCommentAction(taskId, user.id, body);

    if (!result.success && !shouldUseLocalFallback(result.reason)) {
      setBoardError(result.message);
      return false;
    }

    const comment: Comment = result.success
      ? result.comment
      : {
          id: `comment-${taskId}-${createdAt}`,
          taskId,
          author: user,
          body,
          createdAt,
        };

    setBoardTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.id === taskId
          ? {
              ...task,
              comments: [...task.comments, comment],
              updatedAt: result.success ? result.updatedAt : createdAt,
            }
          : task,
      ),
    );
    setBoardError("");
    return true;
  }

  async function persistTaskStatus(taskId: string, status: TaskStatus) {
    const result = await updateTaskStatusAction(taskId, status);

    if (!result.success && !shouldUseLocalFallback(result.reason)) {
      setBoardError(result.message);
      return;
    }

    if (result.success) {
      setBoardTasks((currentTasks) =>
        currentTasks.map((task) => (task.id === taskId ? { ...task, updatedAt: result.updatedAt } : task)),
      );
    }

    setBoardError("");
  }

  async function persistChecklistToggle(taskId: string, itemId: string, completed: boolean) {
    const result = await toggleChecklistItemAction(itemId, completed);

    if (!result.success && !shouldUseLocalFallback(result.reason)) {
      setBoardError(result.message);
      return;
    }

    if (result.success) {
      setBoardTasks((currentTasks) =>
        currentTasks.map((task) =>
          task.id === taskId
            ? {
                ...task,
                checklist: task.checklist.map((item) =>
                  item.id === itemId
                    ? {
                        ...item,
                        completed,
                        completedAt: result.completedAt,
                      }
                    : item,
                ),
                updatedAt: result.updatedAt,
              }
            : task,
        ),
      );
    }

    setBoardError("");
  }

  return (
    <DndContext
      collisionDetection={pointerWithin}
      onDragCancel={handleDragCancel}
      onDragEnd={handleDragEnd}
      onDragStart={handleDragStart}
      sensors={sensors}
    >
      {boardError ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
          {boardError}
        </div>
      ) : null}
      <section className="grid gap-4 xl:grid-cols-3">
        {TASK_STATUS_ORDER.map((status) => (
          <KanbanColumn
            key={status}
            onTaskOpen={(task) => setSelectedTaskId(task.id)}
            status={status}
            statusLabel={TASK_STATUSES[status]}
            tasks={getTasksByStatus(boardTasks, status)}
          />
        ))}
      </section>
      <DragOverlay>{activeTask ? <TaskCard task={activeTask} /> : null}</DragOverlay>
      <TaskDetailModal
        onCommentAdd={handleCommentAdd}
        onChecklistToggle={handleChecklistToggle}
        onClose={() => setSelectedTaskId(null)}
        open={Boolean(selectedTask)}
        task={selectedTask}
      />
    </DndContext>
  );
}

function isTaskStatus(value: unknown): value is TaskStatus {
  return typeof value === "string" && TASK_STATUS_ORDER.includes(value as TaskStatus);
}

function shouldUseLocalFallback(reason: string) {
  return reason === "database_not_configured" || reason === "not_found";
}
