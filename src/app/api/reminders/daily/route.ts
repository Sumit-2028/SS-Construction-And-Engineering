import { env } from "@/config/env";
import { AppError } from "@/lib/errors/app-error";
import { okResponse, withRouteHandler } from "@/lib/errors/http";
import { runDailyDueReminderJob } from "@/lib/reminders/service";

export const runtime = "nodejs";

function assertCronAccess(request: Request) {
  if (!env.REMINDER_CRON_SECRET) {
    throw new AppError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Reminder cron secret is not configured.",
      statusCode: 500
    });
  }

  const authorization = request.headers.get("authorization");
  const expectedAuthorization = `Bearer ${env.REMINDER_CRON_SECRET}`;

  if (authorization !== expectedAuthorization) {
    throw new AppError({
      code: "UNAUTHORIZED",
      message: "Invalid reminder cron credentials.",
      statusCode: 401
    });
  }
}

export const POST = withRouteHandler(async (request) => {
  assertCronAccess(request);

  const result = await runDailyDueReminderJob();

  return okResponse({
    job: "daily-due-reminders",
    ...result,
    timestamp: new Date().toISOString()
  });
});

export const GET = POST;
