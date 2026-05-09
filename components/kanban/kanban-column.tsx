import { TaskCard } from "@/components/kanban/task-card";
import { EmptyState } from "@/components/ui/empty-state";
import type { Task } from "@/types/task";

type KanbanColumnProps = {
  statusLabel: string;
  tasks: Task[];
};

export function KanbanColumn({ statusLabel, tasks }: KanbanColumnProps) {
  return (
    <div className="min-h-96 rounded-md border border-border-soft bg-muted-surface p-4">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-600">{statusLabel}</h2>
        <span className="rounded-md bg-white px-2 py-1 text-xs font-semibold text-slate-600">{tasks.length}</span>
      </div>
      <div className="grid gap-3">
        {tasks.length > 0 ? (
          tasks.map((task) => <TaskCard key={task.id} task={task} />)
        ) : (
          <EmptyState title="No tasks" description="Tasks moved into this status will appear here." />
        )}
      </div>
    </div>
  );
}

