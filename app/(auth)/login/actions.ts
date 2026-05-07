"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { upsertAppUser } from "@/lib/db/queries/users";

const LoginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

export type LoginState = {
  error?: string;
  fieldErrors?: Partial<Record<"email" | "password", string>>;
};

export async function loginAction(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const parsed = LoginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    const fieldErrors: LoginState["fieldErrors"] = {};
    for (const issue of parsed.error.issues) {
      const k = issue.path[0] as keyof NonNullable<LoginState["fieldErrors"]>;
      if (!fieldErrors[k]) fieldErrors[k] = issue.message;
    }
    return { fieldErrors };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    return { error: error.message };
  }

  // Make sure public.users is populated even for accounts created before the
  // mirror existed (e.g. via Supabase dashboard).
  if (data.user) {
    await upsertAppUser({
      id: data.user.id,
      email: data.user.email ?? parsed.data.email,
      name: (data.user.user_metadata?.name as string | undefined) ?? "Member",
    });
  }

  const next = (formData.get("next") as string | null) ?? "/inbox";
  redirect(next.startsWith("/") ? next : "/inbox");
}

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
