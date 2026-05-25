"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { updateUserRoleAction } from "@/features/users/user-actions";
import {
  hasUpdateUserRoleErrors,
  validateUpdateUserRoleInput,
  type UpdateUserRoleErrors,
} from "@/features/users/user-utils";
import { ROLES } from "@/lib/constants";
import type { User, UserRole } from "@/types/user";

type ManageUserRoleModalProps = {
  onClose: () => void;
  open: boolean;
  user: User | null;
};

export function ManageUserRoleModal({ onClose, open, user }: ManageUserRoleModalProps) {
  const router = useRouter();
  const [role, setRole] = useState<UserRole>(user?.role ?? "member");
  const [errors, setErrors] = useState<UpdateUserRoleErrors>({});
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!user) {
    return null;
  }

  const targetUser = user;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const input = {
      userId: targetUser.id,
      role,
    };
    const nextErrors = validateUpdateUserRoleInput(input);

    setErrors(nextErrors);
    setFormError("");

    if (hasUpdateUserRoleErrors(nextErrors)) {
      return;
    }

    setSubmitting(true);

    try {
      const result = await updateUserRoleAction(input);

      if (result.success) {
        onClose();
        router.refresh();
        return;
      }

      setErrors(result.errors ?? {});
      setFormError(result.message);
    } catch {
      setFormError("Role update failed. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal onClose={onClose} open={open} title="Manage role">
      <form className="grid gap-5" onSubmit={handleSubmit}>
        {formError ? (
          <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
            {formError}
          </div>
        ) : null}
        <div className="grid gap-1 text-sm text-slate-600">
          <span className="font-medium text-slate-950">{user.name}</span>
          <span>{targetUser.email}</span>
        </div>
        <label className="grid gap-2 text-sm font-medium text-slate-700" htmlFor="manage-user-role">
          Role
          <select
            className="h-11 rounded-md border border-border-soft bg-white px-3 text-sm text-slate-950 outline-none transition-colors focus:border-brand-blue focus:ring-4 focus:ring-blue-100"
            id="manage-user-role"
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
        <div className="flex justify-end gap-3">
          <Button onClick={onClose} type="button" variant="secondary">
            Cancel
          </Button>
          <Button disabled={submitting || role === targetUser.role} type="submit">
            {submitting ? "Saving..." : "Save role"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
