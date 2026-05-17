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
import { TASK_STATUS_ORDER, TASK_STATUSES } from "@/lib/constants";
import { getTasksByStatus } from "@/features/tasks/task-service";
import type { Task, TaskStatus } from "@/types/task";

type KanbanBoardProps = {
  tasks: Task[];
};

export function KanbanBoard({ tasks }: KanbanBoardProps) {
  const [boardTasks, setBoardTasks] = useState(tasks);
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
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

    setBoardTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.id === activeId && task.status !== nextStatus
          ? {
              ...task,
              status: nextStatus,
              updatedAt: new Date().toISOString(),
            }
          : task,
      ),
    );
  }

  function handleDragCancel() {
    setActiveTaskId(null);
  }

  function handleChecklistToggle(taskId: string, itemId: string, completed: boolean) {
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
                      completedAt: completed ? new Date().toISOString() : undefined,
                    }
                  : item,
              ),
              updatedAt: new Date().toISOString(),
            }
          : task,
      ),
    );
  }

  return (
    <DndContext
      collisionDetection={pointerWithin}
      onDragCancel={handleDragCancel}
      onDragEnd={handleDragEnd}
      onDragStart={handleDragStart}
      sensors={sensors}
    >
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
