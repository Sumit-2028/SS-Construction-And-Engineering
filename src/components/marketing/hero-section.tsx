import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CalendarCheck, HardHat } from "lucide-react";
import { Button } from "@/components/ui/button";
import { routes } from "@/config/routes";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-primary text-primary-foreground">
      <Image
        alt="Modern construction site with engineers and building structure"
        className="absolute inset-0 h-full w-full object-cover opacity-45"
        fill
        priority
        src="/images/construction-hero.png"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/88 to-primary/35" />
      <div className="construction-grid absolute inset-0" />
      <div className="container relative grid min-h-[calc(100vh-4rem)] items-center gap-12 py-20 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 border-l-4 border-accent bg-white/10 px-4 py-2 text-sm font-semibold uppercase text-white/90">
            <HardHat className="h-4 w-4" aria-hidden="true" />
            House, building, civil and renovation experts
          </div>
          <h1 className="mt-8 text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
            Building Dreams. Creating Strong Foundations.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-white/78">
            Premium construction planning, site execution, project supervision,
            and transparent handover for residential, commercial, and civil
            works.
          </p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href={routes.contactSiteVisit}>
                <CalendarCheck className="h-4 w-4" aria-hidden="true" />
                Request Free Site Visit
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white"
            >
              <Link href={routes.projects}>
                View Projects
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
