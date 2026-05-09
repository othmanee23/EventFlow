"use client";

import { useDraggable } from "@dnd-kit/core";
import { TaskCard } from "@/components/kanban/task-card";
import { cn } from "@/lib/utils";
import type { Task } from "@/types/task";

type DraggableTaskCardProps = {
  onOpen: (task: Task) => void;
  task: Task;
};

export function DraggableTaskCard({ onOpen, task }: DraggableTaskCardProps) {
  const { attributes, isDragging, listeners, setNodeRef, transform } = useDraggable({
    id: task.id,
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  return (
    <div
      className={cn(
        "touch-none rounded-md outline-none transition-opacity focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2",
        isDragging ? "cursor-grabbing opacity-30" : "cursor-grab",
      )}
      onClick={() => onOpen(task)}
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
    >
      <TaskCard task={task} />
    </div>
  );
}
