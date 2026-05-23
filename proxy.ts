import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createClient as createSupabaseMiddlewareClient, isSupabaseConfigured } from "@/utils/supabase/middleware";

const PROTECTED_PREFIXES = ["/dashboard", "/projects", "/users"];
const AUTH_SESSION_COOKIE = "eventflow_session";

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const supabaseResponse =
    isSupabaseConfigured() ? await createSupabaseMiddlewareClient(request) : NextResponse.next({ request });
  const hasSessionCookie = Boolean(request.cookies.get(AUTH_SESSION_COOKIE)?.value);
  const isProtectedRoute = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );

  if (isProtectedRoute && !hasSessionCookie) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", `${pathname}${search}`);
    return withSupabaseCookies(supabaseResponse, NextResponse.redirect(loginUrl));
  }

  if (pathname === "/" && hasSessionCookie) {
    return withSupabaseCookies(supabaseResponse, NextResponse.redirect(new URL("/dashboard", request.url)));
  }

  return supabaseResponse;
}

export const config = {
  matcher: ["/", "/login", "/dashboard/:path*", "/projects/:path*", "/users/:path*"],
};

function withSupabaseCookies(baseResponse: NextResponse, response: NextResponse) {
  for (const cookie of baseResponse.cookies.getAll()) {
    response.cookies.set(cookie);
  }

  return response;
}
