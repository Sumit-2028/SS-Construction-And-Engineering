import Link from "next/link";
import { redirect } from "next/navigation";
import { Building2, LayoutDashboard } from "lucide-react";
import { auth } from "@/auth";
import { routes } from "@/config/routes";

export default async function DashboardLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect(routes.signIn);
  }

  return (
    <main className="min-h-screen bg-construction-concrete">
      <aside className="fixed inset-y-0 left-0 hidden w-72 border-r bg-primary text-primary-foreground lg:block">
        <div className="flex h-16 items-center gap-3 border-b border-white/10 px-6">
          <span className="grid h-10 w-10 place-items-center rounded-md bg-accent">
            <Building2 className="h-5 w-5" aria-hidden="true" />
          </span>
          <span className="font-semibold">CMP Workspace</span>
        </div>
        <nav className="p-4">
          <Link
            href={routes.dashboard}
            className="flex items-center gap-3 rounded-md bg-white/10 px-3 py-2 text-sm font-medium"
          >
            <LayoutDashboard className="h-4 w-4" aria-hidden="true" />
            Dashboard
          </Link>
        </nav>
      </aside>
      <section className="lg:pl-72">
        <header className="flex h-16 items-center justify-between border-b bg-white px-6">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Signed in as
            </p>
            <p className="text-sm font-semibold text-primary">
              {session.user.email ?? session.user.name ?? "Team member"}
            </p>
          </div>
        </header>
        <div className="p-6">{children}</div>
      </section>
    </main>
  );
}
