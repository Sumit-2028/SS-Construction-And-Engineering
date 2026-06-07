import type { Prisma } from "@prisma/client";
import {
  convertLeadToCustomerAction,
  scheduleSiteVisitAction
} from "@/server/actions/admin-lead-actions";
import { requireAdmin } from "@/lib/auth/authorization";
import { prisma } from "@/lib/db/prisma";
import {
  leadFilterOptions,
  leadStatusLabel,
  leadStatusesForFilter,
  type LeadFilterStatus
} from "@/lib/admin/lead-status";
import { formatCurrency, formatDate, formatTime } from "@/lib/admin/format";
import { Button } from "@/components/ui/button";

type SearchParams = Promise<{
  q?: string;
  status?: LeadFilterStatus;
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

export default async function AdminLeadsPage({
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

  const statusValues = leadStatusesForFilter(status);
  const where: Prisma.LeadWhereInput = {
    organizationId,
    ...(statusValues ? { status: { in: [...statusValues] } } : {}),
    ...(query
      ? {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { phone: { contains: query, mode: "insensitive" } },
            { email: { contains: query, mode: "insensitive" } },
            { location: { contains: query, mode: "insensitive" } }
          ]
        }
      : {})
  };

  const [leads, engineers] = await Promise.all([
    prisma.lead.findMany({
      where,
      include: {
        siteVisits: {
          orderBy: { createdAt: "desc" },
          take: 1,
          include: {
            assignedStaff: {
              select: { id: true, name: true, email: true }
            }
          }
        },
        convertedCustomer: {
          select: { id: true }
        }
      },
      orderBy: { createdAt: "desc" }
    }),
    prisma.user.findMany({
      where: {
        isActive: true,
        role: "ADMIN",
        memberships: {
          some: {
            organizationId,
            status: "ACTIVE"
          }
        }
      },
      select: { id: true, name: true, email: true },
      orderBy: { name: "asc" }
    })
  ]);

  return (
    <section className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase text-accent">
          Lead Management
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-primary">
          Leads and site visit requests
        </h1>
      </div>

      <form className="grid gap-3 border bg-white p-4 md:grid-cols-[1fr_220px_auto]">
        <input
          className="h-10 rounded-md border px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          defaultValue={query}
          name="q"
          placeholder="Search by name, phone, email, location"
        />
        <select
          className="h-10 rounded-md border px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          defaultValue={status}
          name="status"
        >
          {leadFilterOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <Button type="submit" variant="navy">
          Search Leads
        </Button>
      </form>

      <div className="overflow-x-auto border bg-white">
        <table className="w-full min-w-[1180px] text-left text-sm">
          <thead className="bg-primary text-primary-foreground">
            <tr>
              <th className="px-4 py-3 font-semibold">Lead</th>
              <th className="px-4 py-3 font-semibold">Project Details</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Latest Visit</th>
              <th className="px-4 py-3 font-semibold">Schedule Visit</th>
              <th className="px-4 py-3 font-semibold">Customer</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((lead) => {
              const latestVisit = lead.siteVisits[0];

              return (
                <tr key={lead.id} className="border-t align-top">
                  <td className="px-4 py-4">
                    <p className="font-semibold text-primary">{lead.name}</p>
                    <p className="mt-1 text-muted-foreground">{lead.phone}</p>
                    <p className="text-muted-foreground">{lead.email ?? "-"}</p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      Created {formatDate(lead.createdAt)}
                    </p>
                  </td>
                  <td className="px-4 py-4">
                    <p className="font-medium text-primary">{lead.location}</p>
                    <p className="mt-1 text-muted-foreground">
                      Plot: {lead.plotSize ? `${lead.plotSize} ${lead.plotSizeUnit}` : "-"}
                    </p>
                    <p className="text-muted-foreground">
                      Budget: {formatCurrency(lead.budget)}
                    </p>
                    <p className="mt-2 max-w-sm text-muted-foreground">
                      {lead.requirement}
                    </p>
                  </td>
                  <td className="px-4 py-4">
                    <span className="inline-flex rounded-md bg-secondary px-2 py-1 text-xs font-semibold text-primary">
                      {leadStatusLabel(lead.status)}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    {latestVisit ? (
                      <div>
                        <p className="font-medium text-primary">
                          {formatDate(latestVisit.visitDate)}
                        </p>
                        <p className="text-muted-foreground">
                          {formatTime(latestVisit.visitTime)}
                        </p>
                        <p className="text-muted-foreground">
                          {latestVisit.assignedStaff?.name ??
                            latestVisit.assignedStaff?.email ??
                            "Unassigned"}
                        </p>
                      </div>
                    ) : (
                      <p className="text-muted-foreground">Pending schedule</p>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <form
                      action={scheduleSiteVisitAction}
                      className="grid min-w-72 gap-2"
                    >
                      <input name="leadId" type="hidden" value={lead.id} />
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          className="h-9 rounded-md border px-2 text-sm"
                          name="visitDate"
                          required
                          type="date"
                        />
                        <input
                          className="h-9 rounded-md border px-2 text-sm"
                          name="visitTime"
                          required
                          type="time"
                        />
                      </div>
                      <select
                        className="h-9 rounded-md border px-2 text-sm"
                        name="assignedStaffId"
                      >
                        <option value="">Assign Engineer</option>
                        {engineers.map((engineer) => (
                          <option key={engineer.id} value={engineer.id}>
                            {engineer.name ?? engineer.email}
                          </option>
                        ))}
                      </select>
                      <input
                        className="h-9 rounded-md border px-2 text-sm"
                        name="notes"
                        placeholder="Notes"
                      />
                      <Button size="sm" type="submit">
                        Schedule Visit
                      </Button>
                    </form>
                  </td>
                  <td className="px-4 py-4">
                    {lead.convertedCustomer ? (
                      <span className="text-sm font-semibold text-green-700">
                        Converted
                      </span>
                    ) : (
                      <form action={convertLeadToCustomerAction}>
                        <input name="leadId" type="hidden" value={lead.id} />
                        <Button size="sm" type="submit" variant="navy">
                          Convert Lead
                        </Button>
                      </form>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {leads.length === 0 ? (
          <p className="p-6 text-sm text-muted-foreground">
            No leads match the selected filters.
          </p>
        ) : null}
      </div>
    </section>
  );
}
