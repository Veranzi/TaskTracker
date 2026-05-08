import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { upsertAppUser } from "@/lib/db/queries/users";

// Supabase PKCE callback — exchanges the email-confirmation code for a session.
// Configure Supabase Auth → URL Configuration:
//   Site URL: http://localhost:3000 (or your production URL)
//   Redirect URLs: <site>/auth/callback
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/inbox";
  const error = searchParams.get("error_description") ?? searchParams.get("error");

  if (error) {
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(error)}`,
    );
  }

  if (code) {
    const supabase = await createClient();
    const { error: exchangeError, data } =
      await supabase.auth.exchangeCodeForSession(code);
    if (!exchangeError) {
      // Mirror auth.users → public.users so app tables can FK to this user.
      // Otherwise the first mutation (e.g. self-assign) blows up on the FK.
      if (data.user) {
        await upsertAppUser({
          id: data.user.id,
          email: data.user.email ?? "",
          name:
            (data.user.user_metadata?.name as string | undefined) ??
            data.user.email?.split("@")[0] ??
            "Member",
        });
      }
      const safeNext = next.startsWith("/") ? next : "/inbox";
      return NextResponse.redirect(`${origin}${safeNext}`);
    }
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(exchangeError.message)}`,
    );
  }

  return NextResponse.redirect(`${origin}/login`);
}
