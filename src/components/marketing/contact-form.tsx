"use client";

import { useActionState } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  contactAction,
  type PublicFormState
} from "@/server/actions/public-actions";

const initialState: PublicFormState = {
  ok: true,
  message: ""
};

const inputClass =
  "h-11 w-full rounded-md border bg-white px-3 text-sm outline-none ring-offset-background transition focus:ring-2 focus:ring-ring";
const textareaClass =
  "min-h-32 w-full rounded-md border bg-white px-3 py-3 text-sm outline-none ring-offset-background transition focus:ring-2 focus:ring-ring";

export function ContactForm() {
  const [state, formAction, isPending] = useActionState(
    contactAction,
    initialState
  );

  return (
    <form action={formAction} className="grid gap-4">
      <input className={inputClass} name="name" placeholder="Name" required />
      <div className="grid gap-4 sm:grid-cols-2">
        <input
          className={inputClass}
          name="phone"
          placeholder="Phone"
          required
          type="tel"
        />
        <input
          className={inputClass}
          name="email"
          placeholder="Email"
          type="email"
        />
      </div>
      <input
        className={inputClass}
        name="location"
        placeholder="Location"
        required
      />
      <textarea
        className={textareaClass}
        name="message"
        placeholder="Tell us about your project"
        required
      />
      {state.message ? (
        <p
          className={
            state.ok
              ? "rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700"
              : "rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
          }
        >
          {state.message}
        </p>
      ) : null}
      <Button disabled={isPending} size="lg" type="submit">
        <Send className="h-4 w-4" aria-hidden="true" />
        {isPending ? "Sending" : "Send Message"}
      </Button>
    </form>
  );
}
