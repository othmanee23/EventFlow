import { mockUsers } from "@/lib/mock-data";
import { getPrisma } from "@/lib/prisma";
import type { User } from "@/types/user";
import { mapDatabaseUserToUser } from "@/features/users/user-mappers";

export async function getUsers(): Promise<User[]> {
  const prisma = getPrisma();

  if (!prisma) {
    return mockUsers;
  }

  try {
    const users = await prisma.user.findMany({
      orderBy: [{ role: "asc" }, { name: "asc" }],
    });

    return users.length > 0 ? users.map(mapDatabaseUserToUser) : mockUsers;
  } catch (error) {
    console.warn("Falling back to mock users because the database read failed.", error);
    return mockUsers;
  }
}

export async function getUserById(userId: string): Promise<User | undefined> {
  const prisma = getPrisma();

  if (!prisma) {
    return mockUsers.find((user) => user.id === userId);
  }

  try {
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    return user ? mapDatabaseUserToUser(user) : mockUsers.find((mockUser) => mockUser.id === userId);
  } catch (error) {
    console.warn("Falling back to mock user lookup because the database read failed.", error);
    return mockUsers.find((user) => user.id === userId);
  }
}

export function getMockUsers(): User[] {
  return mockUsers;
}
