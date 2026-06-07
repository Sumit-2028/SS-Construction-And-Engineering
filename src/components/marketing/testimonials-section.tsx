import { Quote } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { testimonials } from "@/config/marketing";
import { SectionHeading } from "@/components/marketing/section-heading";

export function TestimonialsSection() {
  return (
    <section className="bg-white py-20">
      <div className="container">
        <SectionHeading
          eyebrow="Testimonials"
          title="Clients trust our teams on site and in the details."
        />
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.name} className="rounded-md">
              <CardContent className="p-6">
                <Quote className="h-8 w-8 text-accent" aria-hidden="true" />
                <p className="mt-5 leading-7 text-muted-foreground">
                  {testimonial.quote}
                </p>
                <div className="mt-6 border-l-4 border-accent pl-4">
                  <p className="font-semibold text-primary">
                    {testimonial.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {testimonial.role}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
