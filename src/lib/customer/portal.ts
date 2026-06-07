import "server-only";
import { AppError } from "@/lib/errors/app-error";
import { prisma } from "@/lib/db/prisma";

export const projectTimelinePhases = [
  { title: "Site Survey", progressTarget: 5 },
  { title: "Foundation", progressTarget: 25 },
  { title: "Ground Floor", progressTarget: 45 },
  { title: "Roofing", progressTarget: 70 },
  { title: "Finishing", progressTarget: 95 }
] as const;

export type ProjectTimelineStatus = "completed" | "current" | "upcoming";

export type ProjectTimelineItem = {
  title: string;
  progressTarget: number;
  status: ProjectTimelineStatus;
};

type PaymentTotals = {
  dueAmount: number;
  paidAmount: number;
  totalAmount: number;
};

export function moneyToNumber(value: unknown) {
  if (value === null || value === undefined) {
    return 0;
  }

  return Number(value);
}

export function formatEnumLabel(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function getProjectTimeline(progress: number): ProjectTimelineItem[] {
  const boundedProgress = Math.max(0, Math.min(100, progress));
  const currentIndex = projectTimelinePhases.findIndex(
    (phase) => boundedProgress < phase.progressTarget
  );

  return projectTimelinePhases.map((phase, index) => {
    const isCompleted = boundedProgress >= phase.progressTarget;
    const isCurrent = !isCompleted && index === currentIndex;

    return {
      title: phase.title,
      progressTarget: phase.progressTarget,
      status: isCompleted ? "completed" : isCurrent ? "current" : "upcoming"
    };
  });
}

export function getPaymentTotals(
  payments: ReadonlyArray<{
    totalAmount: unknown;
    paidAmount: unknown;
    dueAmount: unknown;
  }>
) {
  return payments.reduce<PaymentTotals>(
    (totals, payment) => ({
      totalAmount: totals.totalAmount + moneyToNumber(payment.totalAmount),
      paidAmount: totals.paidAmount + moneyToNumber(payment.paidAmount),
      dueAmount: totals.dueAmount + moneyToNumber(payment.dueAmount)
    }),
    {
      totalAmount: 0,
      paidAmount: 0,
      dueAmount: 0
    }
  );
}

function getSoonestOpenPayment<
  TPayment extends {
    dueAmount: unknown;
    dueDate: Date | null;
    status: string;
  }
>(payments: TPayment[]) {
  return payments
    .filter(
      (payment) =>
        moneyToNumber(payment.dueAmount) > 0 &&
        payment.status !== "PAID" &&
        payment.status !== "CANCELLED"
    )
    .sort((first, second) => {
      const firstTime = first.dueDate?.getTime() ?? Number.MAX_SAFE_INTEGER;
      const secondTime = second.dueDate?.getTime() ?? Number.MAX_SAFE_INTEGER;

      return firstTime - secondTime;
    })[0];
}

export async function getCustomerPortalDashboard(userId: string) {
  const customer = await prisma.customer.findUnique({
    where: { userId },
    select: {
      id: true,
      name: true,
      siteAddress: true,
      projects: {
        include: {
          documents: {
            where: { status: "ACTIVE" },
            select: { id: true, type: true }
          },
          materialUsages: {
            orderBy: { usageDate: "desc" },
            select: { id: true },
            take: 1
          },
          mediaAssets: {
            where: { resourceType: "image" },
            select: { id: true }
          },
          payments: {
            orderBy: [{ dueDate: "asc" }, { updatedAt: "desc" }]
          },
          updates: {
            where: { visibility: "CUSTOMER" },
            orderBy: { updateDate: "desc" },
            take: 3
          }
        },
        orderBy: { updatedAt: "desc" }
      }
    }
  });

  const projects = customer?.projects ?? [];
  const payments = projects.flatMap((project) => project.payments);
  const paymentTotals = getPaymentTotals(payments);
  const nextDuePayment = getSoonestOpenPayment(payments);
  const averageProgress =
    projects.length > 0
      ? Math.round(
          projects.reduce((total, project) => total + project.progress, 0) /
            projects.length
        )
      : 0;

  const recentUpdates = projects
    .flatMap((project) =>
      project.updates.map((update) => ({
        ...update,
        project: {
          id: project.id,
          name: project.name
        }
      }))
    )
    .sort((first, second) => second.updateDate.getTime() - first.updateDate.getTime())
    .slice(0, 5);

  const upcomingMilestones = projects
    .flatMap((project) =>
      getProjectTimeline(project.progress)
        .filter((item) => item.status !== "completed")
        .slice(0, 2)
        .map((item) => ({
          ...item,
          project: {
            id: project.id,
            name: project.name
          }
        }))
    )
    .slice(0, 5);

  return {
    activeProjectCount: projects.filter(
      (project) => project.status !== "COMPLETED" && project.status !== "CANCELLED"
    ).length,
    averageProgress,
    completedProjectCount: projects.filter(
      (project) => project.status === "COMPLETED"
    ).length,
    customer,
    nextDuePayment,
    paymentTotals,
    projects,
    recentUpdates,
    upcomingMilestones
  };
}

export async function getCustomerProjectCards(userId: string) {
  return prisma.project.findMany({
    where: {
      customer: {
        userId
      }
    },
    include: {
      payments: {
        select: {
          dueAmount: true,
          dueDate: true,
          paidAmount: true,
          status: true,
          totalAmount: true
        },
        orderBy: [{ dueDate: "asc" }, { updatedAt: "desc" }]
      },
      updates: {
        where: { visibility: "CUSTOMER" },
        orderBy: { updateDate: "desc" },
        take: 1
      },
      _count: {
        select: {
          documents: true,
          materialUsages: true,
          mediaAssets: true
        }
      }
    },
    orderBy: { updatedAt: "desc" }
  });
}

export async function getCustomerProjectDetail({
  userId,
  projectId
}: {
  userId: string;
  projectId: string;
}) {
  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      customer: {
        userId
      }
    },
    include: {
      customer: {
        select: {
          billingAddress: true,
          email: true,
          name: true,
          phone: true,
          siteAddress: true
        }
      },
      documents: {
        where: { status: "ACTIVE" },
        orderBy: { createdAt: "desc" }
      },
      materialUsages: {
        orderBy: { usageDate: "desc" }
      },
      mediaAssets: {
        where: { resourceType: "image" },
        orderBy: { createdAt: "desc" }
      },
      payments: {
        include: {
          history: {
            orderBy: { paidAt: "desc" }
          }
        },
        orderBy: [{ dueDate: "asc" }, { updatedAt: "desc" }]
      },
      updates: {
        where: { visibility: "CUSTOMER" },
        orderBy: { updateDate: "desc" }
      }
    }
  });

  if (!project) {
    throw new AppError({
      code: "FORBIDDEN",
      message: "You do not have access to this project",
      statusCode: 403
    });
  }

  return project;
}

export async function getCustomerPayments(userId: string) {
  const customer = await prisma.customer.findUnique({
    where: { userId },
    select: {
      id: true,
      payments: {
        include: {
          history: {
            orderBy: { paidAt: "desc" }
          },
          project: {
            select: {
              code: true,
              id: true,
              name: true
            }
          }
        },
        orderBy: [{ dueDate: "asc" }, { updatedAt: "desc" }]
      }
    }
  });

  const payments = customer?.payments ?? [];

  return {
    nextDuePayment: getSoonestOpenPayment(payments),
    paymentTotals: getPaymentTotals(payments),
    payments
  };
}
