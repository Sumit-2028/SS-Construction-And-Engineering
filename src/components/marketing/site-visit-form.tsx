"use client";

import { useActionState } from "react";
import { CalendarCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  requestSiteVisitAction,
  type PublicFormState
} from "@/server/actions/public-actions";
import { services } from "@/config/marketing";

const initialState: PublicFormState = {
  ok: true,
  message: ""
};

const inputClass =
  "h-11 w-full rounded-md border bg-white px-3 text-sm outline-none ring-offset-background transition focus:ring-2 focus:ring-ring";
const textareaClass =
  "min-h-28 w-full rounded-md border bg-white px-3 py-3 text-sm outline-none ring-offset-background transition focus:ring-2 focus:ring-ring";

export function SiteVisitForm() {
  const [state, formAction, isPending] = useActionState(
    requestSiteVisitAction,
    initialState
  );

  return (
    <form action={formAction} className="grid gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <input className={inputClass} name="name" placeholder="Name" required />
        <input
          className={inputClass}
          name="phone"
          placeholder="Phone"
          required
          type="tel"
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <input
          className={inputClass}
          name="email"
          placeholder="Email"
          type="email"
        />
        <input
          className={inputClass}
          name="location"
          placeholder="Location"
          required
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <input
          className={inputClass}
          min="1"
          name="plotSize"
          placeholder="Plot Size"
          type="number"
        />
        <select className={inputClass} name="projectType" required>
          {services.map((service) => (
            <option key={service.type} value={service.type}>
              {service.title}
            </option>
          ))}
        </select>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <input
          className={inputClass}
          name="preferredVisitDate"
          required
          type="date"
        />
        <input
          className={inputClass}
          name="preferredVisitTime"
          required
          type="time"
        />
      </div>
      <input
        className={inputClass}
        min="1"
        name="budget"
        placeholder="Budget"
        type="number"
      />
      <textarea
        className={textareaClass}
        name="requirements"
        placeholder="Requirements"
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
        <CalendarCheck className="h-4 w-4" aria-hidden="true" />
        {isPending ? "Submitting" : "Request Free Site Visit"}
      </Button>
    </form>
  );
}
