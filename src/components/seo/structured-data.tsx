import React from "react";
import { siteConfig } from "@/config/site";

export default function StructuredData(): React.ReactElement {
  const ld = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.description,
    logo: `${siteConfig.url}/images/logo.png`,
    sameAs: [] as string[],
    contactPoint: [
      {
        "@type": "ContactPoint",
        telephone: "+1-000-000-0000",
        contactType: "customer service",
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }}
      key="structured-data"
    />
  );
}
