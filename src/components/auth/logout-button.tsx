import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { logoutAction } from "@/server/actions/auth-actions";

export function LogoutButton() {
  return (
    <form action={logoutAction}>
      <Button size="sm" type="submit" variant="outline">
        <LogOut className="h-4 w-4" aria-hidden="true" />
        Logout
      </Button>
    </form>
  );
}
