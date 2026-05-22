import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getUserById } from "@/features/users/user-service";
import type { AuthSession } from "@/features/auth/auth-types";

export const AUTH_SESSION_COOKIE = "eventflow_session";
export const AUTH_SESSION_MAX_AGE_SECONDS = 60 * 60 * 8;

export async function getCurrentSession(): Promise<AuthSession | null> {
  const cookieStore = await cookies();
  const userId = cookieStore.get(AUTH_SESSION_COOKIE)?.value;

  if (!userId) {
    return null;
  }

  const user = await getUserById(userId);

  if (!user) {
    return null;
  }

  return {
    user,
    expiresAt: new Date(Date.now() + AUTH_SESSION_MAX_AGE_SECONDS * 1000).toISOString(),
  };
}

export async function getRequiredSession(): Promise<AuthSession> {
  const session = await getCurrentSession();

  if (!session) {
    redirect("/login");
  }

  return session;
}
