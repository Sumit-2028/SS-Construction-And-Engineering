"use server";

import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { signIn, signOut } from "@/auth";
import { routes } from "@/config/routes";

export type LoginState = {
  ok: boolean;
  message: string;
};

export async function loginAction(
  _previousState: LoginState,
  formData: FormData
): Promise<LoginState> {
  try {
    await signIn("credentials", {
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? ""),
      redirectTo: routes.dashboard
    });
  } catch (error) {
    if (error instanceof AuthError) {
      if (error.type !== "CredentialsSignin") {
        return {
          ok: false,
          message:
            "Authentication is not configured. Check AUTH_SECRET and DATABASE_URL."
        };
      }

      return {
        ok: false,
        message: "Invalid email or password"
      };
    }

    throw error;
  }

  redirect(routes.dashboard);
}

export async function logoutAction() {
  await signOut({
    redirectTo: routes.signIn
  });
}
