"use server";

import { revalidatePath } from "next/cache";
import { getRequiredSession } from "@/features/auth/auth-service";
import { hashPasswordForStorage } from "@/features/auth/password-hash";
import { mapDatabaseUserToUser } from "@/features/users/user-mappers";
import {
  hasCreateUserErrors,
  normalizeCreateUserInput,
  validateCreateUserInput,
  type CreateUserErrors,
  type CreateUserInput,
} from "@/features/users/user-utils";
import { canManageUsers } from "@/lib/permissions";
import { getPrisma } from "@/lib/prisma";
import { UserRole as DatabaseUserRole } from "@/prisma/generated/prisma/enums";
import type { User } from "@/types/user";
import type { UserRole } from "@/types/user";

type CreateUserActionResult =
  | {
      errors?: never;
      message?: string;
      persisted: true;
      success: true;
      user: User;
    }
  | {
      errors?: CreateUserErrors;
      message: string;
      persisted: false;
      reason: "database_not_configured" | "invalid_input" | "already_exists" | "forbidden" | "database_error";
      success: false;
      user?: never;
    };

const USER_ROLE_TO_DATABASE: Record<UserRole, DatabaseUserRole> = {
  admin: DatabaseUserRole.ADMIN,
  leader: DatabaseUserRole.LEADER,
  member: DatabaseUserRole.MEMBER,
};

export async function createUserAction(input: CreateUserInput): Promise<CreateUserActionResult> {
  const normalizedInput = normalizeCreateUserInput(input);
  const errors = validateCreateUserInput(normalizedInput);

  if (hasCreateUserErrors(errors)) {
    return {
      success: false,
      persisted: false,
      reason: "invalid_input",
      message: "Check the highlighted fields and try again.",
      errors,
    };
  }

  const session = await getRequiredSession();

  if (!canManageUsers(session.user.role)) {
    return {
      success: false,
      persisted: false,
      reason: "forbidden",
      message: "You do not have permission to manage users.",
    };
  }

  const prisma = getPrisma();

  if (!prisma) {
    return {
      success: false,
      persisted: false,
      reason: "database_not_configured",
      message: "Database access is required to invite users.",
    };
  }

  try {
    const existingUser = await prisma.user.findUnique({
      where: {
        email: normalizedInput.email,
      },
      select: {
        id: true,
      },
    });

    if (existingUser) {
      return {
        success: false,
        persisted: false,
        reason: "already_exists",
        message: "A user with this email already exists.",
        errors: {
          email: "Use a different PCNS email.",
        },
      };
    }

    const user = await prisma.user.create({
      data: {
        name: normalizedInput.name,
        email: normalizedInput.email,
        department: normalizedInput.department,
        role: USER_ROLE_TO_DATABASE[normalizedInput.role],
        passwordHash: hashPasswordForStorage(normalizedInput.temporaryPassword),
      },
    });

    revalidatePath("/users");

    return {
      success: true,
      persisted: true,
      user: mapDatabaseUserToUser(user),
    };
  } catch (error) {
    console.error("User invitation failed.", error);

    return {
      success: false,
      persisted: false,
      reason: "database_error",
      message: "User invitation failed. Check the database configuration and try again.",
    };
  }
}
