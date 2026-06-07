"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function AppError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="grid min-h-screen place-items-center bg-background px-6 py-16">
      <section className="max-w-md text-center">
        <p className="text-sm font-semibold uppercase text-accent">
          Application error
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-primary">
          Something needs attention
        </h1>
        <p className="mt-4 text-muted-foreground">
          The request could not be completed. Try again after a moment.
        </p>
        <Button className="mt-8" onClick={reset}>
          Try again
        </Button>
      </section>
    </main>
  );
}
