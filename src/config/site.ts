export const siteConfig = {
  name: "Construction Management Platform",
  shortName: "CMP",
  description:
    "Enterprise operating system for house construction, building construction, civil contracting, and renovation teams.",
  url: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  services: [
    "House Construction",
    "Building Construction",
    "Civil Contracting",
    "Renovation"
  ]
} as const;
