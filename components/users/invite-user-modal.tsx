"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { createUserAction } from "@/features/users/user-actions";
import {
  hasCreateUserErrors,
  validateCreateUserInput,
  type CreateUserErrors,
  type CreateUserInput,
} from "@/features/users/user-utils";
import { ROLES } from "@/lib/constants";
import type { UserRole } from "@/types/user";

type InviteUserModalProps = {
  onClose: () => void;
  open: boolean;
};

const DEFAULT_ROLE: UserRole = "member";

export function InviteUserModal({ onClose, open }: InviteUserModalProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [department, setDepartment] = useState("Events");
  const [role, setRole] = useState<UserRole>(DEFAULT_ROLE);
  const [temporaryPassword, setTemporaryPassword] = useState("");
  const [errors, setErrors] = useState<CreateUserErrors>({});
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const input: CreateUserInput = {
      name,
      email,
      department,
      role,
      temporaryPassword,
    };
    const nextErrors = validateCreateUserInput(input);

    setErrors(nextErrors);
    setFormError("");

    if (hasCreateUserErrors(nextErrors)) {
      return;
    }

    setSubmitting(true);

    try {
      const result = await createUserAction(input);

      if (result.success) {
        resetForm();
        onClose();
        router.refresh();
        return;
      }

      setErrors(result.errors ?? {});
      setFormError(result.message);
    } catch {
      setFormError("User invitation failed. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  function resetForm() {
    setName("");
    setEmail("");
    setDepartment("Events");
    setRole(DEFAULT_ROLE);
    setTemporaryPassword("");
    setErrors({});
    setFormError("");
  }

  return (
    <Modal className="max-w-xl" onClose={onClose} open={open} title="Invite user">
      <form className="grid gap-5" onSubmit={handleSubmit}>
        {formError ? (
          <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
            {formError}
          </div>
        ) : null}
        <Input
          error={errors.name}
          label="Full name"
          name="invite-user-name"
          onChange={(event) => {
            setName(event.target.value);
            setErrors((currentErrors) => ({ ...currentErrors, name: undefined }));
          }}
          placeholder="First and last name"
          value={name}
        />
        <Input
          error={errors.email}
          label="Email"
          name="invite-user-email"
          onChange={(event) => {
            setEmail(event.target.value);
            setErrors((currentErrors) => ({ ...currentErrors, email: undefined }));
          }}
          placeholder="name@pcns.org"
          type="email"
          value={email}
        />
        <Input
          error={errors.department}
          label="Department"
          name="invite-user-department"
          onChange={(event) => {
            setDepartment(event.target.value);
            setErrors((currentErrors) => ({ ...currentErrors, department: undefined }));
          }}
          placeholder="Events"
          value={department}
        />
        <label className="grid gap-2 text-sm font-medium text-slate-700" htmlFor="invite-user-role">
          Role
          <select
            className="h-11 rounded-md border border-border-soft bg-white px-3 text-sm text-slate-950 outline-none transition-colors focus:border-brand-blue focus:ring-4 focus:ring-blue-100"
            id="invite-user-role"
            onChange={(event) => {
              setRole(event.target.value as UserRole);
              setErrors((currentErrors) => ({ ...currentErrors, role: undefined }));
            }}
            value={role}
          >
            {Object.entries(ROLES).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          {errors.role ? <span className="text-xs font-medium text-red-600">{errors.role}</span> : null}
        </label>
        <Input
          error={errors.temporaryPassword}
          label="Temporary password"
          name="invite-user-password"
          onChange={(event) => {
            setTemporaryPassword(event.target.value);
            setErrors((currentErrors) => ({ ...currentErrors, temporaryPassword: undefined }));
          }}
          placeholder="Minimum 8 characters"
          type="password"
          value={temporaryPassword}
        />
        <div className="flex justify-end gap-3">
          <Button onClick={onClose} type="button" variant="secondary">
            Cancel
          </Button>
          <Button disabled={submitting} type="submit">
            {submitting ? "Inviting..." : "Invite user"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
