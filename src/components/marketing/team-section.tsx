import { HardHat } from "lucide-react";
import { team } from "@/config/marketing";
import { SectionHeading } from "@/components/marketing/section-heading";

export function TeamSection() {
  return (
    <section className="bg-white py-20">
      <div className="container">
        <SectionHeading
          eyebrow="Team"
          title="Experienced construction professionals on every project."
        />
        <div className="mt-10 grid gap-4 md:grid-cols-4">
          {team.map((member) => (
            <article key={member.name} className="border bg-white p-6 shadow-sm">
              <div className="grid h-14 w-14 place-items-center rounded-md bg-accent text-accent-foreground">
                <HardHat className="h-7 w-7" aria-hidden="true" />
              </div>
              <h3 className="mt-5 text-xl font-semibold text-primary">
                {member.name}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">{member.role}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
