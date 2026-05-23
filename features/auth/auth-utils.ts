import type { LoginCredentials, LoginValidationResult } from "@/features/auth/auth-types";

const PCNS_EMAIL_PATTERN = /^[^\s@]+@pcns\.org$/i;
const DEFAULT_EVENTFLOW_LOGIN_PASSWORD = "password123";
const DEFAULT_POST_LOGIN_PATH = "/dashboard";

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

export function getEventFlowLoginPassword() {
  const configuredPassword = process.env.EVENTFLOW_LOGIN_PASSWORD?.trim();
  return configuredPassword && configuredPassword.length > 0 ? configuredPassword : DEFAULT_EVENTFLOW_LOGIN_PASSWORD;
}

export function isLoginPasswordValid(password: string) {
  return password === getEventFlowLoginPassword();
}

export function getSafePostLoginPath(nextPath: string | null | undefined) {
  if (!nextPath) {
    return DEFAULT_POST_LOGIN_PATH;
  }

  if (!nextPath.startsWith("/") || nextPath.startsWith("//")) {
    return DEFAULT_POST_LOGIN_PATH;
  }

  if (nextPath.startsWith("/login")) {
    return DEFAULT_POST_LOGIN_PATH;
  }

  return nextPath;
}
