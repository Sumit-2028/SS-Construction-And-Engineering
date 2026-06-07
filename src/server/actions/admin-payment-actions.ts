"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getAdminOrganizationId } from "@/lib/admin/organization";
import { requireAdmin } from "@/lib/auth/authorization";
import { prisma } from "@/lib/db/prisma";
import { AppError } from "@/lib/errors/app-error";
import {
  calculateDueAmount,
  dateFromInput,
  resolvePaymentStatus
} from "@/lib/payments/service";
import { sendPaymentDueReminder } from "@/lib/reminders/service";

const paymentFormFields = z.object({
  projectId: z.string().min(1, "Project is required"),
  invoiceNumber: z.string().trim().max(80).optional(),
  title: z.string().trim().min(2).max(180),
  totalAmount: z.coerce.number().min(0),
  paidAmount: z.coerce.number().min(0),
  dueDate: z.string().optional()
});

const paymentFormSchema = paymentFormFields.refine(
  (data) => data.paidAmount <= data.totalAmount,
  {
    message: "Paid amount cannot exceed total amount",
    path: ["paidAmount"]
  }
);

const updatePaymentSchema = paymentFormFields
  .extend({
    paymentId: z.string().min(1)
  })
  .refine((data) => data.paidAmount <= data.totalAmount, {
    message: "Paid amount cannot exceed total amount",
    path: ["paidAmount"]
  });

const paymentIdSchema = z.object({
  paymentId: z.string().min(1)
});

function optionalText(value: FormDataEntryValue | null) {
  const text = value?.toString().trim();

  return text ? text : undefined;
}

async function getScopedProject({
  organizationId,
  projectId
}: {
  organizationId: string;
  projectId: string;
}) {
  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      organizationId
    },
    select: {
      id: true,
      customerId: true
    }
  });

  if (!project) {
    throw new AppError({
      code: "NOT_FOUND",
      message: "Project was not found.",
      statusCode: 404
    });
  }

  return project;
}

function paymentPaths(projectId?: string) {
  const paths = ["/admin", "/admin/payments", "/customer", "/customer/payments"];

  if (projectId) {
    paths.push(`/customer/projects/${projectId}`);
  }

  return paths;
}

export async function addPaymentAction(formData: FormData) {
  const session = await requireAdmin();
  const organizationId = await getAdminOrganizationId(session);
  const parsed = paymentFormSchema.parse({
    projectId: formData.get("projectId"),
    invoiceNumber: optionalText(formData.get("invoiceNumber")),
    title: formData.get("title"),
    totalAmount: formData.get("totalAmount"),
    paidAmount: formData.get("paidAmount"),
    dueDate: optionalText(formData.get("dueDate"))
  });
  const project = await getScopedProject({
    organizationId,
    projectId: parsed.projectId
  });
  const dueDate = dateFromInput(parsed.dueDate);
  const dueAmount = calculateDueAmount(parsed.totalAmount, parsed.paidAmount);

  await prisma.payment.create({
    data: {
      organizationId,
      customerId: project.customerId,
      projectId: project.id,
      invoiceNumber: parsed.invoiceNumber,
      title: parsed.title,
      totalAmount: parsed.totalAmount.toString(),
      paidAmount: parsed.paidAmount.toString(),
      dueAmount: dueAmount.toString(),
      dueDate,
      status: resolvePaymentStatus({
        dueDate,
        paidAmount: parsed.paidAmount,
        totalAmount: parsed.totalAmount
      })
    }
  });

  paymentPaths(project.id).forEach((path) => revalidatePath(path));
}

export async function updatePaymentAction(formData: FormData) {
  const session = await requireAdmin();
  const organizationId = await getAdminOrganizationId(session);
  const parsed = updatePaymentSchema.parse({
    paymentId: formData.get("paymentId"),
    projectId: formData.get("projectId"),
    invoiceNumber: optionalText(formData.get("invoiceNumber")),
    title: formData.get("title"),
    totalAmount: formData.get("totalAmount"),
    paidAmount: formData.get("paidAmount"),
    dueDate: optionalText(formData.get("dueDate"))
  });
  const [payment, project] = await Promise.all([
    prisma.payment.findFirst({
      where: {
        id: parsed.paymentId,
        organizationId
      },
      select: {
        id: true,
        projectId: true
      }
    }),
    getScopedProject({
      organizationId,
      projectId: parsed.projectId
    })
  ]);

  if (!payment) {
    throw new AppError({
      code: "NOT_FOUND",
      message: "Payment was not found.",
      statusCode: 404
    });
  }

  const dueDate = dateFromInput(parsed.dueDate);
  const dueAmount = calculateDueAmount(parsed.totalAmount, parsed.paidAmount);

  await prisma.payment.update({
    where: { id: payment.id },
    data: {
      customerId: project.customerId,
      projectId: project.id,
      invoiceNumber: parsed.invoiceNumber,
      title: parsed.title,
      totalAmount: parsed.totalAmount.toString(),
      paidAmount: parsed.paidAmount.toString(),
      dueAmount: dueAmount.toString(),
      dueDate,
      status: resolvePaymentStatus({
        dueDate,
        paidAmount: parsed.paidAmount,
        totalAmount: parsed.totalAmount
      })
    }
  });

  paymentPaths(payment.projectId).forEach((path) => revalidatePath(path));
  paymentPaths(project.id).forEach((path) => revalidatePath(path));
}

export async function deletePaymentAction(formData: FormData) {
  const session = await requireAdmin();
  const organizationId = await getAdminOrganizationId(session);
  const parsed = paymentIdSchema.parse({
    paymentId: formData.get("paymentId")
  });
  const payment = await prisma.payment.findFirst({
    where: {
      id: parsed.paymentId,
      organizationId
    },
    select: {
      id: true,
      projectId: true
    }
  });

  if (!payment) {
    throw new AppError({
      code: "NOT_FOUND",
      message: "Payment was not found.",
      statusCode: 404
    });
  }

  await prisma.payment.delete({
    where: { id: payment.id }
  });

  paymentPaths(payment.projectId).forEach((path) => revalidatePath(path));
}

export async function sendWhatsAppReminderAction(formData: FormData) {
  const session = await requireAdmin();
  const organizationId = await getAdminOrganizationId(session);
  const parsed = paymentIdSchema.parse({
    paymentId: formData.get("paymentId")
  });
  const reminder = await sendPaymentDueReminder({
    organizationId,
    paymentId: parsed.paymentId,
    sentById: session.user.id,
    trigger: "MANUAL"
  });

  revalidatePath("/admin");
  revalidatePath("/admin/payments");
  revalidatePath("/customer");
  revalidatePath("/customer/payments");

  return reminder;
}
