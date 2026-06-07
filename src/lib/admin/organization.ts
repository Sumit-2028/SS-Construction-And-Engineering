import "server-only";
import { requireAdmin } from "@/lib/auth/authorization";
import { prisma } from "@/lib/db/prisma";

type AdminSession = Awaited<ReturnType<typeof requireAdmin>>;

export async function getAdminOrganizationId(session?: AdminSession) {
  const adminSession = session ?? (await requireAdmin());

  if (adminSession.user.organizationId) {
    return adminSession.user.organizationId;
  }

  const membership = await prisma.membership.findFirst({
    where: {
      userId: adminSession.user.id,
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
