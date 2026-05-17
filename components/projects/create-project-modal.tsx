"use client";

import { FormEvent, useMemo, useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createProjectAction } from "@/features/projects/project-actions";
import {
  createProjectFromInput,
  hasCreateProjectErrors,
  validateCreateProjectInput,
  type CreateProjectErrors,
  type CreateProjectInput,
} from "@/features/projects/project-utils";
import type { Project } from "@/types/project";
import type { User } from "@/types/user";

type CreateProjectModalProps = {
  onClose: () => void;
  onCreate: (project: Project, options?: { disableNavigation?: boolean }) => void;
  open: boolean;
  users: User[];
};

export function CreateProjectModal({ onClose, onCreate, open, users }: CreateProjectModalProps) {
  const leaders = useMemo(() => users.filter((user) => user.role === "admin" || user.role === "leader"), [users]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [leaderId, setLeaderId] = useState(leaders[0]?.id ?? "");
  const [memberIds, setMemberIds] = useState<string[]>([]);
  const [errors, setErrors] = useState<CreateProjectErrors>({});
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const input: CreateProjectInput = {
      name,
      description,
      eventDate,
      leaderId,
      memberIds,
    };
    const nextErrors = validateCreateProjectInput(input);

    setErrors(nextErrors);
    setFormError("");

    if (hasCreateProjectErrors(nextErrors)) {
      return;
    }

    setSubmitting(true);

    try {
      const result = await createProjectAction(input);

      if (result.success) {
        onCreate(result.project, { disableNavigation: false });
        resetForm();
        onClose();
        return;
      }

      if (result.reason === "database_not_configured") {
        const project = createProjectFromInput(input, users);

        onCreate(project, { disableNavigation: true });
        resetForm();
        onClose();
        return;
      }

      setErrors(result.errors ?? {});
      setFormError(result.message);
    } catch {
      setFormError("Project creation failed. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  function resetForm() {
    setName("");
    setDescription("");
    setEventDate("");
    setLeaderId(leaders[0]?.id ?? "");
    setMemberIds([]);
    setErrors({});
    setFormError("");
  }

  function toggleMember(userId: string, selected: boolean) {
    setMemberIds((currentMemberIds) =>
      selected ? [...currentMemberIds, userId] : currentMemberIds.filter((memberId) => memberId !== userId),
    );
  }

  return (
    <Modal className="max-w-2xl" onClose={onClose} open={open} title="Create project">
      <form className="grid gap-5" onSubmit={handleSubmit}>
        {formError ? (
          <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
            {formError}
          </div>
        ) : null}
        <Input
          error={errors.name}
          label="Project name"
          name="project-name"
          onChange={(event) => {
            setName(event.target.value);
            setErrors((currentErrors) => ({ ...currentErrors, name: undefined }));
          }}
          placeholder="Event project name"
          value={name}
        />
        <label className="grid gap-2 text-sm font-medium text-slate-700" htmlFor="project-description">
          Description
          <textarea
            className="min-h-24 resize-y rounded-md border border-border-soft bg-white px-3 py-2 text-sm text-slate-950 outline-none transition-colors placeholder:text-slate-400 focus:border-brand-blue focus:ring-4 focus:ring-blue-100"
            id="project-description"
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Short event coordination context"
            value={description}
          />
        </label>
        <Input
          error={errors.eventDate}
          label="Event date"
          name="event-date"
          onChange={(event) => {
            setEventDate(event.target.value);
            setErrors((currentErrors) => ({ ...currentErrors, eventDate: undefined }));
          }}
          type="date"
          value={eventDate}
        />
        <label className="grid gap-2 text-sm font-medium text-slate-700" htmlFor="project-leader">
          Leader
          <select
            className="h-11 rounded-md border border-border-soft bg-white px-3 text-sm text-slate-950 outline-none transition-colors focus:border-brand-blue focus:ring-4 focus:ring-blue-100"
            id="project-leader"
            onChange={(event) => {
              setLeaderId(event.target.value);
              setMemberIds((currentMemberIds) => currentMemberIds.filter((memberId) => memberId !== event.target.value));
              setErrors((currentErrors) => ({ ...currentErrors, leaderId: undefined }));
            }}
            value={leaderId}
          >
            {leaders.map((leader) => (
              <option key={leader.id} value={leader.id}>
                {leader.name}
              </option>
            ))}
          </select>
          {errors.leaderId ? <span className="text-xs font-medium text-red-600">{errors.leaderId}</span> : null}
        </label>
        <section className="grid gap-3">
          <p className="text-sm font-medium text-slate-700">Members</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {users
              .filter((user) => user.id !== leaderId)
              .map((user) => (
                <label
                  className="flex items-center gap-3 rounded-md border border-border-soft px-3 py-2 text-sm text-slate-700"
                  key={user.id}
                >
                  <input
                    checked={memberIds.includes(user.id)}
                    className="h-4 w-4 rounded border-border-soft text-brand-blue"
                    onChange={(event) => toggleMember(user.id, event.target.checked)}
                    type="checkbox"
                  />
                  <span>{user.name}</span>
                </label>
              ))}
          </div>
        </section>
        <div className="flex justify-end gap-3">
          <Button onClick={onClose} type="button" variant="secondary">
            Cancel
          </Button>
          <Button disabled={submitting} type="submit">
            {submitting ? "Creating..." : "Create project"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
