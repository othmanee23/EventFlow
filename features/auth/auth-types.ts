import type { User } from "@/types/user";

export type LoginCredentials = {
  email: string;
  password: string;
};

export type AuthSession = {
  user: User;
  expiresAt: string;
};

