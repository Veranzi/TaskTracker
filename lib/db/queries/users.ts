import "server-only";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { users } from "@/lib/db/schema";

// Mirror an auth.users entry into public.users so app tables can FK to it.
export async function upsertAppUser(input: {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string | null;
}) {
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
