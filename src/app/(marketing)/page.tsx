import { CompanyIntro } from "@/components/marketing/company-intro";
import { HeroSection } from "@/components/marketing/hero-section";
import { ProjectsSection } from "@/components/marketing/projects-section";
import { SiteVisitCta } from "@/components/marketing/site-visit-cta";
import { SpecializationSection } from "@/components/marketing/specialization-section";
import { StatsSection } from "@/components/marketing/stats-section";
import { TeamSection } from "@/components/marketing/team-section";
import { TestimonialsSection } from "@/components/marketing/testimonials-section";

export default function MarketingHomePage() {
  return (
    <main className="bg-background">
      <HeroSection />
      <CompanyIntro />
      <SpecializationSection />
      <TestimonialsSection />
      <ProjectsSection />
      <TeamSection />
      <StatsSection />
      <SiteVisitCta />
    </main>
  );
}
