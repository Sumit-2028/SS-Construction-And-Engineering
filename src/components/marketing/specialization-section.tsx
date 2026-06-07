import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { specializations } from "@/config/marketing";
import { SectionHeading } from "@/components/marketing/section-heading";

export function SpecializationSection() {
  return (
    <section className="bg-construction-concrete py-20">
      <div className="container">
        <SectionHeading
          copy="Focused capabilities for construction clients who need reliable site delivery and professional documentation."
          eyebrow="Specialization"
          title="Construction expertise for every stage of the build."
        />
        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {specializations.map((item) => {
            const Icon = item.icon;

            return (
              <Card key={item.title} className="rounded-md">
                <CardHeader>
                  <Icon className="h-8 w-8 text-accent" aria-hidden="true" />
                  <CardTitle className="text-xl">{item.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-6 text-muted-foreground">
                    {item.copy}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
