import { requireUser } from "@/lib/auth";
import { LogoutButton } from "@/components/logout-button";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();
  const name =
    (user.user_metadata?.name as string | undefined) ?? user.email ?? "Member";

  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-border px-6 h-14 flex items-center justify-between sticky top-0 bg-background/85 backdrop-blur z-10">
        <span className="font-semibold tracking-tight">Pulse</span>
        <div className="flex items-center gap-3 text-sm">
          <span className="text-muted-foreground hidden sm:inline">{name}</span>
          <LogoutButton />
        </div>
      </header>
      <main className="flex-1 flex flex-col">{children}</main>
    </div>
  );
}
