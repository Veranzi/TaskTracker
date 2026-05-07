import { requireUser } from "@/lib/auth";
import { listActiveProjects } from "@/lib/db/queries/projects";
import { listAppUsers } from "@/lib/db/queries/users";
import {
  listMyActive,
  listOthersActive,
  listUnassignedActive,
} from "@/lib/db/queries/tasks";
import {
  getKpis,
  getMyDailyCompleted,
  getMyFocus,
  getMyWorkload,
  getWeeklyTrend,
} from "@/lib/db/queries/dashboard";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { TaskCard } from "@/components/dashboard/task-card";
import { AssignToMeButton } from "@/components/dashboard/assign-to-me-button";
import { StatusSelect } from "@/components/dashboard/status-select";
import { MyFocusCard } from "@/components/dashboard/my-focus-card";
import { WorkloadDonut } from "@/components/dashboard/workload-donut";
import { DailyCompletedChart } from "@/components/dashboard/daily-completed-chart";
import { WeeklyTrendChart } from "@/components/dashboard/weekly-trend-chart";
import { NewTaskDialog } from "@/components/dashboard/new-task-dialog";
import { TeamActivity } from "@/components/dashboard/team-activity";

export const metadata = { title: "Dashboard · Pulse" };

export default async function InboxPage() {
  const user = await requireUser();
  const [
    kpis,
    unassigned,
    mine,
    others,
    focus,
    workload,
    daily,
    weekly,
    projects,
    users,
  ] = await Promise.all([
    getKpis(user.id),
    listUnassignedActive(),
    listMyActive(user.id),
    listOthersActive(user.id),
    getMyFocus(user.id),
    getMyWorkload(user.id),
    getMyDailyCompleted(user.id),
    getWeeklyTrend(),
    listActiveProjects(),
    listAppUsers(),
  ]);

  const name =
    (user.user_metadata?.name as string | undefined) ?? user.email ?? "there";

  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-8 flex flex-col gap-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Dashboard · {name.split(" ")[0]}
          </span>
          <h1 className="text-3xl font-semibold tracking-tight mt-1">
            Personal Dashboard
          </h1>
        </div>
        <NewTaskDialog
          projects={projects}
          users={users}
          currentUserId={user.id}
        />
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <KpiCard
          label="Unassigned"
          value={kpis.unassigned}
          sublabel="tasks available"
          accent
        />
        <KpiCard label="My tasks" value={kpis.myActive} sublabel="active" />
        <KpiCard label="Our tasks" value={kpis.ourActive} sublabel="team active" />
        <KpiCard
          label="My closed tasks"
          value={kpis.myClosed}
          sublabel="resolved + closed"
        />
        <KpiCard
          label="Our closed tasks"
          value={kpis.ourClosed}
          sublabel="team resolved + closed"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Panel
          title="Unassigned Tasks"
          rightLabel={kpis.unassigned > 0 ? "Self-assign" : undefined}
        >
          {unassigned.length === 0 ? (
            <Empty text="No unassigned tasks. Create one with “New task”." />
          ) : (
            unassigned.map((t) => (
              <TaskCard
                key={t.id}
                task={t}
                showStatus={false}
                action={<AssignToMeButton taskId={t.id} />}
              />
            ))
          )}
        </Panel>

        <Panel title="Assigned to me">
          {mine.length === 0 ? (
            <Empty text="Nothing on your plate. Pull a task from the pool, or create one." />
          ) : (
            mine.map((t) => (
              <TaskCard
                key={t.id}
                task={t}
                showStatus={false}
                action={<StatusSelect taskId={t.id} status={t.status} />}
              />
            ))
          )}
        </Panel>

        <div className="flex flex-col gap-4">
          <MyFocusCard focus={focus} />
          <WorkloadDonut slices={workload} />
        </div>
      </div>

      <TeamActivity tasks={others} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <DailyCompletedChart data={daily} />
        <WeeklyTrendChart data={weekly} />
      </div>
    </div>
  );
}

function Panel({
  title,
  rightLabel,
  children,
}: {
  title: string;
  rightLabel?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-lg border border-border bg-card p-4 flex flex-col gap-3">
      <header className="flex items-center justify-between">
        <h2 className="font-semibold tracking-tight">{title}</h2>
        {rightLabel ? (
          <span className="text-xs px-2 py-0.5 rounded-md bg-secondary text-muted-foreground">
            {rightLabel}
          </span>
        ) : null}
      </header>
      <div className="flex flex-col gap-2.5 max-h-[520px] overflow-y-auto pr-1">
        {children}
      </div>
    </section>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <div className="text-sm text-muted-foreground py-8 text-center px-2">
      {text}
    </div>
  );
}
