import type { UserRole } from "@/types/user";

const PCNS_EMAIL_PATTERN = /^[^\s@]+@pcns\.org$/i;
const VALID_USER_ROLES: UserRole[] = ["admin", "leader", "member"];

export type CreateUserInput = {
  department: string;
  email: string;
  name: string;
  role: UserRole;
  temporaryPassword: string;
};

export type CreateUserErrors = Partial<Record<"department" | "email" | "name" | "role" | "temporaryPassword", string>>;
export type UpdateUserRoleInput = {
  role: UserRole;
  userId: string;
};
export type UpdateUserRoleErrors = Partial<Record<"role" | "userId", string>>;

export function normalizeCreateUserInput(input: CreateUserInput): CreateUserInput {
  return {
    name: input.name.trim(),
    email: input.email.trim().toLowerCase(),
    role: input.role,
    department: input.department.trim(),
    temporaryPassword: input.temporaryPassword,
  };
}

export function validateCreateUserInput(input: CreateUserInput): CreateUserErrors {
  const errors: CreateUserErrors = {};

  if (!input.name.trim()) {
    errors.name = "Name is required.";
  }

  if (!input.department.trim()) {
    errors.department = "Department is required.";
  }

  if (!input.email.trim()) {
    errors.email = "Email is required.";
  } else if (!PCNS_EMAIL_PATTERN.test(input.email)) {
    errors.email = "Use a valid PCNS email address.";
  }

  if (!VALID_USER_ROLES.includes(input.role)) {
    errors.role = "Select a valid role.";
  }

  if (!input.temporaryPassword) {
    errors.temporaryPassword = "Temporary password is required.";
  } else if (input.temporaryPassword.length < 8) {
    errors.temporaryPassword = "Temporary password must be at least 8 characters.";
  }

  return errors;
}

export function hasCreateUserErrors(errors: CreateUserErrors) {
  return Object.keys(errors).length > 0;
}

export function validateUpdateUserRoleInput(input: UpdateUserRoleInput): UpdateUserRoleErrors {
  const errors: UpdateUserRoleErrors = {};

  if (!input.userId.trim()) {
    errors.userId = "User is required.";
  }

  if (!VALID_USER_ROLES.includes(input.role)) {
    errors.role = "Select a valid role.";
  }

  return errors;
}

export function hasUpdateUserRoleErrors(errors: UpdateUserRoleErrors) {
  return Object.keys(errors).length > 0;
}
