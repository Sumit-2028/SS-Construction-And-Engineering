export const routes = {
  home: "/",
  about: "/about",
  services: "/services",
  projects: "/projects",
  contact: "/contact",
  contactSiteVisit: "/contact#site-visit",
  signIn: "/sign-in",
  admin: "/admin",
  customer: "/customer",
  dashboard: "/dashboard",
  api: {
    auth: "/api/auth",
    health: "/api/health"
  }
} as const;

export const protectedRoutePrefixes = [
  routes.admin,
  routes.customer,
  routes.dashboard
] as const;
