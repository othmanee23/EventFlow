"use client";

import { FormEvent, useMemo, useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createProjectFromInput } from "@/features/projects/project-service";
import type { Project } from "@/types/project";
import type { User } from "@/types/user";

type CreateProjectModalProps = {
  onClose: () => void;
  onCreate: (project: Project) => void;
  open: boolean;
  users: User[];
};

type CreateProjectErrors = Partial<Record<"eventDate" | "leaderId" | "name", string>>;

export function CreateProjectModal({ onClose, onCreate, open, users }: CreateProjectModalProps) {
  const leaders = useMemo(() => users.filter((user) => user.role === "admin" || user.role === "leader"), [users]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [leaderId, setLeaderId] = useState(leaders[0]?.id ?? "");
  const [memberIds, setMemberIds] = useState<string[]>([]);
  const [errors, setErrors] = useState<CreateProjectErrors>({});

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors: CreateProjectErrors = {};

    if (!name.trim()) {
      nextErrors.name = "Project name is required.";
    }

    if (!eventDate) {
      nextErrors.eventDate = "Event date is required.";
    }

    if (!leaderId) {
      nextErrors.leaderId = "Leader is required.";
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    const project = createProjectFromInput(
      {
        name,
        description,
        eventDate,
        leaderId,
        memberIds,
      },
      users,
    );

    onCreate(project);
    setName("");
    setDescription("");
    setEventDate("");
    setLeaderId(leaders[0]?.id ?? "");
    setMemberIds([]);
    setErrors({});
    onClose();
  }

  function toggleMember(userId: string, selected: boolean) {
    setMemberIds((currentMemberIds) =>
      selected ? [...currentMemberIds, userId] : currentMemberIds.filter((memberId) => memberId !== userId),
    );
  }

  return (
    <Modal className="max-w-2xl" onClose={onClose} open={open} title="Create project">
      <form className="grid gap-5" onSubmit={handleSubmit}>
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
          <Button type="submit">Create project</Button>
        </div>
      </form>
    </Modal>
  );
}
