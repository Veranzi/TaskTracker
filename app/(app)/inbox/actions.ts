"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db/client";
import { tasks, taskStatus, taskPriority, type TaskStatus } from "@/lib/db/schema";
import { requireUser } from "@/lib/auth";
import { upsertAppUser } from "@/lib/db/queries/users";

const CreateSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200),
  description: z.string().trim().max(5000).optional().or(z.literal("")),
  projectId: z.string().uuid("Pick a project"),
  priority: z.enum(taskPriority.enumValues).default("medium"),
  dueDate: z
    .string()
    .optional()
    .or(z.literal(""))
    .transform((v) => (v ? new Date(v) : null)),
  // null when posted as "" (empty) or "__pool" (the sentinel option)
  assigneeId: z
    .union([z.string().uuid(), z.literal(""), z.literal("__pool"), z.null()])
    .transform((v) => (v && v !== "__pool" ? v : null)),
});

export type CreateTaskState = { error?: string; ok?: true };

export async function createTaskAction(
  _prev: CreateTaskState,
  formData: FormData,
): Promise<CreateTaskState> {
  const user = await requireUser();
  await upsertAppUser({
    id: user.id,
    email: user.email!,
    name: (user.user_metadata?.name as string | undefined) ?? "Member",
  });

  const parsed = CreateSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description") ?? "",
    projectId: formData.get("projectId"),
    priority: formData.get("priority") ?? "medium",
    dueDate: formData.get("dueDate") ?? "",
    assigneeId: formData.get("assigneeId") ?? "",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const v = parsed.data;
  await db.insert(tasks).values({
    title: v.title,
    description: v.description || null,
    projectId: v.projectId,
    priority: v.priority,
    status: "open",
    dueDate: v.dueDate,
    assigneeId: v.assigneeId || null,
    createdById: user.id,
  });

  revalidatePath("/inbox");
  return { ok: true };
}

export async function selfAssignAction(taskId: string): Promise<void> {
  const user = await requireUser();
  // Defensive mirror — covers any path that bypassed signup/login (e.g.
  // accounts created via the Supabase dashboard) so the FK update doesn't fail.
  await upsertAppUser({
    id: user.id,
    email: user.email ?? "",
    name:
      (user.user_metadata?.name as string | undefined) ??
      user.email?.split("@")[0] ??
      "Member",
  });
  await db
    .update(tasks)
    .set({ assigneeId: user.id, updatedAt: new Date() })
    .where(eq(tasks.id, taskId));
  revalidatePath("/inbox");
}

const UpdateStatusSchema = z.object({
  taskId: z.string().uuid(),
  status: z.enum(taskStatus.enumValues),
});

export async function updateStatusAction(input: {
  taskId: string;
  status: TaskStatus;
}): Promise<void> {
  await requireUser();
  const parsed = UpdateStatusSchema.parse(input);
  const isDone = parsed.status === "resolved" || parsed.status === "closed";
  await db
    .update(tasks)
    .set({
      status: parsed.status,
      updatedAt: new Date(),
      completedAt: isDone ? new Date() : null,
    })
    .where(eq(tasks.id, parsed.taskId));
  revalidatePath("/inbox");
}
