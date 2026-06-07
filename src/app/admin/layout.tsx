import Link from "next/link";
import {
  Building2,
  FileText,
  FolderKanban,
  HandCoins,
  MapPinned,
  MessageSquareQuote,
  Package,
  Users
} from "lucide-react";
import { LogoutButton } from "@/components/auth/logout-button";
import { requireAdmin } from "@/lib/auth/authorization";
import { routes } from "@/config/routes";

const adminNavigation = [
  { label: "Leads", href: "/admin/leads", icon: Users },
  { label: "Site Visits", href: "/admin/site-visits", icon: MapPinned },
  { label: "Projects", href: "/admin/projects", icon: FolderKanban },
  { label: "Payments", href: "/admin/payments", icon: HandCoins },
  { label: "Customers", href: "/admin/customers", icon: Users },
  { label: "Documents", href: "/admin/documents", icon: FileText },
  {
    label: "Testimonials",
    href: "/admin/testimonials",
    icon: MessageSquareQuote
  },
  { label: "Material Usage", href: "/admin/material-usage", icon: Package }
] as const;

export default async function AdminLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const session = await requireAdmin();

  return (
    <main className="min-h-screen bg-construction-concrete">
      <aside className="fixed inset-y-0 left-0 hidden w-72 border-r bg-primary text-primary-foreground lg:block">
        <Link
          href={routes.admin}
          className="flex h-16 items-center gap-3 border-b border-white/10 px-6"
        >
          <span className="grid h-10 w-10 place-items-center rounded-md bg-accent">
            <Building2 className="h-5 w-5" aria-hidden="true" />
          </span>
          <span className="font-semibold">Admin Console</span>
        </Link>
        <nav className="space-y-1 p-4">
          {adminNavigation.map((item) => {
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
          <div>
            <p className="text-xs font-semibold uppercase text-accent">ADMIN</p>
            <p className="text-sm font-semibold text-primary">
              {session.user.email}
            </p>
          </div>
          <LogoutButton />
        </header>
        <div className="p-6">{children}</div>
      </section>
    </main>
  );
}
