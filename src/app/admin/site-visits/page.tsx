import type { Prisma, SiteVisitStatus } from "@prisma/client";
import { updateSiteVisitStatusAction } from "@/server/actions/admin-lead-actions";
import { requireAdmin } from "@/lib/auth/authorization";
import { prisma } from "@/lib/db/prisma";
import {
  siteVisitStatusLabel,
  siteVisitStatusOptions
} from "@/lib/admin/lead-status";
import { formatCurrency, formatDate, formatTime } from "@/lib/admin/format";
import { Button } from "@/components/ui/button";

type VisitFilterStatus = "ALL" | SiteVisitStatus;

type SearchParams = Promise<{
  q?: string;
  status?: VisitFilterStatus;
}>;

async function getAdminOrganizationId(userId: string, sessionOrgId?: string) {
  if (sessionOrgId) {
    return sessionOrgId;
  }

  const membership = await prisma.membership.findFirst({
    where: {
      userId,
      role: "ADMIN",
      status: "ACTIVE"
    },
    select: { organizationId: true }
  });

  return membership?.organizationId;
}

export default async function AdminSiteVisitsPage({
  searchParams
}: {
  searchParams: SearchParams;
}) {
  const session = await requireAdmin();
  const params = await searchParams;
  const query = params.q?.trim() ?? "";
  const status = params.status ?? "ALL";
  const organizationId = await getAdminOrganizationId(
    session.user.id,
    session.user.organizationId
  );

  if (!organizationId) {
    return <p className="text-sm text-destructive">Organization not found.</p>;
  }

  const where: Prisma.SiteVisitWhereInput = {
    organizationId,
    ...(status !== "ALL" ? { status } : {}),
    ...(query
      ? {
          OR: [
            { lead: { name: { contains: query, mode: "insensitive" } } },
            { lead: { phone: { contains: query, mode: "insensitive" } } },
            { lead: { location: { contains: query, mode: "insensitive" } } },
            {
              assignedStaff: {
                name: { contains: query, mode: "insensitive" }
              }
            }
          ]
        }
      : {})
  };

  const visits = await prisma.siteVisit.findMany({
    where,
    include: {
      lead: true,
      assignedStaff: {
        select: { id: true, name: true, email: true }
      }
    },
    orderBy: [{ visitDate: "desc" }, { visitTime: "desc" }]
  });

  return (
    <section className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase text-accent">
          Site Visit Scheduling
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-primary">
          Scheduled site visits
        </h1>
      </div>

      <form className="grid gap-3 border bg-white p-4 md:grid-cols-[1fr_220px_auto]">
        <input
          className="h-10 rounded-md border px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          defaultValue={query}
          name="q"
          placeholder="Search by lead, phone, location, engineer"
        />
        <select
          className="h-10 rounded-md border px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          defaultValue={status}
          name="status"
        >
          <option value="ALL">All</option>
          {siteVisitStatusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <Button type="submit" variant="navy">
          Filter Visits
        </Button>
      </form>

      <div className="overflow-x-auto border bg-white">
        <table className="w-full min-w-[980px] text-left text-sm">
          <thead className="bg-primary text-primary-foreground">
            <tr>
              <th className="px-4 py-3 font-semibold">Visit</th>
              <th className="px-4 py-3 font-semibold">Lead</th>
              <th className="px-4 py-3 font-semibold">Requirement</th>
              <th className="px-4 py-3 font-semibold">Engineer</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Update</th>
            </tr>
          </thead>
          <tbody>
            {visits.map((visit) => (
              <tr key={visit.id} className="border-t align-top">
                <td className="px-4 py-4">
                  <p className="font-semibold text-primary">
                    {formatDate(visit.visitDate)}
                  </p>
                  <p className="text-muted-foreground">
                    {formatTime(visit.visitTime)}
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Created {formatDate(visit.createdAt)}
                  </p>
                </td>
                <td className="px-4 py-4">
                  <p className="font-semibold text-primary">{visit.lead.name}</p>
                  <p className="text-muted-foreground">{visit.lead.phone}</p>
                  <p className="text-muted-foreground">{visit.lead.email ?? "-"}</p>
                  <p className="mt-2 text-muted-foreground">
                    {visit.lead.location}
                  </p>
                </td>
                <td className="px-4 py-4">
                  <p className="text-muted-foreground">
                    Plot:{" "}
                    {visit.lead.plotSize
                      ? `${visit.lead.plotSize} ${visit.lead.plotSizeUnit}`
                      : "-"}
                  </p>
                  <p className="text-muted-foreground">
                    Budget: {formatCurrency(visit.lead.budget)}
                  </p>
                  <p className="mt-2 max-w-sm text-muted-foreground">
                    {visit.lead.requirement}
                  </p>
                </td>
                <td className="px-4 py-4">
                  {visit.assignedStaff?.name ??
                    visit.assignedStaff?.email ??
                    "Unassigned"}
                </td>
                <td className="px-4 py-4">
                  <span className="inline-flex rounded-md bg-secondary px-2 py-1 text-xs font-semibold text-primary">
                    {siteVisitStatusLabel(visit.status)}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <form
                    action={updateSiteVisitStatusAction}
                    className="flex min-w-56 gap-2"
                  >
                    <input name="siteVisitId" type="hidden" value={visit.id} />
                    <select
                      className="h-9 rounded-md border px-2 text-sm"
                      defaultValue={visit.status}
                      name="status"
                    >
                      {siteVisitStatusOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <Button size="sm" type="submit">
                      Update
                    </Button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {visits.length === 0 ? (
          <p className="p-6 text-sm text-muted-foreground">
            No site visits match the selected filters.
          </p>
        ) : null}
      </div>
    </section>
  );
}
