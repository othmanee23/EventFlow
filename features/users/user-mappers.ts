import type { User, UserRole } from "@/types/user";

export type DatabaseUser = {
  avatarUrl: string | null;
  department: string;
  email: string;
  id: string;
  name: string;
  passwordHash?: string;
  role: string;
};

const USER_ROLE_FROM_DATABASE: Record<string, UserRole> = {
  ADMIN: "admin",
  LEADER: "leader",
  MEMBER: "member",
};

export function mapDatabaseUserToUser(user: DatabaseUser): User {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: USER_ROLE_FROM_DATABASE[user.role] ?? "member",
    department: user.department,
    avatarUrl: user.avatarUrl ?? undefined,
  };
}
