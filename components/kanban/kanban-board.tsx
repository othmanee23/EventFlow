import { KanbanColumn } from "@/components/kanban/kanban-column";
import { TASK_STATUS_ORDER, TASK_STATUSES } from "@/lib/constants";
import { getTasksByStatus } from "@/features/tasks/task-service";
import type { Task } from "@/types/task";

type KanbanBoardProps = {
  tasks: Task[];
};

export function KanbanBoard({ tasks }: KanbanBoardProps) {
  return (
    <section className="grid gap-4 xl:grid-cols-3">
      {TASK_STATUS_ORDER.map((status) => (
        <KanbanColumn key={status} statusLabel={TASK_STATUSES[status]} tasks={getTasksByStatus(tasks, status)} />
      ))}
    </section>
  );
}

