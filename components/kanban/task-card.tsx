import { CalendarDays, CheckSquare, MessageSquare } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getChecklistProgress } from "@/features/tasks/task-service";
import { TASK_CATEGORIES } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import type { Task } from "@/types/task";

type TaskCardProps = {
  task: Task;
};

export function TaskCard({ task }: TaskCardProps) {
  const checklistProgress = getChecklistProgress(task.checklist);

  return (
    <article className="rounded-md border border-border-soft bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-start justify-between gap-3">
        <Badge>{TASK_CATEGORIES[task.category]}</Badge>
        <Badge variant={task.priority === "high" ? "amber" : "gray"}>{task.priority}</Badge>
      </div>
      <h3 className="text-sm font-semibold leading-6 text-slate-950">{task.title}</h3>
      <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">{task.description}</p>
      <div className="mt-4 grid gap-2 text-xs text-slate-500">
        <span className="flex items-center gap-2">
          <CalendarDays aria-hidden="true" className="h-4 w-4" />
          {formatDate(task.dueDate)}
        </span>
        <span className="flex items-center gap-2">
          <CheckSquare aria-hidden="true" className="h-4 w-4" />
          Checklist {checklistProgress}%
        </span>
        <span className="flex items-center gap-2">
          <MessageSquare aria-hidden="true" className="h-4 w-4" />
          {task.comments.length} comments
        </span>
      </div>
    </article>
  );
}

