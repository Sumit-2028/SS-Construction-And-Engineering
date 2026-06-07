import Link from "next/link";
import {
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  Clock3,
  FolderKanban,
  HandCoins,
  type LucideIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireCustomer } from "@/lib/auth/authorization";
import { formatCurrency, formatDate } from "@/lib/admin/format";
import {
  formatEnumLabel,
  getCustomerPortalDashboard
} from "@/lib/customer/portal";

type DashboardWidget = {
  label: string;
  value: string | number;
  helper: string;
  icon: LucideIcon;
};

export default async function CustomerPage() {
  const session = await requireCustomer();
  const dashboard = await getCustomerPortalDashboard(session.user.id);
  const customerName =
    dashboard.customer?.name ?? session.user.name ?? "Customer";

  const widgets: DashboardWidget[] = [
    {
      label: "Project Progress",
      value: `${dashboard.averageProgress}%`,
      helper: `${dashboard.activeProjectCount} active, ${dashboard.completedProjectCount} completed`,
      icon: FolderKanban
    },
    {
      label: "Upcoming Milestones",
      value: dashboard.upcomingMilestones.length,
      helper: "Next construction phases",
      icon: CalendarClock
    },
    {
      label: "Recent Updates",
      value: dashboard.recentUpdates.length,
      helper: "Customer-visible updates",
      icon: Clock3
    },
    {
      label: "Payment Summary",
      value: formatCurrency(dashboard.paymentTotals.dueAmount),
      helper: `${formatCurrency(dashboard.paymentTotals.paidAmount)} paid`,
      icon: HandCoins
    }
  ];

  return (
    <section className="space-y-6">
      <div className="overflow-hidden rounded-md bg-primary text-primary-foreground shadow-corporate">
        <div className="construction-grid px-6 py-8 md:px-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase text-accent">
                Customer Portal
              </p>
              <h1 className="mt-3 text-3xl font-semibold sm:text-4xl">
                Welcome, {customerName}
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-white/70">
                Track your owned projects, timeline, documents, photos,
                material usage, payments, and pending dues in one place.
              </p>
            </div>
            <Button asChild size="lg">
              <Link href="/customer/projects">
                View Projects
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {widgets.map((widget) => {
          const Icon = widget.icon;

          return (
            <Card key={widget.label} className="rounded-md bg-white">
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase text-muted-foreground">
                      {widget.label}
                    </p>
                    <p className="mt-3 text-2xl font-bold text-primary">
                      {widget.value}
                    </p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {widget.helper}
                    </p>
                  </div>
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-accent/10 text-accent">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_0.8fr]">
        <Card className="rounded-md bg-white">
          <CardHeader className="flex flex-row items-center justify-between gap-4">
            <CardTitle className="text-xl text-primary">My Projects</CardTitle>
            <Button asChild size="sm" variant="outline">
              <Link href="/customer/projects">All Projects</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {dashboard.projects.slice(0, 3).map((project) => {
              const dueAmount = project.payments.reduce(
                (total, payment) => total + Number(payment.dueAmount),
                0
              );

              return (
                <Link
                  key={project.id}
                  href={`/customer/projects/${project.id}`}
                  className="block rounded-md border p-4 transition hover:border-accent hover:bg-construction-concrete"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="font-semibold text-primary">
                        {project.name}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {formatEnumLabel(project.status)} · {project.code}
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-destructive">
                      Due {formatCurrency(dueAmount)}
                    </p>
                  </div>
                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-secondary">
                    <div
                      className="h-full rounded-full bg-accent"
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                  <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                    <span>{project.progress}% complete</span>
                    <span>{project.location ?? dashboard.customer?.siteAddress}</span>
                  </div>
                </Link>
              );
            })}
            {dashboard.projects.length === 0 ? (
              <p className="rounded-md border border-dashed p-6 text-sm text-muted-foreground">
                No projects are assigned to your customer account yet.
              </p>
            ) : null}
          </CardContent>
        </Card>

        <Card className="rounded-md bg-white">
          <CardHeader>
            <CardTitle className="text-xl text-primary">
              Payment Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
              <div className="rounded-md border p-4">
                <p className="text-xs font-semibold uppercase text-muted-foreground">
                  Total Value
                </p>
                <p className="mt-2 text-lg font-bold text-primary">
                  {formatCurrency(dashboard.paymentTotals.totalAmount)}
                </p>
              </div>
              <div className="rounded-md border p-4">
                <p className="text-xs font-semibold uppercase text-muted-foreground">
                  Paid
                </p>
                <p className="mt-2 text-lg font-bold text-green-700">
                  {formatCurrency(dashboard.paymentTotals.paidAmount)}
                </p>
              </div>
              <div className="rounded-md border p-4">
                <p className="text-xs font-semibold uppercase text-muted-foreground">
                  Due Amount
                </p>
                <p className="mt-2 text-lg font-bold text-destructive">
                  {formatCurrency(dashboard.paymentTotals.dueAmount)}
                </p>
              </div>
            </div>
            <div className="rounded-md bg-construction-concrete p-4">
              <p className="text-xs font-semibold uppercase text-muted-foreground">
                Next Due
              </p>
              <p className="mt-2 text-sm font-semibold text-primary">
                {dashboard.nextDuePayment
                  ? `${dashboard.nextDuePayment.title} · ${formatDate(
                      dashboard.nextDuePayment.dueDate
                    )}`
                  : "No open payment dues"}
              </p>
            </div>
            <Button asChild className="w-full" variant="navy">
              <Link href="/customer/payments">View Payments</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="rounded-md bg-white">
          <CardHeader>
            <CardTitle className="text-xl text-primary">
              Upcoming Milestones
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {dashboard.upcomingMilestones.map((milestone) => (
              <Link
                key={`${milestone.project.id}-${milestone.title}`}
                href={`/customer/projects/${milestone.project.id}`}
                className="flex gap-3 rounded-md border p-4 transition hover:border-accent hover:bg-construction-concrete"
              >
                <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-accent/10 text-accent">
                  {milestone.status === "current" ? (
                    <Clock3 className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <CalendarClock className="h-4 w-4" aria-hidden="true" />
                  )}
                </span>
                <span>
                  <span className="block font-semibold text-primary">
                    {milestone.title}
                  </span>
                  <span className="mt-1 block text-xs text-muted-foreground">
                    {milestone.project.name} · Target {milestone.progressTarget}%
                  </span>
                </span>
              </Link>
            ))}
            {dashboard.upcomingMilestones.length === 0 ? (
              <p className="rounded-md border border-dashed p-6 text-sm text-muted-foreground">
                No upcoming milestones are pending.
              </p>
            ) : null}
          </CardContent>
        </Card>

        <Card className="rounded-md bg-white">
          <CardHeader>
            <CardTitle className="text-xl text-primary">Recent Updates</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {dashboard.recentUpdates.map((update) => (
              <Link
                key={update.id}
                href={`/customer/projects/${update.project.id}`}
                className="flex gap-3 rounded-md border p-4 transition hover:border-accent hover:bg-construction-concrete"
              >
                <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-green-50 text-green-700">
                  <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                </span>
                <span>
                  <span className="block font-semibold text-primary">
                    {update.title}
                  </span>
                  <span className="mt-1 block text-xs text-muted-foreground">
                    {update.project.name} · {formatDate(update.updateDate)}
                  </span>
                  <span className="mt-2 block text-sm text-muted-foreground">
                    {update.description}
                  </span>
                </span>
              </Link>
            ))}
            {dashboard.recentUpdates.length === 0 ? (
              <p className="rounded-md border border-dashed p-6 text-sm text-muted-foreground">
                No customer-visible updates are available yet.
              </p>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
