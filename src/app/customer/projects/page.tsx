import Link from "next/link";
import {
  ArrowRight,
  CalendarClock,
  FileText,
  FolderKanban,
  ImageIcon,
  Package
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireCustomer } from "@/lib/auth/authorization";
import { formatCurrency, formatDate } from "@/lib/admin/format";
import {
  formatEnumLabel,
  getCustomerProjectCards,
  getPaymentTotals,
  getProjectTimeline
} from "@/lib/customer/portal";

export default async function CustomerProjectsPage() {
  const session = await requireCustomer();
  const projects = await getCustomerProjectCards(session.user.id);

  return (
    <section className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase text-accent">
          Customer Projects
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-primary">
          My Projects
        </h1>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {projects.map((project) => {
          const paymentTotals = getPaymentTotals(project.payments);
          const nextMilestone = getProjectTimeline(project.progress).find(
            (milestone) => milestone.status !== "completed"
          );
          const latestUpdate = project.updates[0];

          return (
            <Card key={project.id} className="rounded-md bg-white">
              <CardHeader className="space-y-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase text-muted-foreground">
                      {project.code}
                    </p>
                    <CardTitle className="mt-2 text-xl text-primary">
                      {project.name}
                    </CardTitle>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {formatEnumLabel(project.serviceType)} ·{" "}
                      {formatEnumLabel(project.status)}
                    </p>
                  </div>
                  <Button asChild size="sm">
                    <Link href={`/customer/projects/${project.id}`}>
                      Open
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-5">
                <div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold text-primary">
                      Progress
                    </span>
                    <span className="text-muted-foreground">
                      {project.progress}%
                    </span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-secondary">
                    <div
                      className="h-full rounded-full bg-accent"
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-md border p-4">
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase text-muted-foreground">
                      <CalendarClock className="h-4 w-4" aria-hidden="true" />
                      Next Milestone
                    </div>
                    <p className="mt-2 text-sm font-semibold text-primary">
                      {nextMilestone
                        ? `${nextMilestone.title} (${nextMilestone.progressTarget}%)`
                        : "All milestones complete"}
                    </p>
                  </div>
                  <div className="rounded-md border p-4">
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase text-muted-foreground">
                      <FolderKanban className="h-4 w-4" aria-hidden="true" />
                      Due Amount
                    </div>
                    <p className="mt-2 text-sm font-semibold text-destructive">
                      {formatCurrency(paymentTotals.dueAmount)}
                    </p>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-md bg-construction-concrete p-3">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <FileText className="h-4 w-4" aria-hidden="true" />
                      Documents
                    </div>
                    <p className="mt-1 font-semibold text-primary">
                      {project._count.documents}
                    </p>
                  </div>
                  <div className="rounded-md bg-construction-concrete p-3">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <ImageIcon className="h-4 w-4" aria-hidden="true" />
                      Photos
                    </div>
                    <p className="mt-1 font-semibold text-primary">
                      {project._count.mediaAssets}
                    </p>
                  </div>
                  <div className="rounded-md bg-construction-concrete p-3">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Package className="h-4 w-4" aria-hidden="true" />
                      Materials
                    </div>
                    <p className="mt-1 font-semibold text-primary">
                      {project._count.materialUsages}
                    </p>
                  </div>
                </div>

                <div className="rounded-md border border-dashed p-4">
                  <p className="text-xs font-semibold uppercase text-muted-foreground">
                    Latest Update
                  </p>
                  {latestUpdate ? (
                    <>
                      <p className="mt-2 text-sm font-semibold text-primary">
                        {latestUpdate.title}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {formatDate(latestUpdate.updateDate)}
                      </p>
                    </>
                  ) : (
                    <p className="mt-2 text-sm text-muted-foreground">
                      No customer-visible updates yet.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {projects.length === 0 ? (
        <Card className="rounded-md bg-white">
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">
              No projects are assigned to your customer account yet.
            </p>
          </CardContent>
        </Card>
      ) : null}
    </section>
  );
}
