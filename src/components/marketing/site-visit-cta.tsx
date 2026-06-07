import Link from "next/link";
import { CalendarCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { routes } from "@/config/routes";

export function SiteVisitCta() {
  return (
    <section className="bg-accent py-14 text-accent-foreground">
      <div className="container flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase text-white/85">
            Request Site Visit
          </p>
          <h2 className="mt-2 text-3xl font-semibold">
            Start with a free site inspection and practical construction advice.
          </h2>
        </div>
        <Button asChild size="lg" variant="navy">
          <Link href={routes.contactSiteVisit}>
            <CalendarCheck className="h-4 w-4" aria-hidden="true" />
            Request Free Site Visit
          </Link>
        </Button>
      </div>
    </section>
  );
}
