import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  getCustomerProjects,
  requireCustomer
} from "@/lib/auth/authorization";

export default async function CustomerPage() {
  const session = await requireCustomer();
  const projects = await getCustomerProjects(session.user.id);

  return (
    <section className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase text-accent">
          Customer access
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-primary">
          My project data
        </h1>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {projects.map((project) => (
          <Link key={project.id} href={`/customer/projects/${project.id}`}>
            <Card className="rounded-md transition hover:border-accent">
              <CardHeader>
                <CardTitle className="text-lg">{project.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Progress: {project.progress}%
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
        {projects.length === 0 ? (
          <Card className="rounded-md">
            <CardHeader>
              <CardTitle className="text-lg">No projects assigned</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Customer project access is scoped by the logged-in user.
              </p>
            </CardContent>
          </Card>
        ) : null}
      </div>
    </section>
  );
}
