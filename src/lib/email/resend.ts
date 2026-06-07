import "server-only";
import { Resend } from "resend";
import { env } from "@/config/env";
import { AppError } from "@/lib/errors/app-error";

export const resend = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null;

export const emailConfig = {
  from: env.EMAIL_FROM ?? "Construction Platform <noreply@example.com>"
};

export async function sendEmail({
  to,
  subject,
  html,
  text
}: {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
}) {
  if (!resend) {
    throw new AppError({
      code: "EMAIL_ERROR",
      message: "Resend is not configured",
      statusCode: 500,
      expose: false
    });
  }

  if (!html && !text) {
    throw new AppError({
      code: "EMAIL_ERROR",
      message: "Email requires either html or text content",
      statusCode: 500,
      expose: false
    });
  }

  const renderOptions = html
    ? {
        html,
        ...(text ? { text } : {})
      }
    : {
        text: text as string
      };

  const result = await resend.emails.send({
    from: emailConfig.from,
    to,
    subject,
    ...renderOptions
  });

  if (result.error) {
    throw new AppError({
      code: "EMAIL_ERROR",
      message: result.error.message,
      statusCode: 502,
      expose: false,
      cause: result.error
    });
  }

  return result.data;
}
