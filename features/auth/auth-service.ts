import { currentUser } from "@/lib/mock-data";
import type { AuthSession, LoginCredentials, LoginResult, LoginValidationResult } from "@/features/auth/auth-types";

const PCNS_EMAIL_PATTERN = /^[^\s@]+@pcns\.org$/i;

export function getCurrentSession(): AuthSession {
  return {
    user: currentUser,
    expiresAt: "2026-12-31T23:59:59.000Z",
  };
}

export function validateLoginInput(credentials: LoginCredentials): LoginValidationResult {
  const errors: LoginValidationResult["errors"] = {};
  const email = credentials.email.trim();

  if (!email) {
    errors.email = "Email is required.";
  } else if (!PCNS_EMAIL_PATTERN.test(email)) {
    errors.email = "Use a valid PCNS email address.";
  }

  if (!credentials.password) {
    errors.password = "Password is required.";
  } else if (credentials.password.length < 8) {
    errors.password = "Password must be at least 8 characters.";
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

export async function mockSignIn(credentials: LoginCredentials): Promise<LoginResult> {
  const validation = validateLoginInput(credentials);

  await new Promise((resolve) => setTimeout(resolve, 500));

  if (!validation.valid) {
    return {
      success: false,
      message: "Check the highlighted fields and try again.",
      errors: validation.errors,
    };
  }

  return {
    success: true,
    session: getCurrentSession(),
  };
}
