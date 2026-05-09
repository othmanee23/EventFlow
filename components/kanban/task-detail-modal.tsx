import { Modal } from "@/components/ui/modal";
import { TASK_CATEGORIES, TASK_STATUSES } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import type { Task } from "@/types/task";

type TaskDetailModalProps = {
  open: boolean;
  task?: Task;
};

export function TaskDetailModal({ open, task }: TaskDetailModalProps) {
  if (!task) {
    return null;
  }

  return (
    <Modal open={open} title={task.title}>
      <dl className="grid gap-3 text-sm">
        <div>
          <dt className="font-medium text-slate-950">Category</dt>
          <dd className="text-slate-600">{TASK_CATEGORIES[task.category]}</dd>
        </div>
        <div>
          <dt className="font-medium text-slate-950">Status</dt>
          <dd className="text-slate-600">{TASK_STATUSES[task.status]}</dd>
        </div>
        <div>
          <dt className="font-medium text-slate-950">Due date</dt>
          <dd className="text-slate-600">{formatDate(task.dueDate)}</dd>
        </div>
      </dl>
    </Modal>
  );
}

