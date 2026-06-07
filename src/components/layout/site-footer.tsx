import Link from "next/link";
import { Building2, Mail, MapPin, Phone } from "lucide-react";
import { routes } from "@/config/routes";
import { siteConfig } from "@/config/site";

export function SiteFooter() {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container grid gap-10 py-14 md:grid-cols-[1.2fr_0.8fr_1fr]">
        <div>
          <Link href={routes.home} className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-md bg-accent">
              <Building2 className="h-5 w-5" aria-hidden="true" />
            </span>
            <span className="font-semibold">{siteConfig.name}</span>
          </Link>
          <p className="mt-5 max-w-md text-sm leading-6 text-white/70">
            Corporate construction services for homes, buildings, civil
            contracting, and renovation projects.
          </p>
        </div>
        <nav className="grid gap-3 text-sm text-white/75">
          <Link href={routes.about}>About</Link>
          <Link href={routes.services}>Services</Link>
          <Link href={routes.projects}>Projects</Link>
          <Link href={routes.contact}>Contact</Link>
        </nav>
        <div className="grid gap-3 text-sm text-white/75">
          <p className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-accent" aria-hidden="true" />
            +91 98765 43210
          </p>
          <p className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-accent" aria-hidden="true" />
            ops@apexconstructions.example
          </p>
          <p className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-accent" aria-hidden="true" />
            MG Road, Bengaluru
          </p>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container flex flex-col gap-3 py-5 text-sm text-white/60 md:flex-row md:items-center md:justify-between">
          <p>{siteConfig.name}</p>
          <Link href={routes.signIn}>Client Login</Link>
        </div>
      </div>
    </footer>
  );
}
