import Link from "next/link";
import { Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site";
import { routes } from "@/config/routes";

const navigation = [
  { label: "Home", href: routes.home },
  { label: "About", href: routes.about },
  { label: "Services", href: routes.services },
  { label: "Projects", href: routes.projects },
  { label: "Contact", href: routes.contact }
] as const;

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-primary text-primary-foreground">
      <div className="container flex h-16 items-center justify-between">
        <Link href={routes.home} className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-md bg-accent">
            <Building2 className="h-5 w-5" aria-hidden="true" />
          </span>
          <span className="text-sm font-semibold sm:text-base">
            {siteConfig.shortName}
          </span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium text-white/80 md:flex">
          {navigation.map((item) => (
            <Link key={item.href} href={item.href} className="hover:text-white">
              {item.label}
            </Link>
          ))}
        </nav>

        <Button asChild size="sm">
          <Link href={routes.contactSiteVisit}>Free Site Visit</Link>
        </Button>
      </div>
    </header>
  );
}
