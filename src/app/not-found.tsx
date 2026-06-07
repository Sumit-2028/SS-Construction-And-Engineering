import Link from "next/link";
import { routes } from "@/config/routes";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center bg-background px-6 py-16">
      <section className="max-w-md text-center">
        <p className="text-sm font-semibold uppercase text-accent">404</p>
        <h1 className="mt-3 text-3xl font-semibold text-primary">
          Page not found
        </h1>
        <p className="mt-4 text-muted-foreground">
          The requested workspace area does not exist in this platform.
        </p>
        <Button asChild className="mt-8">
          <Link href={routes.home}>Return home</Link>
        </Button>
      </section>
    </main>
  );
}
