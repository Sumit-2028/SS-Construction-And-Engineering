import { cn } from "@/lib/utils";

export function SectionHeading({
  eyebrow,
  title,
  copy,
  className,
  inverse = false
}: {
  eyebrow: string;
  title: string;
  copy?: string;
  className?: string;
  inverse?: boolean;
}) {
  return (
    <div className={cn("max-w-3xl", className)}>
      <p className="text-sm font-semibold uppercase tracking-wide text-accent">
        {eyebrow}
      </p>
      <h2
        className={cn(
          "mt-3 text-3xl font-semibold leading-tight sm:text-4xl",
          inverse ? "text-white" : "text-primary"
        )}
      >
        {title}
      </h2>
      {copy ? (
        <p
          className={cn(
            "mt-4 text-base leading-7",
            inverse ? "text-white/75" : "text-muted-foreground"
          )}
        >
          {copy}
        </p>
      ) : null}
    </div>
  );
}
