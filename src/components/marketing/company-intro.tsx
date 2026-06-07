import Image from "next/image";
import { CheckCircle2 } from "lucide-react";
import { SectionHeading } from "@/components/marketing/section-heading";

const points = [
  "Turnkey execution from first site visit to final handover",
  "Dedicated engineering supervision and quality checkpoints",
  "Clear estimates, project updates, payment schedules, and documents"
] as const;

export function CompanyIntro() {
  return (
    <section className="bg-white py-20">
      <div className="container grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
        <div className="relative min-h-96 overflow-hidden border bg-primary">
          <Image
            alt="Construction team reviewing drawings at a modern site"
            className="h-full w-full object-cover opacity-80"
            fill
            src="/images/construction-hero.png"
          />
        </div>
        <div>
          <SectionHeading
            copy="We combine construction craftsmanship with disciplined project management for homes, buildings, civil works, and renovation projects."
            eyebrow="Company Introduction"
            title="A construction partner built around clarity, quality, and accountability."
          />
          <div className="mt-8 grid gap-4">
            {points.map((point) => (
              <div key={point} className="flex gap-3">
                <CheckCircle2
                  className="mt-1 h-5 w-5 shrink-0 text-accent"
                  aria-hidden="true"
                />
                <p className="leading-7 text-muted-foreground">{point}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
