import { CompanyIntro } from "@/components/marketing/company-intro";
import { SectionHeading } from "@/components/marketing/section-heading";
import { SiteVisitCta } from "@/components/marketing/site-visit-cta";
import { StatsSection } from "@/components/marketing/stats-section";
import { TeamSection } from "@/components/marketing/team-section";

export default function AboutPage() {
  return (
    <main>
      <section className="construction-grid bg-primary py-24 text-primary-foreground">
        <div className="container">
          <SectionHeading
            copy="We are a corporate construction company focused on clear process, strong engineering controls, and dependable site execution."
            eyebrow="About Us"
            inverse
            title="Building with discipline, transparency, and long-term strength."
          />
        </div>
      </section>
      <CompanyIntro />
      <StatsSection />
      <TeamSection />
      <SiteVisitCta />
    </main>
  );
}
