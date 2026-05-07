export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center p-6">
      <div className="flex flex-col items-center gap-2 mb-8">
        <span className="font-semibold tracking-tight text-2xl">Pulse</span>
        <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
          Internal task tracker
        </span>
      </div>
      <div className="w-full max-w-sm">{children}</div>
    </div>
  );
}
