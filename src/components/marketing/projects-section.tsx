import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { projects } from "@/config/marketing";
import { routes } from "@/config/routes";
import { SectionHeading } from "@/components/marketing/section-heading";

export function ProjectsSection({ showButton = true }: { showButton?: boolean }) {
  return (
    <section id="projects" className="bg-construction-concrete py-20">
      <div className="container">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <SectionHeading
            copy="A snapshot of residential, commercial, civil, and renovation work delivered with structured site management."
            eyebrow="Recent Projects"
            title="Project showcase built on strong execution standards."
          />
          {showButton ? (
            <Button asChild variant="navy">
              <Link href={routes.projects}>
                View Projects
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
          ) : null}
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {projects.map((project) => (
            <article
              key={project.title}
              className="overflow-hidden border bg-white shadow-sm"
            >
              <div className="relative h-44 bg-primary">
                <Image
                  alt={`${project.title} construction project`}
                  className="object-cover opacity-80"
                  fill
                  src="/images/construction-hero.png"
                />
              </div>
              <div className="p-5">
                <p className="text-xs font-semibold uppercase text-accent">
                  {project.type}
                </p>
                <h3 className="mt-2 text-xl font-semibold text-primary">
                  {project.title}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {project.location}
                </p>
                <div className="mt-5 flex items-center justify-between text-sm">
                  <span className="font-semibold text-primary">
                    {project.metric}
                  </span>
                  <span className="text-muted-foreground">{project.status}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
