export type UserRole = "admin" | "leader" | "member";

export type User = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  avatarUrl?: string;
};

