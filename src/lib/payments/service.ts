import type { PaymentStatus } from "@prisma/client";

export function toMoneyNumber(value: unknown) {
  if (value === null || value === undefined || value === "") {
    return 0;
  }

  return Number(value);
}

export function calculateDueAmount(totalAmount: unknown, paidAmount: unknown) {
  return Math.max(toMoneyNumber(totalAmount) - toMoneyNumber(paidAmount), 0);
}

export function resolvePaymentStatus({
  dueDate,
  paidAmount,
  totalAmount
}: {
  dueDate?: Date | null;
  paidAmount: unknown;
  totalAmount: unknown;
}): PaymentStatus {
  const paid = toMoneyNumber(paidAmount);
  const total = toMoneyNumber(totalAmount);
  const due = calculateDueAmount(total, paid);

  if (total > 0 && due <= 0) {
    return "PAID";
  }

  if (dueDate && due > 0) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const normalizedDueDate = new Date(dueDate);
    normalizedDueDate.setHours(0, 0, 0, 0);

    if (normalizedDueDate < today) {
      return "OVERDUE";
    }
  }

  if (paid > 0) {
    return "PARTIALLY_PAID";
  }

  return "PENDING";
}

export function dateFromInput(value?: string | null) {
  if (!value) {
    return null;
  }

  return new Date(`${value}T00:00:00.000Z`);
}

export function dateInputValue(value: Date | null | undefined) {
  if (!value) {
    return "";
  }

  return value.toISOString().slice(0, 10);
}
