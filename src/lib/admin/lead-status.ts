import type { LeadStatus, SiteVisitStatus } from "@prisma/client";

export type LeadFilterStatus = "ALL" | "PENDING" | "SCHEDULED" | "COMPLETED" | "CANCELLED";

export const leadFilterOptions: Array<{
  label: string;
  value: LeadFilterStatus;
}> = [
  { label: "All", value: "ALL" },
  { label: "Pending", value: "PENDING" },
  { label: "Scheduled", value: "SCHEDULED" },
  { label: "Completed", value: "COMPLETED" },
  { label: "Cancelled", value: "CANCELLED" }
];

export const siteVisitStatusOptions: Array<{
  label: string;
  value: SiteVisitStatus;
}> = [
  { label: "Scheduled", value: "SCHEDULED" },
  { label: "Completed", value: "COMPLETED" },
  { label: "Cancelled", value: "CANCELLED" }
];

export function leadStatusLabel(status: LeadStatus) {
  const labels: Record<LeadStatus, string> = {
    NEW: "Pending",
    CONTACTED: "Pending",
    SITE_VISIT_SCHEDULED: "Scheduled",
    SITE_VISIT_COMPLETED: "Completed",
    QUOTATION_SENT: "Completed",
    NEGOTIATION: "Completed",
    WON: "Completed",
    LOST: "Cancelled",
    ARCHIVED: "Cancelled"
  };

  return labels[status];
}

export function siteVisitStatusLabel(status: SiteVisitStatus) {
  const labels: Record<SiteVisitStatus, string> = {
    SCHEDULED: "Scheduled",
    RESCHEDULED: "Scheduled",
    COMPLETED: "Completed",
    CANCELLED: "Cancelled",
    NO_SHOW: "Cancelled"
  };

  return labels[status];
}

export function leadStatusesForFilter(status: LeadFilterStatus) {
  if (status === "PENDING") {
    return ["NEW", "CONTACTED"] as const;
  }

  if (status === "SCHEDULED") {
    return ["SITE_VISIT_SCHEDULED"] as const;
  }

  if (status === "COMPLETED") {
    return ["SITE_VISIT_COMPLETED", "QUOTATION_SENT", "NEGOTIATION", "WON"] as const;
  }

  if (status === "CANCELLED") {
    return ["LOST", "ARCHIVED"] as const;
  }

  return undefined;
}

export function leadStatusFromVisitStatus(status: SiteVisitStatus): LeadStatus {
  if (status === "COMPLETED") {
    return "SITE_VISIT_COMPLETED";
  }

  if (status === "CANCELLED" || status === "NO_SHOW") {
    return "LOST";
  }

  return "SITE_VISIT_SCHEDULED";
}
