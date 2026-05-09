import { mockUsers } from "@/lib/mock-data";
import type { User } from "@/types/user";

export function getUsers(): User[] {
  return mockUsers;
}

export function getUserById(userId: string): User | undefined {
  return mockUsers.find((user) => user.id === userId);
}

