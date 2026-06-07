import Link from "next/link";
import {
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  Clock3,
  HandCoins
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireCustomer } from "@/lib/auth/authorization";
import { formatCurrency, formatDate } from "@/lib/admin/format";
import {
  formatEnumLabel,
  getCustomerPayments
} from "@/lib/customer/portal";

function getPaymentStatusClasses(status: string) {
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

export default async function CustomerPaymentsPage() {
  const session = await requireCustomer();
  const { nextDuePayment, payments, paymentTotals } = await getCustomerPayments(
    session.user.id
  );
  const overdueCount = payments.filter(
    (payment) => payment.status === "OVERDUE"
  ).length;

  return (
    <section className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase text-accent">
          Customer Payments
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-primary">
          My Payments
        </h1>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="rounded-md bg-white">
          <CardContent className="p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase text-muted-foreground">
                  Total Value
                </p>
                <p className="mt-3 text-2xl font-bold text-primary">
                  {formatCurrency(paymentTotals.totalAmount)}
                </p>
              </div>
              <HandCoins className="h-5 w-5 text-accent" aria-hidden="true" />
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-md bg-white">
          <CardContent className="p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase text-muted-foreground">
                  Paid
                </p>
                <p className="mt-3 text-2xl font-bold text-green-700">
                  {formatCurrency(paymentTotals.paidAmount)}
                </p>
              </div>
              <CheckCircle2 className="h-5 w-5 text-accent" aria-hidden="true" />
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-md bg-white">
          <CardContent className="p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase text-muted-foreground">
                  Due Amount
                </p>
                <p className="mt-3 text-2xl font-bold text-destructive">
                  {formatCurrency(paymentTotals.dueAmount)}
                </p>
              </div>
              <Clock3 className="h-5 w-5 text-accent" aria-hidden="true" />
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-md bg-white">
          <CardContent className="p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase text-muted-foreground">
                  Overdue
                </p>
                <p className="mt-3 text-2xl font-bold text-primary">
                  {overdueCount}
                </p>
              </div>
              <CalendarClock className="h-5 w-5 text-accent" aria-hidden="true" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-md bg-white">
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-xl text-primary">Payment Summary</CardTitle>
          <p className="text-sm text-muted-foreground">
            Next due:{" "}
            <span className="font-semibold text-primary">
              {nextDuePayment
                ? `${nextDuePayment.title} · ${formatDate(
                    nextDuePayment.dueDate
                  )}`
                : "No open dues"}
            </span>
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {payments.map((payment) => (
            <div key={payment.id} className="rounded-md border p-4">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="font-semibold text-primary">{payment.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {payment.invoiceNumber ?? "Invoice pending"} · Due{" "}
                    {formatDate(payment.dueDate)}
                  </p>
                  <Link
                    href={`/customer/projects/${payment.project.id}`}
                    className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-accent"
                  >
                    {payment.project.name}
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </div>
                <span
                  className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${getPaymentStatusClasses(
                    payment.status
                  )}`}
                >
                  {formatEnumLabel(payment.status)}
                </span>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <div className="rounded-md bg-construction-concrete p-3">
                  <p className="text-xs text-muted-foreground">Total</p>
                  <p className="mt-1 font-semibold text-primary">
                    {formatCurrency(payment.totalAmount)}
                  </p>
                </div>
                <div className="rounded-md bg-construction-concrete p-3">
                  <p className="text-xs text-muted-foreground">Paid</p>
                  <p className="mt-1 font-semibold text-green-700">
                    {formatCurrency(payment.paidAmount)}
                  </p>
                </div>
                <div className="rounded-md bg-construction-concrete p-3">
                  <p className="text-xs text-muted-foreground">Due</p>
                  <p className="mt-1 font-semibold text-destructive">
                    {formatCurrency(payment.dueAmount)}
                  </p>
                </div>
              </div>

              {payment.history.length > 0 ? (
                <div className="mt-4 rounded-md border border-dashed p-3">
                  <p className="text-xs font-semibold uppercase text-muted-foreground">
                    Payment History
                  </p>
                  <div className="mt-3 space-y-2">
                    {payment.history.map((history) => (
                      <div
                        key={history.id}
                        className="flex flex-col gap-1 text-sm sm:flex-row sm:items-center sm:justify-between"
                      >
                        <span className="font-semibold text-primary">
                          {formatCurrency(history.amount)}
                        </span>
                        <span className="text-muted-foreground">
                          {formatEnumLabel(history.method)} ·{" "}
                          {formatDate(history.paidAt)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          ))}
          {payments.length === 0 ? (
            <p className="rounded-md border border-dashed p-6 text-sm text-muted-foreground">
              No payments are assigned to your customer account yet.
            </p>
          ) : null}
        </CardContent>
      </Card>

      <Button asChild variant="outline">
        <Link href="/customer">
          Back to Dashboard
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </Button>
    </section>
  );
}
