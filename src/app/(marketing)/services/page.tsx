import { services } from "@/config/marketing";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SectionHeading } from "@/components/marketing/section-heading";
import { SiteVisitCta } from "@/components/marketing/site-visit-cta";

export default function ServicesPage() {
  return (
    <main>
      <section className="construction-grid bg-primary py-24 text-primary-foreground">
        <div className="container">
          <SectionHeading
            copy="Construction services for residential, commercial, civil, and renovation requirements."
            eyebrow="Services"
            inverse
            title="Complete construction delivery under one professional team."
          />
        </div>
      </section>
      <section className="bg-white py-20">
        <div className="container grid gap-4 md:grid-cols-2">
          {services.map((service) => {
            const Icon = service.icon;

            return (
              <Card key={service.slug} className="rounded-md">
                <CardHeader>
                  <Icon className="h-9 w-9 text-accent" aria-hidden="true" />
                  <CardTitle>{service.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="leading-7 text-muted-foreground">
                    {service.summary}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>
      <SiteVisitCta />
    </main>
  );
}
