import "server-only";
import { Resend } from "resend";
import { env } from "@/config/env";
import { AppError } from "@/lib/errors/app-error";

export const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

export const emailConfig = {
  from: env.EMAIL_FROM ?? "Construction Platform <noreply@example.com>",
};

export async function sendEmail({
  to,
  subject,
  html,
  text,
}: {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
}) {
  // If Resend is not configured, silently skip sending emails and log a warning.
  // This makes the app safe to run without an email provider (for local/dev).
  if (!resend) {
    // Validate basic content shape for developer feedback
    if (!html && !text) {
      console.warn(
        "sendEmail called without content and no email provider configured.",
      );
      return { ok: false, simulated: true } as const;
    }

    console.warn(
      "Email sending disabled: RESEND_API_KEY not set. Skipping send.",
    );
    return {
      ok: true,
      simulated: true,
      to,
      subject,
    } as const;
  }

  if (!html && !text) {
    throw new AppError({
      code: "EMAIL_ERROR",
      message: "Email requires either html or text content",
      statusCode: 500,
      expose: false,
    });
  }

  const renderOptions = html
    ? {
        html,
        ...(text ? { text } : {}),
      }
    : {
        text: text as string,
      };

  const result = await resend.emails.send({
    from: emailConfig.from,
    to,
    subject,
    ...renderOptions,
  });

  if (result.error) {
    throw new AppError({
      code: "EMAIL_ERROR",
      message: result.error.message,
      statusCode: 502,
      expose: false,
      cause: result.error,
    });
  }

  return result.data;
}
