import type { NextAuthConfig } from "next-auth";
import { protectedRoutePrefixes, routes } from "@/config/routes";

type AuthUserMetadata = {
  role?: "ADMIN" | "CUSTOMER";
  organizationId?: string;
  customerId?: string;
};

const adminRoutes = [routes.admin] as const;
const customerRoutes = [routes.customer] as const;

function isRouteMatch(pathname: string, prefixes: readonly string[]) {
  return prefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

export const authConfig = {
  trustHost: true,
  pages: {
    signIn: routes.signIn
  },
  providers: [],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = Boolean(auth?.user);
      const isProtectedRoute = isRouteMatch(nextUrl.pathname, protectedRoutePrefixes);

      if (isProtectedRoute) {
        if (!isLoggedIn) {
          return false;
        }

        if (
          isRouteMatch(nextUrl.pathname, adminRoutes) &&
          auth?.user.role !== "ADMIN"
        ) {
          return Response.redirect(new URL(routes.customer, nextUrl));
        }

        if (
          isRouteMatch(nextUrl.pathname, customerRoutes) &&
          auth?.user.role !== "CUSTOMER"
        ) {
          return Response.redirect(new URL(routes.admin, nextUrl));
        }

        return true;
      }

      if (isLoggedIn && nextUrl.pathname === routes.signIn) {
        const roleHome =
          auth?.user.role === "ADMIN" ? routes.admin : routes.customer;

        return Response.redirect(new URL(roleHome, nextUrl));
      }

      return true;
    },
    jwt({ token, user }) {
      if (user) {
        const metadata = user as AuthUserMetadata;

        token.id = user.id as string;
        token.role = metadata.role;
        token.organizationId = metadata.organizationId;
        token.customerId = metadata.customerId;
      }

      return token;
    },
    session({ session, token }) {
      const tokenId = typeof token.id === "string" ? token.id : undefined;
      const tokenMetadata = token as AuthUserMetadata;

      if (session.user && tokenId && tokenMetadata.role) {
        session.user.id = tokenId;
        session.user.role = tokenMetadata.role;
        session.user.organizationId = tokenMetadata.organizationId;
        session.user.customerId = tokenMetadata.customerId;
      }

      return session;
    }
  }
} satisfies NextAuthConfig;
