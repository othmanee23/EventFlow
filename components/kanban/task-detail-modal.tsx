import { Modal } from "@/components/ui/modal";
import { Badge } from "@/components/ui/badge";
import { ChecklistSection } from "@/components/checklists/checklist-section";
import { getChecklistProgress } from "@/features/tasks/task-service";
import { TASK_CATEGORIES, TASK_STATUSES } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import type { Task } from "@/types/task";

type TaskDetailModalProps = {
  onChecklistToggle: (taskId: string, itemId: string, completed: boolean) => void;
  onClose: () => void;
  open: boolean;
  task?: Task;
};

export function TaskDetailModal({ onChecklistToggle, onClose, open, task }: TaskDetailModalProps) {
  if (!task) {
    return null;
  }

  const checklistProgress = getChecklistProgress(task.checklist);

  return (
    <Modal className="max-w-2xl" onClose={onClose} open={open} title={task.title}>
      <div className="grid gap-6">
        <div>
          <div className="mb-3 flex flex-wrap gap-2">
            <Badge>{TASK_CATEGORIES[task.category]}</Badge>
            <Badge variant={task.priority === "high" ? "amber" : "gray"}>{task.priority}</Badge>
            <Badge variant={task.status === "done" ? "green" : "blue"}>{TASK_STATUSES[task.status]}</Badge>
          </div>
          <p className="text-sm leading-6 text-slate-600">{task.description}</p>
        </div>

        <dl className="grid gap-4 rounded-md border border-border-soft bg-slate-50 p-4 text-sm sm:grid-cols-2">
          <div>
            <dt className="font-medium text-slate-950">Assignee</dt>
            <dd className="mt-1 text-slate-600">{task.assignee.name}</dd>
          </div>
          <div>
            <dt className="font-medium text-slate-950">Due date</dt>
            <dd className="mt-1 text-slate-600">{formatDate(task.dueDate)}</dd>
          </div>
          <div>
            <dt className="font-medium text-slate-950">Category</dt>
            <dd className="mt-1 text-slate-600">{TASK_CATEGORIES[task.category]}</dd>
          </div>
          <div>
            <dt className="font-medium text-slate-950">Status</dt>
            <dd className="mt-1 text-slate-600">{TASK_STATUSES[task.status]}</dd>
          </div>
        </dl>

        <section className="rounded-md border border-border-soft p-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-950">Checklist progress</h3>
              <p className="mt-1 text-sm text-slate-500">
                {task.checklist.filter((item) => item.completed).length} of {task.checklist.length} items complete
              </p>
            </div>
            <span className="text-sm font-semibold text-brand-blue">{checklistProgress}%</span>
          </div>
          <div className="mt-4 h-2 rounded-full bg-slate-100">
            <div className="h-2 rounded-full bg-brand-blue" style={{ width: `${checklistProgress}%` }} />
          </div>
        </section>

        <div className="grid gap-4">
          <section className="rounded-md border border-border-soft p-4">
            <h3 className="text-sm font-semibold text-slate-950">Checklist</h3>
            <div className="mt-3">
              <ChecklistSection
                items={task.checklist}
                onToggle={(item, completed) => onChecklistToggle(task.id, item.id, completed)}
              />
            </div>
          </section>
          <section className="rounded-md border border-border-soft p-4">
            <h3 className="text-sm font-semibold text-slate-950">Comments</h3>
            <p className="mt-2 text-sm text-slate-500">{task.comments.length} comments attached to this task.</p>
          </section>
        </div>
      </div>
    </Modal>
  );
}
