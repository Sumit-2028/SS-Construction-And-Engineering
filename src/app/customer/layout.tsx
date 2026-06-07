import Link from "next/link";
import { Building2, FolderKanban, HandCoins, LayoutDashboard } from "lucide-react";
import { LogoutButton } from "@/components/auth/logout-button";
import { requireCustomer } from "@/lib/auth/authorization";
import { routes } from "@/config/routes";

const customerNavigation = [
  { label: "Dashboard", href: routes.customer, icon: LayoutDashboard },
  { label: "Projects", href: "/customer/projects", icon: FolderKanban },
  { label: "Payments", href: "/customer/payments", icon: HandCoins }
] as const;

export default async function CustomerLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const session = await requireCustomer();

  return (
    <main className="min-h-screen bg-construction-concrete">
      <aside className="fixed inset-y-0 left-0 hidden w-72 border-r bg-primary text-primary-foreground lg:block">
        <Link
          href={routes.customer}
          className="flex h-16 items-center gap-3 border-b border-white/10 px-6"
        >
          <span className="grid h-10 w-10 place-items-center rounded-md bg-accent">
            <Building2 className="h-5 w-5" aria-hidden="true" />
          </span>
          <span className="font-semibold">Customer Portal</span>
        </Link>
        <nav className="space-y-1 p-4">
          {customerNavigation.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-white/80 hover:bg-white/10 hover:text-white"
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
      <section className="lg:pl-72">
        <header className="flex h-16 items-center justify-between border-b bg-white px-6">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase text-accent">
              CUSTOMER
            </p>
            <p className="truncate text-sm font-semibold text-primary">
              {session.user.email}
            </p>
          </div>
          <LogoutButton />
        </header>
        <nav className="grid grid-cols-3 gap-2 border-b bg-white px-4 py-3 lg:hidden">
          {customerNavigation.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center justify-center gap-2 rounded-md border px-3 py-2 text-xs font-semibold text-primary"
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-6">{children}</div>
      </section>
    </main>
  );
}
