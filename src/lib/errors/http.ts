import { NextResponse } from "next/server";
import { logger } from "@/lib/logger";
import { normalizeError, toPublicError } from "@/lib/errors/normalize";

export function okResponse<TData>(data: TData, init?: ResponseInit) {
  return NextResponse.json({ data }, init);
}

export function errorResponse(
  error: unknown,
  context?: Record<string, unknown>
) {
  const appError = normalizeError(error);

  logger.error(
    {
      err: appError,
      code: appError.code,
      statusCode: appError.statusCode,
      context
    },
    "Route handler failed"
  );

  return NextResponse.json(
    { error: toPublicError(appError) },
    { status: appError.statusCode }
  );
}

export function withRouteHandler<TContext>(
  handler: (request: Request, context: TContext) => Promise<Response>
) {
  return async (request: Request, context: TContext) => {
    try {
      return await handler(request, context);
    } catch (error) {
      return errorResponse(error, {
        method: request.method,
        url: request.url
      });
    }
  };
}
