"use client";

import { FormEvent, useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Badge } from "@/components/ui/badge";
import { ChecklistSection } from "@/components/checklists/checklist-section";
import { CommentsSection } from "@/components/comments/comments-section";
import { Button } from "@/components/ui/button";
import { getChecklistProgress } from "@/features/tasks/task-service";
import { TASK_CATEGORIES, TASK_STATUSES } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import type { Task } from "@/types/task";

type TaskDetailModalProps = {
  canManageTasks: boolean;
  onEditRequested: () => void;
  onChecklistAdd: (taskId: string, label: string) => Promise<boolean>;
  onChecklistToggle: (taskId: string, itemId: string, completed: boolean) => void;
  onCommentAdd: (taskId: string, body: string) => Promise<boolean>;
  onClose: () => void;
  open: boolean;
  task?: Task;
};

export function TaskDetailModal({
  canManageTasks,
  onEditRequested,
  onChecklistAdd,
  onChecklistToggle,
  onClose,
  onCommentAdd,
  open,
  task,
}: TaskDetailModalProps) {
  if (!task) {
    return null;
  }

  return (
    <TaskDetailModalContent
      onChecklistAdd={onChecklistAdd}
      canManageTasks={canManageTasks}
      key={task.id}
      onEditRequested={onEditRequested}
      onChecklistToggle={onChecklistToggle}
      onClose={onClose}
      onCommentAdd={onCommentAdd}
      open={open}
      task={task}
    />
  );
}

type TaskDetailModalContentProps = {
  canManageTasks: boolean;
  onEditRequested: () => void;
  onChecklistAdd: (taskId: string, label: string) => Promise<boolean>;
  onChecklistToggle: (taskId: string, itemId: string, completed: boolean) => void;
  onClose: () => void;
  onCommentAdd: (taskId: string, body: string) => Promise<boolean>;
  open: boolean;
  task: Task;
};

function TaskDetailModalContent({
  canManageTasks,
  onEditRequested,
  onChecklistAdd,
  onChecklistToggle,
  onClose,
  onCommentAdd,
  open,
  task,
}: TaskDetailModalContentProps) {
  const [checklistLabel, setChecklistLabel] = useState("");
  const [checklistError, setChecklistError] = useState("");
  const [checklistSubmitting, setChecklistSubmitting] = useState(false);
  const [commentBody, setCommentBody] = useState("");
  const [commentError, setCommentError] = useState("");
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const checklistProgress = getChecklistProgress(task.checklist);

  async function handleChecklistSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedLabel = checklistLabel.trim();

    if (!trimmedLabel) {
      setChecklistError("Checklist item cannot be empty.");
      return;
    }

    setChecklistSubmitting(true);

    try {
      const added = await onChecklistAdd(task.id, trimmedLabel);

      if (added) {
        setChecklistLabel("");
        setChecklistError("");
      } else {
        setChecklistError("Checklist item could not be saved.");
      }
    } finally {
      setChecklistSubmitting(false);
    }
  }

  async function handleCommentSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedBody = commentBody.trim();

    if (!trimmedBody) {
      setCommentError("Comment cannot be empty.");
      return;
    }

    setCommentSubmitting(true);

    try {
      const added = await onCommentAdd(task.id, trimmedBody);

      if (added) {
        setCommentBody("");
        setCommentError("");
      } else {
        setCommentError("Comment could not be saved.");
      }
    } finally {
      setCommentSubmitting(false);
    }
  }

  return (
    <Modal className="max-w-2xl" onClose={onClose} open={open} title={task.title}>
      <div className="grid gap-6">
        <div>
          <div className="mb-3 flex items-start justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              <Badge>{TASK_CATEGORIES[task.category]}</Badge>
              <Badge variant={task.priority === "high" ? "amber" : "gray"}>{task.priority}</Badge>
              <Badge variant={task.status === "done" ? "green" : "blue"}>{TASK_STATUSES[task.status]}</Badge>
            </div>
            {canManageTasks ? (
              <Button onClick={onEditRequested} type="button" variant="secondary">
                Edit task
              </Button>
            ) : null}
          </div>
          <p className="text-sm leading-6 text-slate-600">{task.description}</p>
        </div>

        <dl className="grid gap-4 rounded-md border border-border-soft bg-slate-50 p-4 text-sm sm:grid-cols-2">
          <div>
            <dt className="font-medium text-slate-950">Assignees</dt>
            <dd className="mt-1 text-slate-600">{task.assignees.map((assignee) => assignee.name).join(", ")}</dd>
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
            <form className="mt-4 grid gap-3" onSubmit={handleChecklistSubmit}>
              <label className="grid gap-2 text-sm font-medium text-slate-700" htmlFor="task-checklist-item">
                Add checklist item
                <input
                  className="h-11 rounded-md border border-border-soft bg-white px-3 text-sm text-slate-950 outline-none transition-colors placeholder:text-slate-400 focus:border-brand-blue focus:ring-4 focus:ring-blue-100"
                  id="task-checklist-item"
                  onChange={(event) => {
                    setChecklistLabel(event.target.value);
                    setChecklistError("");
                  }}
                  placeholder="Enter checklist item"
                  value={checklistLabel}
                />
              </label>
              {checklistError ? <p className="text-xs font-medium text-red-600">{checklistError}</p> : null}
              <div className="flex justify-end">
                <Button disabled={checklistSubmitting} type="submit">
                  {checklistSubmitting ? "Adding..." : "Add item"}
                </Button>
              </div>
            </form>
          </section>
          <section className="rounded-md border border-border-soft p-4">
            <h3 className="text-sm font-semibold text-slate-950">Comments</h3>
            <div className="mt-3">
              <CommentsSection comments={task.comments} />
            </div>
            <form className="mt-4 grid gap-3" onSubmit={handleCommentSubmit}>
              <label className="grid gap-2 text-sm font-medium text-slate-700" htmlFor="task-comment">
                Add comment
                <textarea
                  className="min-h-24 resize-y rounded-md border border-border-soft bg-white px-3 py-2 text-sm text-slate-950 outline-none transition-colors placeholder:text-slate-400 focus:border-brand-blue focus:ring-4 focus:ring-blue-100"
                  id="task-comment"
                  onChange={(event) => {
                    setCommentBody(event.target.value);
                    setCommentError("");
                  }}
                  placeholder="Write an update for this task"
                  value={commentBody}
                />
              </label>
              {commentError ? <p className="text-xs font-medium text-red-600">{commentError}</p> : null}
              <div className="flex justify-end">
                <Button disabled={commentSubmitting} type="submit">
                  {commentSubmitting ? "Adding..." : "Add comment"}
                </Button>
              </div>
            </form>
          </section>
        </div>
      </div>
    </Modal>
  );
}
