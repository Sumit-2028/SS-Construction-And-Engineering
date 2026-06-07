import "server-only";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { routes } from "@/config/routes";
import { prisma } from "@/lib/db/prisma";
import { AppError } from "@/lib/errors/app-error";
import type { AppRole } from "@/lib/auth/permissions";

export async function getCurrentSession() {
  return auth();
}

export async function requireAuth() {
  const session = await getCurrentSession();

  if (!session?.user) {
    redirect(routes.signIn);
  }

  return session;
}

export async function requireRole(role: AppRole) {
  const session = await requireAuth();

  if (session.user.role !== role) {
    redirect(session.user.role === "ADMIN" ? routes.admin : routes.customer);
  }

  return session;
}

export function requireAdmin() {
  return requireRole("ADMIN");
}

export function requireCustomer() {
  return requireRole("CUSTOMER");
}

export async function assertCustomerOwnsProject({
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
    select: {
      id: true,
      customerId: true,
      organizationId: true
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

export async function getCustomerProjects(userId: string) {
  return prisma.project.findMany({
    where: {
      customer: {
        userId
      }
    },
    orderBy: {
      updatedAt: "desc"
    }
  });
}
