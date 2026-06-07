"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { sendWhatsAppReminderAction } from "@/server/actions/admin-payment-actions";

type PaymentReminderButtonProps = {
  disabled?: boolean;
  paymentId: string;
  whatsappUrl: string;
};

export function PaymentReminderButton({
  disabled,
  paymentId,
  whatsappUrl
}: PaymentReminderButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function sendReminder() {
    setError(null);
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");

    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.set("paymentId", paymentId);
        await sendWhatsAppReminderAction(formData);
        router.refresh();
      } catch {
        setError("Reminder history could not be recorded.");
      }
    });
  }

  return (
    <div className="space-y-1">
      <Button
        disabled={disabled || isPending}
        onClick={sendReminder}
        size="sm"
        type="button"
        variant="outline"
      >
        <Send className="h-4 w-4" aria-hidden="true" />
        {isPending ? "Recording..." : "Send WhatsApp Reminder"}
      </Button>
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}
