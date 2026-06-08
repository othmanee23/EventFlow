"use client";

import { FormEvent, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { TASK_CATEGORIES, TASK_STATUSES } from "@/lib/constants";
import type { Task, TaskCategory, TaskPriority, TaskStatus } from "@/types/task";
import type { User } from "@/types/user";

type TaskEditorInput = {
  assigneeIds: string[];
  category: TaskCategory;
  description: string;
  dueDate: string;
  priority: TaskPriority;
  status: TaskStatus;
  title: string;
};

type TaskEditorModalProps = {
  mode: "create" | "edit";
  onClose: () => void;
  onDelete?: () => Promise<void>;
  onSubmit: (input: TaskEditorInput) => Promise<boolean>;
  open: boolean;
  projectUsers: User[];
  task?: Task;
};

export function TaskEditorModal({ mode, onClose, onDelete, onSubmit, open, projectUsers, task }: TaskEditorModalProps) {
  const initialAssigneeIds = useMemo(() => task?.assignees.map((assignee) => assignee.id) ?? [], [task]);
  const [title, setTitle] = useState(task?.title ?? "");
  const [description, setDescription] = useState(task?.description ?? "");
  const [dueDate, setDueDate] = useState(task?.dueDate ?? "");
  const [category, setCategory] = useState<TaskCategory>(task?.category ?? "event_preparation");
  const [status, setStatus] = useState<TaskStatus>(task?.status ?? "todo");
  const [priority, setPriority] = useState<TaskPriority>(task?.priority ?? "medium");
  const [assigneeIds, setAssigneeIds] = useState<string[]>(initialAssigneeIds);
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setFormError("");

    try {
      const saved = await onSubmit({
        title,
        description,
        dueDate,
        category,
        status,
        priority,
        assigneeIds,
      });

      if (saved) {
        onClose();
      } else {
        setFormError("Task could not be saved.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!onDelete) {
      return;
    }

    setDeleting(true);
    setFormError("");

    try {
      await onDelete();
      onClose();
    } catch {
      setFormError("Task could not be deleted.");
    } finally {
      setDeleting(false);
    }
  }

  function toggleAssignee(userId: string, selected: boolean) {
    setAssigneeIds((currentAssigneeIds) =>
      selected ? [...new Set([...currentAssigneeIds, userId])] : currentAssigneeIds.filter((id) => id !== userId),
    );
  }

  return (
    <Modal className="max-w-2xl" onClose={onClose} open={open} title={mode === "create" ? "Add task" : "Edit task"}>
      <form className="grid gap-5" onSubmit={handleSubmit}>
        {formError ? (
          <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
            {formError}
          </div>
        ) : null}
        <Input label="Task title" name="task-title" onChange={(event) => setTitle(event.target.value)} value={title} />
        <label className="grid gap-2 text-sm font-medium text-slate-700" htmlFor="task-description">
          Description
          <textarea
            className="min-h-24 resize-y rounded-md border border-border-soft bg-white px-3 py-2 text-sm text-slate-950 outline-none transition-colors placeholder:text-slate-400 focus:border-brand-blue focus:ring-4 focus:ring-blue-100"
            id="task-description"
            onChange={(event) => setDescription(event.target.value)}
            value={description}
          />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Due date" name="task-due-date" onChange={(event) => setDueDate(event.target.value)} type="date" value={dueDate} />
          <label className="grid gap-2 text-sm font-medium text-slate-700" htmlFor="task-priority">
            Priority
            <select
              className="h-11 rounded-md border border-border-soft bg-white px-3 text-sm text-slate-950 outline-none transition-colors focus:border-brand-blue focus:ring-4 focus:ring-blue-100"
              id="task-priority"
              onChange={(event) => setPriority(event.target.value as TaskPriority)}
              value={priority}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </label>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-2 text-sm font-medium text-slate-700" htmlFor="task-category">
            Category
            <select
              className="h-11 rounded-md border border-border-soft bg-white px-3 text-sm text-slate-950 outline-none transition-colors focus:border-brand-blue focus:ring-4 focus:ring-blue-100"
              id="task-category"
              onChange={(event) => setCategory(event.target.value as TaskCategory)}
              value={category}
            >
              {Object.entries(TASK_CATEGORIES).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-2 text-sm font-medium text-slate-700" htmlFor="task-status">
            Status
            <select
              className="h-11 rounded-md border border-border-soft bg-white px-3 text-sm text-slate-950 outline-none transition-colors focus:border-brand-blue focus:ring-4 focus:ring-blue-100"
              id="task-status"
              onChange={(event) => setStatus(event.target.value as TaskStatus)}
              value={status}
            >
              {Object.entries(TASK_STATUSES).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
        </div>
        <section className="grid gap-3">
          <p className="text-sm font-medium text-slate-700">Assign team members</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {projectUsers.map((user) => (
              <label
                className="flex items-center gap-3 rounded-md border border-border-soft px-3 py-2 text-sm text-slate-700"
                key={user.id}
              >
                <input
                  checked={assigneeIds.includes(user.id)}
                  className="h-4 w-4 rounded border-border-soft text-brand-blue"
                  onChange={(event) => toggleAssignee(user.id, event.target.checked)}
                  type="checkbox"
                />
                <span>{user.name}</span>
              </label>
            ))}
          </div>
        </section>
        <div className="flex items-center justify-between gap-3">
          <div>{mode === "edit" && onDelete ? <Button disabled={deleting} onClick={handleDelete} type="button" variant="ghost">{deleting ? "Deleting..." : "Delete task"}</Button> : null}</div>
          <div className="flex gap-3">
            <Button onClick={onClose} type="button" variant="secondary">
              Cancel
            </Button>
            <Button disabled={submitting} type="submit">
              {submitting ? "Saving..." : mode === "create" ? "Create task" : "Save task"}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
