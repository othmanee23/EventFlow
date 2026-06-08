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
import { TaskEditorModal } from "@/components/kanban/task-editor-modal";
import { TaskCard } from "@/components/kanban/task-card";
import { TaskDetailModal } from "@/components/kanban/task-detail-modal";
import { Button } from "@/components/ui/button";
import {
  addChecklistItemAction,
  addTaskCommentAction,
  createTaskAction,
  deleteTaskAction,
  toggleChecklistItemAction,
  updateTaskAction,
  updateTaskStatusAction,
} from "@/features/tasks/task-actions";
import { TASK_STATUS_ORDER, TASK_STATUSES } from "@/lib/constants";
import { getTasksByStatus } from "@/features/tasks/task-service";
import { canAssignTasks } from "@/lib/permissions";
import type { Comment } from "@/types/comment";
import type { Task, TaskCategory, TaskPriority, TaskStatus } from "@/types/task";
import type { User } from "@/types/user";

type KanbanBoardProps = {
  projectId: string;
  projectUsers: User[];
  tasks: Task[];
  user: User;
};

type TaskEditorInput = {
  assigneeIds: string[];
  category: TaskCategory;
  description: string;
  dueDate: string;
  priority: TaskPriority;
  status: TaskStatus;
  title: string;
};

export function KanbanBoard({ projectId, projectUsers, tasks, user }: KanbanBoardProps) {
  const [boardTasks, setBoardTasks] = useState(tasks);
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [taskEditorMode, setTaskEditorMode] = useState<"create" | "edit" | null>(null);
  const [boardError, setBoardError] = useState("");
  const canManageTasks = canAssignTasks(user.role);
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
  const editingTask = useMemo(
    () => (taskEditorMode === "edit" ? boardTasks.find((task) => task.id === selectedTaskId) : undefined),
    [boardTasks, selectedTaskId, taskEditorMode],
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
    const result = await addTaskCommentAction(taskId, body);

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

  async function handleChecklistAdd(taskId: string, label: string) {
    const createdAt = new Date().toISOString();
    const trimmedLabel = label.trim();
    const result = await addChecklistItemAction(taskId, trimmedLabel);

    if (!result.success && !shouldUseLocalFallback(result.reason)) {
      setBoardError(result.message);
      return false;
    }

    const item = result.success
      ? result.item
      : {
          id: `checklist-${taskId}-${createdAt}`,
          taskId,
          label: trimmedLabel,
          completed: false,
        };

    setBoardTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.id === taskId
          ? {
              ...task,
              checklist: [...task.checklist, item],
              updatedAt: result.success ? result.updatedAt : createdAt,
            }
          : task,
      ),
    );
    setBoardError("");
    return true;
  }

  async function handleTaskCreate(input: TaskEditorInput) {
    const result = await createTaskAction(projectId, input);

    if (!result.success) {
      setBoardError(result.message);
      return false;
    }

    setBoardTasks((currentTasks) => [...currentTasks, result.task]);
    setBoardError("");
    return true;
  }

  async function handleTaskUpdate(input: TaskEditorInput) {
    if (!selectedTaskId) {
      return false;
    }

    const result = await updateTaskAction(selectedTaskId, input);

    if (!result.success) {
      setBoardError(result.message);
      return false;
    }

    setBoardTasks((currentTasks) => currentTasks.map((task) => (task.id === result.task.id ? result.task : task)));
    setBoardError("");
    return true;
  }

  async function handleTaskDelete() {
    if (!selectedTaskId) {
      return;
    }

    const result = await deleteTaskAction(selectedTaskId);

    if (!result.success) {
      setBoardError(result.message);
      throw new Error(result.message);
    }

    setBoardTasks((currentTasks) => currentTasks.filter((task) => task.id !== selectedTaskId));
    setSelectedTaskId(null);
    setBoardError("");
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
      {canManageTasks ? (
        <div className="flex justify-end">
          <Button onClick={() => setTaskEditorMode("create")} type="button">
            Add task
          </Button>
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
        canManageTasks={canManageTasks}
        onEditRequested={() => setTaskEditorMode("edit")}
        onChecklistAdd={handleChecklistAdd}
        onCommentAdd={handleCommentAdd}
        onChecklistToggle={handleChecklistToggle}
        onClose={() => setSelectedTaskId(null)}
        open={Boolean(selectedTask) && taskEditorMode !== "edit"}
        task={selectedTask}
      />
      <TaskEditorModal
        key={taskEditorMode === "edit" ? selectedTaskId ?? "edit-task" : "create-task"}
        mode={taskEditorMode === "edit" ? "edit" : "create"}
        onClose={() => setTaskEditorMode(null)}
        onDelete={taskEditorMode === "edit" ? handleTaskDelete : undefined}
        onSubmit={taskEditorMode === "edit" ? handleTaskUpdate : handleTaskCreate}
        open={Boolean(taskEditorMode)}
        projectUsers={projectUsers}
        task={editingTask}
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
