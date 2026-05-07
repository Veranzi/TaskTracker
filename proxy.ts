import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

const AUTH_PATHS = new Set(["/login", "/signup"]);
const PUBLIC_PATHS = new Set([
  "/",
  "/login",
  "/signup",
  "/health",
  "/auth/callback",
]);

export async function proxy(request: NextRequest) {
  const { response, user } = await updateSession(request);
  const path = request.nextUrl.pathname;

  // Signed-in users shouldn't see auth pages.
  if (user && AUTH_PATHS.has(path)) {
    const url = request.nextUrl.clone();
    url.pathname = "/inbox";
    return NextResponse.redirect(url);
  }

  // Gate everything that's not explicitly public.
  if (!user && !PUBLIC_PATHS.has(path)) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    if (path !== "/") url.searchParams.set("next", path);
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  // Run on every request except Next internals and static files (anything with a dot).
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
