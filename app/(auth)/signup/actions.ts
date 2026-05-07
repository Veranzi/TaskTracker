"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { upsertAppUser } from "@/lib/db/queries/users";

// Build the absolute origin from the incoming request — so signup on localhost
// gets a localhost confirmation link, signup on production gets the prod URL.
async function originFromRequest(): Promise<string> {
  const h = await headers();
  const forwardedHost = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const forwardedProto =
    h.get("x-forwarded-proto") ??
    (forwardedHost.startsWith("localhost") ? "http" : "https");
  return `${forwardedProto}://${forwardedHost}`;
}

const SignupSchema = z
  .object({
    name: z.string().trim().min(1, "Name is required").max(80),
    email: z.string().email("Enter a valid email"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export type SignupState = {
  error?: string;
  fieldErrors?: Partial<
    Record<"name" | "email" | "password" | "confirmPassword", string>
  >;
};

export async function signupAction(
  _prev: SignupState,
  formData: FormData,
): Promise<SignupState> {
  const parsed = SignupSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    const fieldErrors: SignupState["fieldErrors"] = {};
    for (const issue of parsed.error.issues) {
      const k = issue.path[0] as keyof NonNullable<SignupState["fieldErrors"]>;
      if (!fieldErrors[k]) fieldErrors[k] = issue.message;
    }
    return { fieldErrors };
  }

  const { name, email, password } = parsed.data;
  const supabase = await createClient();
  const origin = await originFromRequest();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name },
      // Dev vs prod: confirmation link points back to wherever signup happened.
      emailRedirectTo: `${origin}/auth/callback`,
    },
  });

  if (error) {
    return { error: error.message };
  }
  if (!data.user) {
    return {
      error:
        "Account created — check your email to confirm, then sign in. (Tip: disable email confirmation in Supabase → Authentication → Providers → Email for an internal tool.)",
    };
  }

  // Mirror into public.users so app tables can FK to it.
  await upsertAppUser({ id: data.user.id, email, name });

  redirect("/inbox");
}
