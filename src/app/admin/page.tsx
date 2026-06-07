import Link from "next/link";
import {
  ArrowRight,
  BellRing,
  CheckCircle2,
  Clock3,
  Edit,
  Eye,
  FileText,
  FolderKanban,
  HandCoins,
  ImageIcon,
  MapPinned,
  MessageSquareQuote,
  Package,
  Trash2,
  Users,
  type LucideIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAdminOrganizationId } from "@/lib/admin/organization";
import { formatCurrency, formatDate } from "@/lib/admin/format";
import { prisma } from "@/lib/db/prisma";
import {
  getReminderDashboardMetrics,
  getTodayBounds
} from "@/lib/reminders/service";

type DashboardMetric = {
  label: string;
  value: string | number;
  helper: string;
  icon: LucideIcon;
};

const adminModules = [
  { title: "Leads", href: "/admin/leads", icon: Users },
  { title: "Site Visits", href: "/admin/site-visits", icon: MapPinned },
  { title: "Customers", href: "/admin/customers", icon: Users },
  { title: "Projects", href: "/admin/projects", icon: FolderKanban },
  { title: "Payments", href: "/admin/payments", icon: HandCoins },
  { title: "Media", href: "/admin/media", icon: ImageIcon },
  { title: "Documents", href: "/admin/documents", icon: FileText },
  { title: "Testimonials", href: "/admin/testimonials", icon: MessageSquareQuote },
  { title: "Material Usage", href: "/admin/material-usage", icon: Package }
] as const;

export default async function AdminPage() {
  const organizationId = await getAdminOrganizationId();
  const { end } = getTodayBounds();

  if (!organizationId) {
    return <p className="text-sm text-destructive">Organization not found.</p>;
  }

  const [
    totalProjects,
    activeProjects,
    completedProjects,
    totalCustomers,
    totalLeads,
    upcomingSiteVisits,
    paymentTotals,
    dueRevenueTotals,
    reminderMetrics,
    customerRows
  ] = await Promise.all([
    prisma.project.count({ where: { organizationId } }),
    prisma.project.count({
      where: { organizationId, status: { in: ["PLANNING", "APPROVED", "IN_PROGRESS", "ON_HOLD"] } }
    }),
    prisma.project.count({ where: { organizationId, status: "COMPLETED" } }),
    prisma.customer.count({ where: { organizationId } }),
    prisma.lead.count({ where: { organizationId } }),
    prisma.siteVisit.count({
      where: {
        organizationId,
        status: "SCHEDULED",
        visitDate: { gte: new Date() }
      }
    }),
    prisma.payment.aggregate({
      where: { organizationId },
      _sum: {
        totalAmount: true,
        paidAmount: true,
        dueAmount: true
      }
    }),
    prisma.payment.aggregate({
      where: {
        organizationId,
        dueAmount: { gt: 0 },
        dueDate: { lt: end },
        status: { notIn: ["PAID", "CANCELLED"] }
      },
      _sum: {
        dueAmount: true
      }
    }),
    getReminderDashboardMetrics(organizationId),
    prisma.customer.findMany({
      where: { organizationId },
      include: {
        projects: {
          include: {
            payments: {
              include: {
                history: {
                  orderBy: { paidAt: "desc" },
                  take: 1
                }
              },
              orderBy: { updatedAt: "desc" }
            }
          },
          orderBy: { updatedAt: "desc" },
          take: 1
        }
      },
      orderBy: { updatedAt: "desc" },
      take: 8
    })
  ]);

  const revenue = Number(paymentTotals._sum.totalAmount ?? 0);
  const collectedRevenue = Number(paymentTotals._sum.paidAmount ?? 0);
  const totalDueAmount = Number(paymentTotals._sum.dueAmount ?? 0);
  const pendingRevenue = Math.max(revenue - collectedRevenue, totalDueAmount);
  const dueRevenue = Number(dueRevenueTotals._sum.dueAmount ?? 0);

  const metrics: DashboardMetric[] = [
    {
      label: "Total Projects",
      value: totalProjects,
      helper: "All registered jobs",
      icon: FolderKanban
    },
    {
      label: "Active Projects",
      value: activeProjects,
      helper: "Planning to execution",
      icon: Clock3
    },
    {
      label: "Completed Projects",
      value: completedProjects,
      helper: "Closed and handed over",
      icon: CheckCircle2
    },
    {
      label: "Total Customers",
      value: totalCustomers,
      helper: "Converted clients",
      icon: Users
    },
    {
      label: "Total Leads",
      value: totalLeads,
      helper: "All enquiries",
      icon: BellRing
    },
    {
      label: "Upcoming Site Visits",
      value: upcomingSiteVisits,
      helper: "Scheduled from today",
      icon: MapPinned
    },
    {
      label: "Revenue",
      value: formatCurrency(revenue),
      helper: "Total invoice value",
      icon: HandCoins
    },
    {
      label: "Collected Revenue",
      value: formatCurrency(collectedRevenue),
      helper: "Payments received",
      icon: CheckCircle2
    },
    {
      label: "Pending Revenue",
      value: formatCurrency(pendingRevenue),
      helper: "Balance to collect",
      icon: Clock3
    },
    {
      label: "Due Revenue",
      value: formatCurrency(dueRevenue),
      helper: "Due today or overdue",
      icon: HandCoins
    },
    {
      label: "Due Today",
      value: reminderMetrics.dueToday,
      helper: "Open payments due today",
      icon: BellRing
    },
    {
      label: "Overdue",
      value: reminderMetrics.overdue,
      helper: "Open payments past due",
      icon: Clock3
    },
    {
      label: "Reminder Sent",
      value: reminderMetrics.reminderSent,
      helper: "Sent today",
      icon: CheckCircle2
    }
  ];

  return (
    <section className="space-y-6">
      <div className="overflow-hidden bg-primary text-primary-foreground shadow-corporate">
        <div className="construction-grid px-6 py-8 md:px-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase text-accent">
                Admin Dashboard
              </p>
              <h1 className="mt-3 text-3xl font-semibold sm:text-4xl">
                Construction operations command center
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-white/70">
                Track leads, site visits, customers, project revenue, pending
                dues, and construction modules from one responsive dashboard.
              </p>
            </div>
            <Button asChild size="lg">
              <Link href="/admin/leads">
                Review Leads
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {metrics.map((metric) => {
          const Icon = metric.icon;

          return (
            <Card key={metric.label} className="rounded-md bg-white">
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase text-muted-foreground">
                      {metric.label}
                    </p>
                    <p className="mt-3 text-2xl font-bold text-primary">
                      {metric.value}
                    </p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {metric.helper}
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

      <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <Card className="rounded-md bg-white">
          <CardHeader>
            <CardTitle className="text-xl text-primary">Admin Modules</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2">
              {adminModules.map((module) => {
                const Icon = module.icon;

                return (
                  <Link
                    key={module.href}
                    href={module.href}
                    className="flex min-h-20 items-center gap-3 rounded-md border bg-white p-4 transition hover:border-accent hover:bg-construction-concrete"
                  >
                    <span className="grid h-10 w-10 place-items-center rounded-md bg-primary text-primary-foreground">
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <span className="font-semibold text-primary">
                      {module.title}
                    </span>
                  </Link>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-md bg-white">
          <CardHeader>
            <CardTitle className="text-xl text-primary">
              Customer Payment Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[820px] text-left text-sm">
                <thead className="border-b bg-construction-concrete text-primary">
                  <tr>
                    <th className="px-3 py-3 font-semibold">Customer Name</th>
                    <th className="px-3 py-3 font-semibold">Project Name</th>
                    <th className="px-3 py-3 font-semibold">Paid Amount</th>
                    <th className="px-3 py-3 font-semibold">Due Amount</th>
                    <th className="px-3 py-3 font-semibold">Last Payment</th>
                    <th className="px-3 py-3 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {customerRows.map((customer) => {
                    const project = customer.projects[0];
                    const payments = project?.payments ?? [];
                    const paidAmount = payments.reduce(
                      (total, payment) => total + Number(payment.paidAmount),
                      0
                    );
                    const dueAmount = payments.reduce(
                      (total, payment) => total + Number(payment.dueAmount),
                      0
                    );
                    const lastPayment = payments
                      .flatMap((payment) => payment.history)
                      .sort((a, b) => b.paidAt.getTime() - a.paidAt.getTime())[0];

                    return (
                      <tr key={customer.id} className="border-b align-middle">
                        <td className="px-3 py-4">
                          <p className="font-semibold text-primary">
                            {customer.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {customer.phone}
                          </p>
                        </td>
                        <td className="px-3 py-4 text-muted-foreground">
                          {project?.name ?? "No project assigned"}
                        </td>
                        <td className="px-3 py-4 font-semibold text-green-700">
                          {formatCurrency(paidAmount)}
                        </td>
                        <td className="px-3 py-4 font-semibold text-destructive">
                          {formatCurrency(dueAmount)}
                        </td>
                        <td className="px-3 py-4 text-muted-foreground">
                          {lastPayment ? formatDate(lastPayment.paidAt) : "-"}
                        </td>
                        <td className="px-3 py-4">
                          <div className="flex flex-wrap gap-2">
                            <Button asChild size="sm" variant="outline">
                              <Link href={`/admin/customers?customer=${customer.id}`}>
                                <Eye className="h-4 w-4" aria-hidden="true" />
                                View
                              </Link>
                            </Button>
                            <Button asChild size="sm" variant="outline">
                              <Link href={`/admin/customers?edit=${customer.id}`}>
                                <Edit className="h-4 w-4" aria-hidden="true" />
                                Edit
                              </Link>
                            </Button>
                            <Button size="sm" type="button" variant="outline">
                              <BellRing className="h-4 w-4" aria-hidden="true" />
                              Send Reminder
                            </Button>
                            <Button size="sm" type="button" variant="destructive">
                              <Trash2 className="h-4 w-4" aria-hidden="true" />
                              Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {customerRows.length === 0 ? (
                <p className="p-6 text-sm text-muted-foreground">
                  No customers found yet.
                </p>
              ) : null}
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
