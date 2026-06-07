import Link from "next/link";
import {
  CalendarClock,
  CheckCircle2,
  Clock3,
  Edit,
  HandCoins,
  Plus,
  Trash2,
  type LucideIcon
} from "lucide-react";
import { PaymentReminderButton } from "@/components/admin/payment-reminder-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAdminOrganizationId } from "@/lib/admin/organization";
import { formatCurrency, formatDate } from "@/lib/admin/format";
import { prisma } from "@/lib/db/prisma";
import { dateInputValue } from "@/lib/payments/service";
import {
  buildDueReminderMessage,
  getReminderDashboardMetrics,
  getTodayBounds,
  getWhatsAppReminderUrl
} from "@/lib/reminders/service";
import {
  addPaymentAction,
  deletePaymentAction,
  updatePaymentAction
} from "@/server/actions/admin-payment-actions";

type Metric = {
  label: string;
  value: string | number;
  helper: string;
  icon: LucideIcon;
};

function formatEnumLabel(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function paymentStatusClass(status: string) {
  if (status === "PAID") {
    return "bg-green-50 text-green-700";
  }

  if (status === "OVERDUE") {
    return "bg-red-50 text-destructive";
  }

  if (status === "PARTIALLY_PAID") {
    return "bg-amber-50 text-amber-700";
  }

  return "bg-secondary text-muted-foreground";
}

const inputClass =
  "h-10 rounded-md border bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-ring";
const labelClass = "space-y-1 text-sm font-medium text-primary";

export default async function AdminPaymentsPage() {
  const organizationId = await getAdminOrganizationId();
  const { end } = getTodayBounds();

  const [
    projects,
    payments,
    projectCostTotals,
    paymentTotals,
    pendingTotals,
    dueRevenueTotals,
    reminderMetrics,
    reminderHistory
  ] = await Promise.all([
    prisma.project.findMany({
      where: { organizationId },
      include: {
        customer: {
          select: {
            name: true,
            phone: true
          }
        }
      },
      orderBy: { updatedAt: "desc" }
    }),
    prisma.payment.findMany({
      where: { organizationId },
      include: {
        customer: {
          select: {
            name: true,
            phone: true
          }
        },
        project: {
          select: {
            budget: true,
            code: true,
            id: true,
            name: true
          }
        },
        history: {
          orderBy: { paidAt: "desc" },
          take: 3
        },
        reminderHistory: {
          orderBy: { sentAt: "desc" },
          take: 3
        }
      },
      orderBy: [{ dueDate: "asc" }, { updatedAt: "desc" }]
    }),
    prisma.project.aggregate({
      where: { organizationId },
      _sum: { budget: true }
    }),
    prisma.payment.aggregate({
      where: { organizationId },
      _sum: {
        paidAmount: true,
        totalAmount: true
      }
    }),
    prisma.payment.aggregate({
      where: {
        organizationId,
        dueAmount: { gt: 0 },
        status: { notIn: ["PAID", "CANCELLED"] }
      },
      _sum: { dueAmount: true }
    }),
    prisma.payment.aggregate({
      where: {
        organizationId,
        dueAmount: { gt: 0 },
        dueDate: { lt: end },
        status: { notIn: ["PAID", "CANCELLED"] }
      },
      _sum: { dueAmount: true }
    }),
    getReminderDashboardMetrics(organizationId),
    prisma.reminderHistory.findMany({
      where: { organizationId },
      include: {
        customer: {
          select: {
            name: true,
            phone: true
          }
        },
        payment: {
          select: {
            invoiceNumber: true,
            title: true
          }
        },
        project: {
          select: {
            name: true
          }
        },
        sentBy: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: { sentAt: "desc" },
      take: 10
    })
  ]);

  const projectCost = Number(projectCostTotals._sum.budget ?? 0);
  const collectedRevenue = Number(paymentTotals._sum.paidAmount ?? 0);
  const pendingRevenue = Number(pendingTotals._sum.dueAmount ?? 0);
  const dueRevenue = Number(dueRevenueTotals._sum.dueAmount ?? 0);

  const metrics: Metric[] = [
    {
      label: "Project Cost",
      value: formatCurrency(projectCost),
      helper: "Total approved project budgets",
      icon: HandCoins
    },
    {
      label: "Collected Revenue",
      value: formatCurrency(collectedRevenue),
      helper: "Paid amount recorded",
      icon: CheckCircle2
    },
    {
      label: "Pending Revenue",
      value: formatCurrency(pendingRevenue),
      helper: "Open due amount",
      icon: Clock3
    },
    {
      label: "Due Revenue",
      value: formatCurrency(dueRevenue),
      helper: "Due today or overdue",
      icon: CalendarClock
    }
  ];

  const reminderCards: Metric[] = [
    {
      label: "Due Today",
      value: reminderMetrics.dueToday,
      helper: "Open payments due today",
      icon: CalendarClock
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
      helper: "Reminder history entries today",
      icon: CheckCircle2
    }
  ];

  return (
    <section className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase text-accent">
          Payment Management
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-primary">
          Payments and Due Reminders
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Track project cost, paid amount, due amount, collections, and WhatsApp
          reminders from one admin workspace.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
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

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Card className="rounded-md bg-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl text-primary">
              <Plus className="h-5 w-5 text-accent" aria-hidden="true" />
              Add Payment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form action={addPaymentAction} className="grid gap-4">
              <label className={labelClass}>
                Project
                <select className={inputClass} name="projectId" required>
                  <option value="">Select project</option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.code} · {project.name} · {project.customer.name} ·{" "}
                      {formatCurrency(project.budget)}
                    </option>
                  ))}
                </select>
              </label>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className={labelClass}>
                  Payment Title
                  <input
                    className={inputClass}
                    maxLength={180}
                    name="title"
                    placeholder="Foundation milestone"
                    required
                  />
                </label>
                <label className={labelClass}>
                  Invoice Number
                  <input
                    className={inputClass}
                    maxLength={80}
                    name="invoiceNumber"
                    placeholder="INV-2026-0002"
                  />
                </label>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <label className={labelClass}>
                  Total Amount
                  <input
                    className={inputClass}
                    min={0}
                    name="totalAmount"
                    required
                    step="0.01"
                    type="number"
                  />
                </label>
                <label className={labelClass}>
                  Paid Amount
                  <input
                    className={inputClass}
                    defaultValue={0}
                    min={0}
                    name="paidAmount"
                    required
                    step="0.01"
                    type="number"
                  />
                </label>
                <label className={labelClass}>
                  Due Date
                  <input className={inputClass} name="dueDate" type="date" />
                </label>
              </div>
              <Button type="submit">Add Payment</Button>
            </form>
          </CardContent>
        </Card>

        <Card className="rounded-md bg-white">
          <CardHeader>
            <CardTitle className="text-xl text-primary">
              Reminder Dashboard
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-3">
              {reminderCards.map((metric) => {
                const Icon = metric.icon;

                return (
                  <div key={metric.label} className="rounded-md border p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold uppercase text-muted-foreground">
                          {metric.label}
                        </p>
                        <p className="mt-2 text-xl font-bold text-primary">
                          {metric.value}
                        </p>
                      </div>
                      <Icon className="h-5 w-5 text-accent" aria-hidden="true" />
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {metric.helper}
                    </p>
                  </div>
                );
              })}
            </div>
            <div className="rounded-md bg-construction-concrete p-4">
              <p className="text-xs font-semibold uppercase text-muted-foreground">
                Automatic Daily Job
              </p>
              <p className="mt-2 text-sm text-primary">
                Schedule a daily request to{" "}
                <span className="font-semibold">/api/reminders/daily</span> with
                the reminder cron secret. The job records reminder history and
                updates each payment&apos;s last reminder date.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-md bg-white">
        <CardHeader>
          <CardTitle className="text-xl text-primary">Payment Records</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1120px] text-left text-sm">
              <thead className="border-b bg-construction-concrete text-primary">
                <tr>
                  <th className="px-3 py-3 font-semibold">Customer</th>
                  <th className="px-3 py-3 font-semibold">Project</th>
                  <th className="px-3 py-3 font-semibold">Project Cost</th>
                  <th className="px-3 py-3 font-semibold">Paid</th>
                  <th className="px-3 py-3 font-semibold">Due</th>
                  <th className="px-3 py-3 font-semibold">Status</th>
                  <th className="px-3 py-3 font-semibold">Reminder</th>
                  <th className="px-3 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => {
                  const dueAmount = Number(payment.dueAmount);
                  const reminderMessage = buildDueReminderMessage({
                    customerName: payment.customer.name,
                    dueAmount: payment.dueAmount,
                    projectName: payment.project.name
                  });
                  const whatsappUrl = getWhatsAppReminderUrl({
                    message: reminderMessage,
                    phone: payment.customer.phone
                  });

                  return (
                    <tr key={payment.id} className="border-b align-top">
                      <td className="px-3 py-4">
                        <p className="font-semibold text-primary">
                          {payment.customer.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {payment.customer.phone ?? "No phone"}
                        </p>
                      </td>
                      <td className="px-3 py-4">
                        <p className="font-semibold text-primary">
                          {payment.title}
                        </p>
                        <Link
                          href={`/admin/projects?project=${payment.project.id}`}
                          className="text-xs text-accent"
                        >
                          {payment.project.code} · {payment.project.name}
                        </Link>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {payment.invoiceNumber ?? "Invoice pending"} · Due{" "}
                          {formatDate(payment.dueDate)}
                        </p>
                      </td>
                      <td className="px-3 py-4 font-semibold text-primary">
                        {formatCurrency(payment.project.budget)}
                        <p className="mt-1 text-xs font-normal text-muted-foreground">
                          Invoice {formatCurrency(payment.totalAmount)}
                        </p>
                      </td>
                      <td className="px-3 py-4 font-semibold text-green-700">
                        {formatCurrency(payment.paidAmount)}
                      </td>
                      <td className="px-3 py-4 font-semibold text-destructive">
                        {formatCurrency(payment.dueAmount)}
                      </td>
                      <td className="px-3 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${paymentStatusClass(
                            payment.status
                          )}`}
                        >
                          {formatEnumLabel(payment.status)}
                        </span>
                      </td>
                      <td className="px-3 py-4">
                        <p className="text-xs text-muted-foreground">
                          Last: {formatDate(payment.lastReminderAt)}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Sent: {payment.reminderHistory.length}
                        </p>
                        <div className="mt-3">
                          <PaymentReminderButton
                            disabled={dueAmount <= 0}
                            paymentId={payment.id}
                            whatsappUrl={whatsappUrl}
                          />
                        </div>
                      </td>
                      <td className="px-3 py-4">
                        <div className="space-y-3">
                          <details className="rounded-md border p-3">
                            <summary className="flex cursor-pointer items-center gap-2 font-semibold text-primary">
                              <Edit className="h-4 w-4" aria-hidden="true" />
                              Edit
                            </summary>
                            <form
                              action={updatePaymentAction}
                              className="mt-4 grid gap-3"
                            >
                              <input
                                name="paymentId"
                                type="hidden"
                                value={payment.id}
                              />
                              <label className={labelClass}>
                                Project
                                <select
                                  className={inputClass}
                                  defaultValue={payment.project.id}
                                  name="projectId"
                                  required
                                >
                                  {projects.map((project) => (
                                    <option key={project.id} value={project.id}>
                                      {project.code} · {project.name}
                                    </option>
                                  ))}
                                </select>
                              </label>
                              <label className={labelClass}>
                                Payment Title
                                <input
                                  className={inputClass}
                                  defaultValue={payment.title}
                                  maxLength={180}
                                  name="title"
                                  required
                                />
                              </label>
                              <label className={labelClass}>
                                Invoice Number
                                <input
                                  className={inputClass}
                                  defaultValue={payment.invoiceNumber ?? ""}
                                  maxLength={80}
                                  name="invoiceNumber"
                                />
                              </label>
                              <div className="grid gap-3 sm:grid-cols-3">
                                <label className={labelClass}>
                                  Total
                                  <input
                                    className={inputClass}
                                    defaultValue={Number(payment.totalAmount)}
                                    min={0}
                                    name="totalAmount"
                                    required
                                    step="0.01"
                                    type="number"
                                  />
                                </label>
                                <label className={labelClass}>
                                  Paid
                                  <input
                                    className={inputClass}
                                    defaultValue={Number(payment.paidAmount)}
                                    min={0}
                                    name="paidAmount"
                                    required
                                    step="0.01"
                                    type="number"
                                  />
                                </label>
                                <label className={labelClass}>
                                  Due Date
                                  <input
                                    className={inputClass}
                                    defaultValue={dateInputValue(payment.dueDate)}
                                    name="dueDate"
                                    type="date"
                                  />
                                </label>
                              </div>
                              <Button size="sm" type="submit">
                                Save Payment
                              </Button>
                            </form>
                          </details>
                          <form action={deletePaymentAction}>
                            <input
                              name="paymentId"
                              type="hidden"
                              value={payment.id}
                            />
                            <Button size="sm" type="submit" variant="destructive">
                              <Trash2 className="h-4 w-4" aria-hidden="true" />
                              Delete
                            </Button>
                          </form>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {payments.length === 0 ? (
              <p className="p-6 text-sm text-muted-foreground">
                No payments have been created yet.
              </p>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-md bg-white">
        <CardHeader>
          <CardTitle className="text-xl text-primary">Reminder History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="border-b bg-construction-concrete text-primary">
                <tr>
                  <th className="px-3 py-3 font-semibold">Sent At</th>
                  <th className="px-3 py-3 font-semibold">Customer</th>
                  <th className="px-3 py-3 font-semibold">Project</th>
                  <th className="px-3 py-3 font-semibold">Due Amount</th>
                  <th className="px-3 py-3 font-semibold">Trigger</th>
                  <th className="px-3 py-3 font-semibold">Message</th>
                </tr>
              </thead>
              <tbody>
                {reminderHistory.map((history) => (
                  <tr key={history.id} className="border-b align-top">
                    <td className="px-3 py-4 text-muted-foreground">
                      {formatDate(history.sentAt)}
                    </td>
                    <td className="px-3 py-4">
                      <p className="font-semibold text-primary">
                        {history.customer?.name ?? "Customer removed"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {history.recipientPhone ?? history.customer?.phone ?? "-"}
                      </p>
                    </td>
                    <td className="px-3 py-4 text-muted-foreground">
                      {history.project?.name ?? "-"}
                    </td>
                    <td className="px-3 py-4 font-semibold text-destructive">
                      {formatCurrency(history.dueAmount)}
                    </td>
                    <td className="px-3 py-4">
                      <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-muted-foreground">
                        {formatEnumLabel(history.trigger)}
                      </span>
                    </td>
                    <td className="px-3 py-4 text-muted-foreground">
                      {history.message}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {reminderHistory.length === 0 ? (
              <p className="p-6 text-sm text-muted-foreground">
                No reminder history has been recorded yet.
              </p>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
