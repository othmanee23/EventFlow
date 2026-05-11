"use client";

import { useDroppable } from "@dnd-kit/core";
import { DraggableTaskCard } from "@/components/kanban/draggable-task-card";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils";
import type { Task, TaskStatus } from "@/types/task";

type KanbanColumnProps = {
  onTaskOpen: (task: Task) => void;
  status: TaskStatus;
  statusLabel: string;
  tasks: Task[];
};

export function KanbanColumn({ onTaskOpen, status, statusLabel, tasks }: KanbanColumnProps) {
  const { isOver, setNodeRef } = useDroppable({
    id: status,
  });

  return (
    <div
      className={cn(
        "min-h-96 rounded-md border border-border-soft bg-muted-surface p-4 transition-colors",
        isOver && "border-brand-blue bg-brand-sky",
      )}
      ref={setNodeRef}
    >
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-600">{statusLabel}</h2>
        <span className="rounded-md bg-white px-2 py-1 text-xs font-semibold text-slate-600">{tasks.length}</span>
      </div>
      <div className="grid gap-3">
        {tasks.length > 0 ? (
          tasks.map((task) => <DraggableTaskCard key={task.id} onOpen={onTaskOpen} task={task} />)
        ) : (
          <EmptyState title="No tasks" description="Tasks moved into this status will appear here." />
        )}
      </div>
    </div>
  );
}
