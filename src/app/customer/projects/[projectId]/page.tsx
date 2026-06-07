import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  CalendarClock,
  CheckCircle2,
  Clock3,
  ExternalLink,
  FileText,
  HandCoins,
  ImageIcon,
  Package
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireCustomer } from "@/lib/auth/authorization";
import { formatCurrency, formatDate } from "@/lib/admin/format";
import {
  formatEnumLabel,
  getCustomerProjectDetail,
  getPaymentTotals,
  getProjectTimeline,
  type ProjectTimelineStatus
} from "@/lib/customer/portal";
import {
  getMediaCategoryLabel,
  mediaCategoryOptions
} from "@/lib/media/service";
import {
  formatMaterialQuantity,
  summarizeMaterialUsage
} from "@/lib/materials/service";

function getTimelineClasses(status: ProjectTimelineStatus) {
  if (status === "completed") {
    return "bg-green-50 text-green-700 ring-green-100";
  }

  if (status === "current") {
    return "bg-accent/10 text-accent ring-accent/20";
  }

  return "bg-secondary text-muted-foreground ring-border";
}

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

export default async function CustomerProjectPage({
  params
}: {
  params: Promise<{ projectId: string }>;
}) {
  const session = await requireCustomer();
  const { projectId } = await params;
  const project = await getCustomerProjectDetail({
    projectId,
    userId: session.user.id
  });

  const paymentTotals = getPaymentTotals(project.payments);
  const timeline = getProjectTimeline(project.progress);
  const documents = project.documents.filter(
    (document) => document.type !== "SITE_PHOTO"
  );
  const photoDocuments = project.documents.filter(
    (document) => document.type === "SITE_PHOTO"
  );
  const photos = [
    ...project.mediaAssets.map((asset) => ({
      category: asset.category,
      createdAt: asset.createdAt,
      height: asset.height ?? 420,
      id: asset.id,
      secureUrl: asset.secureUrl,
      title: asset.title ?? getMediaCategoryLabel(asset.category),
      width: asset.width ?? 640
    })),
    ...photoDocuments.map((document) => ({
      category: "DURING_CONSTRUCTION",
      createdAt: document.createdAt,
      height: 420,
      id: document.id,
      secureUrl: document.secureUrl,
      title: document.title,
      width: 640
    }))
  ].sort((first, second) => second.createdAt.getTime() - first.createdAt.getTime());
  const materialSummary = summarizeMaterialUsage(project.materialUsages);

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Button asChild size="sm" variant="outline">
            <Link href="/customer/projects">
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Projects
            </Link>
          </Button>
          <p className="mt-5 text-sm font-semibold uppercase text-accent">
            Customer Project
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-primary">
            {project.name}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {project.code} · {formatEnumLabel(project.serviceType)} ·{" "}
            {project.location ?? project.customer.siteAddress ?? "Site address pending"}
          </p>
        </div>
        <span className="inline-flex w-fit rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
          {formatEnumLabel(project.status)}
        </span>
      </div>

      <Card className="rounded-md bg-white">
        <CardContent className="p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase text-muted-foreground">
                Project Progress
              </p>
              <p className="mt-2 text-3xl font-bold text-primary">
                {project.progress}%
              </p>
            </div>
            <div className="w-full md:max-w-xl">
              <div className="h-3 overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full rounded-full bg-accent"
                  style={{ width: `${project.progress}%` }}
                />
              </div>
              <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                <span>Started {formatDate(project.startDate)}</span>
                <span>Target {formatDate(project.targetEndDate)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
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
              <HandCoins className="h-5 w-5 text-accent" aria-hidden="true" />
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-md bg-white">
          <CardContent className="p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase text-muted-foreground">
                  Documents
                </p>
                <p className="mt-3 text-2xl font-bold text-primary">
                  {documents.length}
                </p>
              </div>
              <FileText className="h-5 w-5 text-accent" aria-hidden="true" />
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-md bg-white">
          <CardContent className="p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase text-muted-foreground">
                  Photos
                </p>
                <p className="mt-3 text-2xl font-bold text-primary">
                  {photos.length}
                </p>
              </div>
              <ImageIcon className="h-5 w-5 text-accent" aria-hidden="true" />
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-md bg-white">
          <CardContent className="p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase text-muted-foreground">
                  Material Logs
                </p>
                <p className="mt-3 text-2xl font-bold text-primary">
                  {project.materialUsages.length}
                </p>
              </div>
              <Package className="h-5 w-5 text-accent" aria-hidden="true" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <Card className="rounded-md bg-white">
          <CardHeader>
            <CardTitle className="text-xl text-primary">Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {timeline.map((item, index) => {
                const isLastItem = index === timeline.length - 1;

                return (
                  <div key={item.title} className="relative flex gap-4">
                    {!isLastItem ? (
                      <span className="absolute left-4 top-9 h-[calc(100%-1rem)] w-px bg-border" />
                    ) : null}
                    <span
                      className={`z-10 grid h-8 w-8 shrink-0 place-items-center rounded-full ring-4 ${getTimelineClasses(
                        item.status
                      )}`}
                    >
                      {item.status === "completed" ? (
                        <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                      ) : item.status === "current" ? (
                        <Clock3 className="h-4 w-4" aria-hidden="true" />
                      ) : (
                        <CalendarClock className="h-4 w-4" aria-hidden="true" />
                      )}
                    </span>
                    <div className="pb-5">
                      <p className="font-semibold text-primary">{item.title}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {formatEnumLabel(item.status)} · Target{" "}
                        {item.progressTarget}% progress
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-md bg-white">
          <CardHeader>
            <CardTitle className="text-xl text-primary">Recent Updates</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {project.updates.map((update) => (
              <div key={update.id} className="rounded-md border p-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="font-semibold text-primary">{update.title}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {formatDate(update.updateDate)}
                    </p>
                  </div>
                  {update.progress ? (
                    <span className="rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold text-accent">
                      {update.progress}% progress
                    </span>
                  ) : null}
                </div>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  {update.description}
                </p>
              </div>
            ))}
            {project.updates.length === 0 ? (
              <p className="rounded-md border border-dashed p-6 text-sm text-muted-foreground">
                No customer-visible updates are available yet.
              </p>
            ) : null}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="rounded-md bg-white">
          <CardHeader>
            <CardTitle className="text-xl text-primary">Documents</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {documents.map((document) => (
              <a
                key={document.id}
                href={document.secureUrl}
                target="_blank"
                rel="noreferrer"
                className="flex flex-col gap-3 rounded-md border p-4 transition hover:border-accent hover:bg-construction-concrete sm:flex-row sm:items-center sm:justify-between"
              >
                <span>
                  <span className="block font-semibold text-primary">
                    {document.title}
                  </span>
                  <span className="mt-1 block text-xs text-muted-foreground">
                    {formatEnumLabel(document.type)} ·{" "}
                    {formatDate(document.issuedAt ?? document.createdAt)}
                  </span>
                  <span className="mt-1 block text-xs text-muted-foreground">
                    {document.fileName}
                  </span>
                </span>
                <span className="inline-flex items-center gap-2 text-sm font-semibold text-accent">
                  View
                  <ExternalLink className="h-4 w-4" aria-hidden="true" />
                </span>
              </a>
            ))}
            {documents.length === 0 ? (
              <p className="rounded-md border border-dashed p-6 text-sm text-muted-foreground">
                No active documents are available for this project yet.
              </p>
            ) : null}
          </CardContent>
        </Card>

        <Card className="rounded-md bg-white">
          <CardHeader>
            <CardTitle className="text-xl text-primary">Gallery</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {photos.length > 0 ? (
              mediaCategoryOptions.map((category) => {
                const categoryPhotos = photos.filter(
                  (photo) => photo.category === category.value
                );

                return (
                  <div key={category.value} className="space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="font-semibold text-primary">
                        {category.label}
                      </h3>
                      <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-muted-foreground">
                        {categoryPhotos.length}
                      </span>
                    </div>
                    {categoryPhotos.length > 0 ? (
                      <div className="grid gap-3 sm:grid-cols-2">
                        {categoryPhotos.map((photo) => (
                          <figure
                            key={photo.id}
                            className="overflow-hidden rounded-md border"
                          >
                            <Image
                              src={photo.secureUrl}
                              alt={photo.title}
                              width={photo.width}
                              height={photo.height}
                              className="aspect-[4/3] w-full object-cover"
                            />
                            <figcaption className="p-3 text-xs text-muted-foreground">
                              {photo.title} · {formatDate(photo.createdAt)}
                            </figcaption>
                          </figure>
                        ))}
                      </div>
                    ) : (
                      <p className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
                        No images in this category yet.
                      </p>
                    )}
                  </div>
                );
              })
            ) : (
              <p className="rounded-md border border-dashed p-6 text-sm text-muted-foreground">
                No photos have been uploaded for this project yet.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-md bg-white">
        <CardHeader>
          <CardTitle className="text-xl text-primary">Material Usage</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
            <div className="rounded-md bg-construction-concrete p-3">
              <p className="text-xs text-muted-foreground">Cement</p>
              <p className="mt-1 font-semibold text-primary">
                {materialSummary.cement} BAG
              </p>
            </div>
            <div className="rounded-md bg-construction-concrete p-3">
              <p className="text-xs text-muted-foreground">Steel</p>
              <p className="mt-1 font-semibold text-primary">
                {materialSummary.steel} KG
              </p>
            </div>
            <div className="rounded-md bg-construction-concrete p-3">
              <p className="text-xs text-muted-foreground">Bricks</p>
              <p className="mt-1 font-semibold text-primary">
                {materialSummary.bricks} PIECE
              </p>
            </div>
            <div className="rounded-md bg-construction-concrete p-3">
              <p className="text-xs text-muted-foreground">Sand</p>
              <p className="mt-1 font-semibold text-primary">
                {materialSummary.sand} CFT
              </p>
            </div>
            <div className="rounded-md bg-construction-concrete p-3">
              <p className="text-xs text-muted-foreground">Aggregate</p>
              <p className="mt-1 font-semibold text-primary">
                {materialSummary.aggregate} CFT
              </p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[880px] text-left text-sm">
              <thead className="border-b bg-construction-concrete text-primary">
                <tr>
                  <th className="px-3 py-3 font-semibold">Date</th>
                  <th className="px-3 py-3 font-semibold">Cement</th>
                  <th className="px-3 py-3 font-semibold">Steel</th>
                  <th className="px-3 py-3 font-semibold">Sand</th>
                  <th className="px-3 py-3 font-semibold">Aggregate</th>
                  <th className="px-3 py-3 font-semibold">Bricks</th>
                  <th className="px-3 py-3 font-semibold">Notes</th>
                </tr>
              </thead>
              <tbody>
                {project.materialUsages.map((usage) => (
                  <tr key={usage.id} className="border-b align-top">
                    <td className="px-3 py-4 text-muted-foreground">
                      {formatDate(usage.usageDate)}
                    </td>
                    <td className="px-3 py-4">
                      {formatMaterialQuantity(usage.cementQuantity, usage.cementUnit)}
                    </td>
                    <td className="px-3 py-4">
                      {formatMaterialQuantity(usage.steelQuantity, usage.steelUnit)}
                    </td>
                    <td className="px-3 py-4">
                      {formatMaterialQuantity(usage.sandQuantity, usage.sandUnit)}
                    </td>
                    <td className="px-3 py-4">
                      {formatMaterialQuantity(
                        usage.aggregateQuantity,
                        usage.aggregateUnit
                      )}
                    </td>
                    <td className="px-3 py-4">
                      {formatMaterialQuantity(usage.bricksQuantity, usage.bricksUnit)}
                    </td>
                    <td className="px-3 py-4 text-muted-foreground">
                      {usage.notes ?? "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {project.materialUsages.length === 0 ? (
              <p className="p-6 text-sm text-muted-foreground">
                No material usage has been recorded for this project yet.
              </p>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-md bg-white">
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-xl text-primary">Payments</CardTitle>
          <div className="flex flex-wrap gap-3 text-sm">
            <span className="font-semibold text-primary">
              Total {formatCurrency(paymentTotals.totalAmount)}
            </span>
            <span className="font-semibold text-green-700">
              Paid {formatCurrency(paymentTotals.paidAmount)}
            </span>
            <span className="font-semibold text-destructive">
              Due {formatCurrency(paymentTotals.dueAmount)}
            </span>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {project.payments.map((payment) => (
            <div key={payment.id} className="rounded-md border p-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="font-semibold text-primary">{payment.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {payment.invoiceNumber ?? "Invoice pending"} · Due{" "}
                    {formatDate(payment.dueDate)}
                  </p>
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
          {project.payments.length === 0 ? (
            <p className="rounded-md border border-dashed p-6 text-sm text-muted-foreground">
              No payments are available for this project yet.
            </p>
          ) : null}
        </CardContent>
      </Card>
    </section>
  );
}
