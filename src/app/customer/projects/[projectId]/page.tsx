import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  assertCustomerOwnsProject,
  requireCustomer
} from "@/lib/auth/authorization";
import { prisma } from "@/lib/db/prisma";

export default async function CustomerProjectPage({
  params
}: {
  params: Promise<{ projectId: string }>;
}) {
  const session = await requireCustomer();
  const { projectId } = await params;

  await assertCustomerOwnsProject({
    userId: session.user.id,
    projectId
  });

  const project = await prisma.project.findUniqueOrThrow({
    where: { id: projectId },
    include: {
      updates: {
        where: { visibility: "CUSTOMER" },
        orderBy: { updateDate: "desc" }
      },
      payments: {
        orderBy: { dueDate: "asc" }
      },
      documents: {
        where: {
          type: {
            in: ["QUOTATION", "AGREEMENT", "BLUEPRINT", "INVOICE"]
          }
        },
        orderBy: { createdAt: "desc" }
      }
    }
  });

  return (
    <section className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase text-accent">
          Customer project
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-primary">
          {project.name}
        </h1>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="rounded-md">
          <CardHeader>
            <CardTitle className="text-lg">Progress</CardTitle>
          </CardHeader>
          <CardContent>{project.progress}%</CardContent>
        </Card>
        <Card className="rounded-md">
          <CardHeader>
            <CardTitle className="text-lg">Updates</CardTitle>
          </CardHeader>
          <CardContent>{project.updates.length}</CardContent>
        </Card>
        <Card className="rounded-md">
          <CardHeader>
            <CardTitle className="text-lg">Documents</CardTitle>
          </CardHeader>
          <CardContent>{project.documents.length}</CardContent>
        </Card>
      </div>
    </section>
  );
}
