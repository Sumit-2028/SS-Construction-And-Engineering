import Link from "next/link";
import { Building2 } from "lucide-react";
import { SignInForm } from "@/components/auth/sign-in-form";
import { routes } from "@/config/routes";

export default function SignInPage() {
  return (
    <main className="grid min-h-screen bg-primary text-primary-foreground lg:grid-cols-[0.95fr_1.05fr]">
      <section className="construction-grid flex flex-col justify-between p-8 lg:p-12">
        <Link href={routes.home} className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-md bg-accent">
            <Building2 className="h-5 w-5" aria-hidden="true" />
          </span>
          <span className="font-semibold">CMP</span>
        </Link>
        <div className="max-w-xl py-16">
          <p className="text-sm font-semibold uppercase text-accent">
            Secure access
          </p>
          <h1 className="mt-4 text-4xl font-bold leading-tight">
            Operations workspace for construction delivery teams.
          </h1>
          <p className="mt-5 text-lg leading-8 text-white/75">
            Role-aware access will support owners, project managers, site
            engineers, accounting teams, and clients.
          </p>
        </div>
      </section>

      <section className="flex items-center justify-center bg-background px-6 py-16 text-foreground">
        <div className="w-full max-w-md border bg-white p-8 shadow-corporate">
          <p className="text-sm font-semibold uppercase text-accent">
            Authentication boundary
          </p>
          <h2 className="mt-3 text-2xl font-semibold text-primary">
            Identity provider pending
          </h2>
          <p className="mt-4 text-sm leading-6 text-muted-foreground">
            Use your admin or customer credentials to access the protected
            workspace.
          </p>
          <SignInForm />
          <Link
            className="mt-5 block text-center text-sm font-medium text-accent"
            href={routes.home}
          >
            Return to platform
          </Link>
        </div>
      </section>
    </main>
  );
}
