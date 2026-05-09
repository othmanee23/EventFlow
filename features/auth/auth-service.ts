import { currentUser } from "@/lib/mock-data";
import type { AuthSession, LoginCredentials } from "@/features/auth/auth-types";

export function getCurrentSession(): AuthSession {
  return {
    user: currentUser,
    expiresAt: "2026-12-31T23:59:59.000Z",
  };
}

export function validateLoginInput(credentials: LoginCredentials) {
  return credentials.email.trim().length > 0 && credentials.password.length >= 8;
}

