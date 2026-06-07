"use client";

import { useActionState } from "react";
import { LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { loginAction, type LoginState } from "@/server/actions/auth-actions";

const initialState: LoginState = {
  ok: true,
  message: ""
};

export function SignInForm() {
  const [state, formAction, isPending] = useActionState(
    loginAction,
    initialState
  );

  return (
    <form action={formAction} className="mt-8 space-y-5">
      <div className="space-y-2">
        <label className="text-sm font-medium text-primary" htmlFor="email">
          Email
        </label>
        <input
          autoComplete="email"
          className="h-11 w-full rounded-md border bg-background px-3 text-sm outline-none ring-offset-background transition focus:ring-2 focus:ring-ring"
          id="email"
          name="email"
          required
          type="email"
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-primary" htmlFor="password">
          Password
        </label>
        <input
          autoComplete="current-password"
          className="h-11 w-full rounded-md border bg-background px-3 text-sm outline-none ring-offset-background transition focus:ring-2 focus:ring-ring"
          id="password"
          minLength={8}
          name="password"
          required
          type="password"
        />
      </div>
      {!state.ok ? (
        <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {state.message}
        </p>
      ) : null}
      <Button className="w-full" disabled={isPending} type="submit">
        <LogIn className="h-4 w-4" aria-hidden="true" />
        {isPending ? "Signing in" : "Login"}
      </Button>
    </form>
  );
}
