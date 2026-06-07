import Link from "next/link";
import { MessageCircle, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ContactForm } from "@/components/marketing/contact-form";
import { SectionHeading } from "@/components/marketing/section-heading";
import { SiteVisitForm } from "@/components/marketing/site-visit-form";

export default function ContactPage() {
  return (
    <main>
      <section className="construction-grid bg-primary py-24 text-primary-foreground">
        <div className="container">
          <SectionHeading
            copy="Talk to our team about your construction requirement or book a free site visit."
            eyebrow="Contact"
            inverse
            title="Let us inspect your site and plan the next step."
          />
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="container grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="border bg-construction-concrete p-6">
            <SectionHeading
              copy="Share your details and our construction team will get back to you."
              eyebrow="Contact Form"
              title="Send your project enquiry."
            />
            <div className="mt-8">
              <ContactForm />
            </div>
          </div>
          <div className="grid gap-6">
            <div className="overflow-hidden border bg-white">
              <iframe
                className="h-80 w-full"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                src="https://www.google.com/maps?q=MG%20Road%20Bengaluru&output=embed"
                title="Google Maps location"
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Button asChild size="lg" variant="navy">
                <a href="tel:+919876543210">
                  <Phone className="h-4 w-4" aria-hidden="true" />
                  Call Now
                </a>
              </Button>
              <Button asChild size="lg">
                <Link
                  href="https://wa.me/919876543210?text=I%20want%20to%20request%20a%20construction%20site%20visit"
                  target="_blank"
                >
                  <MessageCircle className="h-4 w-4" aria-hidden="true" />
                  WhatsApp
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section id="site-visit" className="bg-construction-concrete py-20">
        <div className="container grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <SectionHeading
            copy="Fill out the details below and we will schedule a site visit with our team."
            eyebrow="Request Site Visit CTA"
            title="Book a free site visit."
          />
          <div className="border bg-white p-6 shadow-sm">
            <SiteVisitForm />
          </div>
        </div>
      </section>
    </main>
  );
}
