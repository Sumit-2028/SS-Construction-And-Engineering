"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/authorization";
import { prisma } from "@/lib/db/prisma";
import { leadStatusFromVisitStatus } from "@/lib/admin/lead-status";

const scheduleVisitSchema = z.object({
  leadId: z.string().min(1),
  visitDate: z.string().min(1),
  visitTime: z.string().min(1),
  assignedStaffId: z.string().optional(),
  notes: z.string().trim().max(2000).optional()
});

const updateVisitStatusSchema = z.object({
  siteVisitId: z.string().min(1),
  status: z.enum(["SCHEDULED", "COMPLETED", "CANCELLED"])
});

const convertLeadSchema = z.object({
  leadId: z.string().min(1)
});

function timeToDate(time: string) {
  return new Date(`1970-01-01T${time}:00.000Z`);
}

function dateToUtcDate(date: string) {
  return new Date(`${date}T00:00:00.000Z`);
}

async function getAdminOrganizationId() {
  const session = await requireAdmin();

  if (session.user.organizationId) {
    return session.user.organizationId;
  }

  const membership = await prisma.membership.findFirst({
    where: {
      userId: session.user.id,
      role: "ADMIN",
      status: "ACTIVE"
    },
    select: {
      organizationId: true
    }
  });

  if (!membership) {
    throw new Error("Admin organization context was not found.");
  }

  return membership.organizationId;
}

export async function scheduleSiteVisitAction(formData: FormData) {
  const organizationId = await getAdminOrganizationId();
  const parsed = scheduleVisitSchema.parse({
    leadId: formData.get("leadId"),
    visitDate: formData.get("visitDate"),
    visitTime: formData.get("visitTime"),
    assignedStaffId: formData.get("assignedStaffId") || undefined,
    notes: formData.get("notes") || undefined
  });

  const lead = await prisma.lead.findFirstOrThrow({
    where: {
      id: parsed.leadId,
      organizationId
    },
    select: {
      id: true
    }
  });

  await prisma.$transaction(async (tx) => {
    await tx.siteVisit.create({
      data: {
        organizationId,
        leadId: lead.id,
        assignedStaffId: parsed.assignedStaffId || null,
        visitDate: dateToUtcDate(parsed.visitDate),
        visitTime: timeToDate(parsed.visitTime),
        status: "SCHEDULED",
        notes: parsed.notes
      }
    });

    await tx.lead.update({
      where: { id: lead.id },
      data: {
        assignedToId: parsed.assignedStaffId || undefined,
        status: "SITE_VISIT_SCHEDULED"
      }
    });
  });

  revalidatePath("/admin/leads");
  revalidatePath("/admin/site-visits");
}

export async function updateSiteVisitStatusAction(formData: FormData) {
  const organizationId = await getAdminOrganizationId();
  const parsed = updateVisitStatusSchema.parse({
    siteVisitId: formData.get("siteVisitId"),
    status: formData.get("status")
  });

  const siteVisit = await prisma.siteVisit.findFirstOrThrow({
    where: {
      id: parsed.siteVisitId,
      organizationId
    },
    select: {
      id: true,
      leadId: true
    }
  });

  await prisma.$transaction(async (tx) => {
    await tx.siteVisit.update({
      where: { id: siteVisit.id },
      data: {
        status: parsed.status,
        completedAt: parsed.status === "COMPLETED" ? new Date() : null
      }
    });

    await tx.lead.update({
      where: { id: siteVisit.leadId },
      data: {
        status: leadStatusFromVisitStatus(parsed.status)
      }
    });
  });

  revalidatePath("/admin/leads");
  revalidatePath("/admin/site-visits");
}

export async function convertLeadToCustomerAction(formData: FormData) {
  const organizationId = await getAdminOrganizationId();
  const parsed = convertLeadSchema.parse({
    leadId: formData.get("leadId")
  });

  const lead = await prisma.lead.findFirstOrThrow({
    where: {
      id: parsed.leadId,
      organizationId
    },
    include: {
      convertedCustomer: {
        select: {
          id: true
        }
      }
    }
  });

  if (lead.convertedCustomer) {
    revalidatePath("/admin/leads");
    return;
  }

  await prisma.$transaction(async (tx) => {
    await tx.customer.create({
      data: {
        organizationId,
        leadId: lead.id,
        name: lead.name,
        phone: lead.phone,
        email: lead.email,
        siteAddress: lead.location,
        address: lead.location
      }
    });

    await tx.lead.update({
      where: { id: lead.id },
      data: {
        status: "WON",
        convertedAt: new Date()
      }
    });
  });

  revalidatePath("/admin/leads");
  revalidatePath("/admin/customers");
}
