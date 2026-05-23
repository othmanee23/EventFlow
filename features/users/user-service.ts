import { mockUsers } from "@/lib/mock-data";
import { getPrisma, shouldUseMockFallback } from "@/lib/prisma";
import type { User } from "@/types/user";
import { mapDatabaseUserToUser } from "@/features/users/user-mappers";

export async function getUsers(): Promise<User[]> {
  const prisma = getPrisma();
  const useMockFallback = shouldUseMockFallback();

  if (!prisma) {
    return useMockFallback ? mockUsers : [];
  }

  try {
    const users = await prisma.user.findMany({
      orderBy: [{ role: "asc" }, { name: "asc" }],
    });

    return users.length > 0 ? users.map(mapDatabaseUserToUser) : useMockFallback ? mockUsers : [];
  } catch (error) {
    console.warn("User lookup failed.", error);
    return useMockFallback ? mockUsers : [];
  }
}

export async function getUserById(userId: string): Promise<User | undefined> {
  const prisma = getPrisma();
  const useMockFallback = shouldUseMockFallback();

  if (!prisma) {
    return useMockFallback ? mockUsers.find((user) => user.id === userId) : undefined;
  }

  try {
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (user) {
      return mapDatabaseUserToUser(user);
    }

    return useMockFallback ? mockUsers.find((mockUser) => mockUser.id === userId) : undefined;
  } catch (error) {
    console.warn("User by id lookup failed.", error);
    return useMockFallback ? mockUsers.find((user) => user.id === userId) : undefined;
  }
}

export async function getUserByEmail(email: string): Promise<User | undefined> {
  const normalizedEmail = email.trim().toLowerCase();
  const prisma = getPrisma();
  const useMockFallback = shouldUseMockFallback();

  if (!prisma) {
    return useMockFallback ? mockUsers.find((user) => user.email.toLowerCase() === normalizedEmail) : undefined;
  }

  try {
    const user = await prisma.user.findUnique({
      where: {
        email: normalizedEmail,
      },
    });

    if (user) {
      return mapDatabaseUserToUser(user);
    }

    return useMockFallback ? mockUsers.find((mockUser) => mockUser.email.toLowerCase() === normalizedEmail) : undefined;
  } catch (error) {
    console.warn("User by email lookup failed.", error);
    return useMockFallback ? mockUsers.find((user) => user.email.toLowerCase() === normalizedEmail) : undefined;
  }
}

export function getMockUsers(): User[] {
  return mockUsers;
}

export async function getAuthUserByEmail(email: string): Promise<{ passwordHash: string; user: User } | undefined> {
  const normalizedEmail = email.trim().toLowerCase();
  const prisma = getPrisma();

  if (!prisma) {
    return undefined;
  }

  try {
    const user = await prisma.user.findUnique({
      where: {
        email: normalizedEmail,
      },
      select: {
        avatarUrl: true,
        department: true,
        email: true,
        id: true,
        name: true,
        passwordHash: true,
        role: true,
      },
    });

    return user
      ? {
          user: mapDatabaseUserToUser(user),
          passwordHash: user.passwordHash,
        }
      : undefined;
  } catch (error) {
    console.warn("Database auth user lookup failed.", error);
    return undefined;
  }
}
