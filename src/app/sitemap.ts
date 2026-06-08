import { siteConfig } from "@/config/site";

export default function sitemap() {
  const baseUrl = siteConfig.url.replace(/\/$/, "");

  const staticPages = [
    {
      url: `${baseUrl}/`,
      lastModified: new Date().toISOString(),
    },
    { url: `${baseUrl}/about`, lastModified: new Date().toISOString() },
    { url: `${baseUrl}/contact`, lastModified: new Date().toISOString() },
    { url: `${baseUrl}/projects`, lastModified: new Date().toISOString() },
    { url: `${baseUrl}/services`, lastModified: new Date().toISOString() },
  ];

  // If you have dynamic routes (projects, blog), generate and append them here.

  return staticPages.map((p) => ({ url: p.url, lastModified: p.lastModified }));
}
