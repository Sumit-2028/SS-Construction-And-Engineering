import { stats } from "@/config/marketing";

export function StatsSection() {
  return (
    <section className="bg-primary py-16 text-primary-foreground">
      <div className="container grid gap-6 md:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="border-l-4 border-accent pl-5">
            <p className="text-4xl font-bold">{stat.value}</p>
            <p className="mt-2 text-sm font-medium uppercase text-white/70">
              {stat.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
