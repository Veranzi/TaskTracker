import "server-only";
import { and, eq, ne } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { users } from "@/lib/db/schema";

// Mirror an auth.users entry into public.users so app tables can FK to it.
export async function upsertAppUser(input: {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string | null;
}) {
  // Remove any stale row with the same email but a different id — this happens
  // when a Supabase auth user is deleted and recreated (new UUID, same email).
  // Without this, the insert below would crash on the email unique constraint.
  await db
    .delete(users)
    .where(and(eq(users.email, input.email), ne(users.id, input.id)));

  await db
    .insert(users)
    .values({
      id: input.id,
      email: input.email,
      name: input.name,
      avatarUrl: input.avatarUrl ?? null,
    })
    .onConflictDoUpdate({
      target: users.id,
      set: { email: input.email, name: input.name },
    });
}

export async function getAppUser(id: string) {
  const [row] = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return row ?? null;
}

export async function listAppUsers() {
  return db
    .select({ id: users.id, name: users.name, email: users.email })
    .from(users)
    .orderBy(users.name);
}
