import type { User } from "@/types/user";

export type LoginCredentials = {
  email: string;
  password: string;
};

export type LoginFieldErrors = Partial<Record<keyof LoginCredentials, string>>;

export type LoginValidationResult = {
  valid: boolean;
  errors: LoginFieldErrors;
};

export type LoginResult =
  | {
      success: true;
      session: AuthSession;
    }
  | {
      success: false;
      message: string;
      errors?: LoginFieldErrors;
    };

export type AuthSession = {
  user: User;
  expiresAt: string;
};
