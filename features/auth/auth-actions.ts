"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AUTH_SESSION_COOKIE, AUTH_SESSION_MAX_AGE_SECONDS } from "@/features/auth/auth-service";
import { validateLoginInput } from "@/features/auth/auth-utils";
import { getUserByEmail } from "@/features/users/user-service";
import type { LoginCredentials, LoginResult } from "@/features/auth/auth-types";

export async function signInAction(credentials: LoginCredentials): Promise<LoginResult> {
  const validation = validateLoginInput(credentials);

  if (!validation.valid) {
    return {
      success: false,
      message: "Check the highlighted fields and try again.",
      errors: validation.errors,
    };
  }

  const user = await getUserByEmail(credentials.email);

  if (!user) {
    return {
      success: false,
      message: "No active EventFlow user was found for this PCNS email.",
      errors: {
        email: "Use an EventFlow user email.",
      },
    };
  }

  const cookieStore = await cookies();

  cookieStore.set(AUTH_SESSION_COOKIE, user.id, {
    httpOnly: true,
    maxAge: AUTH_SESSION_MAX_AGE_SECONDS,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  return {
    success: true,
    session: {
      user,
      expiresAt: new Date(Date.now() + AUTH_SESSION_MAX_AGE_SECONDS * 1000).toISOString(),
    },
  };
}

export async function signOutAction() {
  const cookieStore = await cookies();

  cookieStore.delete(AUTH_SESSION_COOKIE);
  redirect("/login");
}
