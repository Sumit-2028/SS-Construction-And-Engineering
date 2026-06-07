import { redirect } from "next/navigation";
import { routes } from "@/config/routes";
import { requireAuth } from "@/lib/auth/authorization";

export default async function DashboardPage() {
  const session = await requireAuth();

  redirect(session.user.role === "ADMIN" ? routes.admin : routes.customer);
}
