import { ProjectsSection } from "@/components/marketing/projects-section";
import { SectionHeading } from "@/components/marketing/section-heading";
import { SiteVisitCta } from "@/components/marketing/site-visit-cta";

export default function ProjectsPage() {
  return (
    <main>
      <section className="construction-grid bg-primary py-24 text-primary-foreground">
        <div className="container">
          <SectionHeading
            copy="Explore recent work across house construction, commercial buildings, civil contracts, and renovation."
            eyebrow="Projects"
            inverse
            title="Recent construction work shaped by strong foundations."
          />
        </div>
      </section>
      <ProjectsSection showButton={false} />
      <SiteVisitCta />
    </main>
  );
}
