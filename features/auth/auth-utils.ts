import type { LoginCredentials, LoginValidationResult } from "@/features/auth/auth-types";

const PCNS_EMAIL_PATTERN = /^[^\s@]+@pcns\.org$/i;

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
