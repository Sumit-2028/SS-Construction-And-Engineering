import type { ReminderTrigger } from "@prisma/client";
import { formatCurrency } from "@/lib/admin/format";
import { prisma } from "@/lib/db/prisma";
import { AppError } from "@/lib/errors/app-error";
import {
  resolvePaymentStatus,
  toMoneyNumber
} from "@/lib/payments/service";

const openPaymentStatuses = ["PENDING", "PARTIALLY_PAID", "OVERDUE"] as const;

export function getTodayBounds(now = new Date()) {
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(end.getDate() + 1);

  return { start, end };
}

export function buildDueReminderMessage({
  customerName,
  dueAmount,
  projectName
}: {
  customerName: string;
  dueAmount: unknown;
  projectName: string;
}) {
  return `Hello ${customerName}, this is a payment reminder for ${projectName}. Due amount: ${formatCurrency(
    dueAmount
  )}. Please complete the payment at your earliest convenience.`;
}

export function normalizePhoneForWhatsApp(phone: string | null | undefined) {
  if (!phone) {
    return "";
  }

  const digits = phone.replace(/\D/g, "");

  if (digits.length === 10) {
    return `91${digits}`;
  }

  return digits;
}

export function getWhatsAppReminderUrl({
  message,
  phone
}: {
  message: string;
  phone: string | null | undefined;
}) {
  const normalizedPhone = normalizePhoneForWhatsApp(phone);
  const encodedMessage = encodeURIComponent(message);

  if (!normalizedPhone) {
    return `https://wa.me/?text=${encodedMessage}`;
  }

  return `https://wa.me/${normalizedPhone}?text=${encodedMessage}`;
}

export async function sendPaymentDueReminder({
  organizationId,
  paymentId,
  sentById,
  trigger = "MANUAL"
}: {
  organizationId: string;
  paymentId: string;
  sentById?: string;
  trigger?: ReminderTrigger;
}) {
  const payment = await prisma.payment.findFirst({
    where: {
      id: paymentId,
      organizationId
    },
    include: {
      customer: {
        select: {
          id: true,
          name: true,
          phone: true,
          userId: true
        }
      },
      project: {
        select: {
          id: true,
          name: true
        }
      }
    }
  });

  if (!payment) {
    throw new AppError({
      code: "NOT_FOUND",
      message: "Payment was not found.",
      statusCode: 404
    });
  }

  const dueAmount = toMoneyNumber(payment.dueAmount);

  if (dueAmount <= 0 || payment.status === "PAID" || payment.status === "CANCELLED") {
    throw new AppError({
      code: "BAD_REQUEST",
      message: "This payment has no open due amount.",
      statusCode: 400
    });
  }

  const now = new Date();
  const message = buildDueReminderMessage({
    customerName: payment.customer.name,
    dueAmount: payment.dueAmount,
    projectName: payment.project.name
  });
  const recipientPhone = payment.customer.phone;
  const deliveryStatus = recipientPhone ? "SENT" : "GENERATED";

  const result = await prisma.$transaction(async (tx) => {
    const existingReminder = await tx.dueReminder.findFirst({
      where: {
        organizationId,
        paymentId: payment.id,
        status: "PENDING"
      },
      select: {
        id: true
      }
    });

    const reminder =
      existingReminder ??
      (await tx.dueReminder.create({
        data: {
          organizationId,
          customerId: payment.customerId,
          projectId: payment.projectId,
          paymentId: payment.id,
          assignedToId: sentById,
          createdById: sentById,
          title: `Payment due: ${payment.title}`,
          description: message,
          dueAt: payment.dueDate ?? now,
          priority: payment.status === "OVERDUE" ? "HIGH" : "MEDIUM"
        },
        select: {
          id: true
        }
      }));

    const history = await tx.reminderHistory.create({
      data: {
        organizationId,
        customerId: payment.customerId,
        projectId: payment.projectId,
        paymentId: payment.id,
        reminderId: reminder.id,
        sentById,
        channel: "WHATSAPP",
        trigger,
        status: deliveryStatus,
        recipientPhone,
        message,
        dueAmount: payment.dueAmount,
        sentAt: now
      },
      select: {
        id: true,
        message: true,
        sentAt: true,
        status: true
      }
    });

    await tx.payment.update({
      where: { id: payment.id },
      data: {
        lastReminderAt: now,
        status: resolvePaymentStatus({
          dueDate: payment.dueDate,
          paidAmount: payment.paidAmount,
          totalAmount: payment.totalAmount
        })
      }
    });

    if (payment.customer.userId) {
      await tx.notification.create({
        data: {
          organizationId,
          recipientId: payment.customer.userId,
          projectId: payment.projectId,
          type: "PAYMENT",
          title: "Payment due reminder",
          message,
          actionUrl: "/customer/payments"
        }
      });
    }

    return history;
  });

  return {
    ...result,
    whatsappUrl: getWhatsAppReminderUrl({
      message,
      phone: recipientPhone
    })
  };
}

export async function runDailyDueReminderJob({
  organizationId
}: {
  organizationId?: string;
} = {}) {
  const { start, end } = getTodayBounds();

  const payments = await prisma.payment.findMany({
    where: {
      organizationId,
      dueAmount: { gt: 0 },
      dueDate: { lt: end },
      status: { in: [...openPaymentStatuses] },
      OR: [{ lastReminderAt: null }, { lastReminderAt: { lt: start } }]
    },
    select: {
      id: true,
      organizationId: true
    },
    orderBy: [{ dueDate: "asc" }, { updatedAt: "desc" }]
  });

  const result = {
    failed: 0,
    processed: 0,
    sent: 0
  };

  for (const payment of payments) {
    result.processed += 1;

    try {
      await sendPaymentDueReminder({
        organizationId: payment.organizationId,
        paymentId: payment.id,
        trigger: "AUTOMATIC"
      });
      result.sent += 1;
    } catch {
      result.failed += 1;
    }
  }

  return result;
}

export async function getReminderDashboardMetrics(organizationId: string) {
  const { start, end } = getTodayBounds();

  const [dueToday, overdue, reminderSent] = await Promise.all([
    prisma.payment.count({
      where: {
        organizationId,
        dueAmount: { gt: 0 },
        dueDate: {
          gte: start,
          lt: end
        },
        status: { in: [...openPaymentStatuses] }
      }
    }),
    prisma.payment.count({
      where: {
        organizationId,
        dueAmount: { gt: 0 },
        dueDate: {
          lt: start
        },
        status: { in: [...openPaymentStatuses] }
      }
    }),
    prisma.reminderHistory.count({
      where: {
        organizationId,
        sentAt: {
          gte: start,
          lt: end
        }
      }
    })
  ]);

  return {
    dueToday,
    overdue,
    reminderSent
  };
}
