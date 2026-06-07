import "server-only";
import { ZodError, type ZodSchema } from "zod";
import { logger } from "@/lib/logger";
import { normalizeError, toPublicError } from "@/lib/errors/normalize";
import type { ActionResult } from "@/server/actions/types";

function compactFieldErrors(
  fieldErrors: Record<string, string[] | undefined>
) {
  return Object.fromEntries(
    Object.entries(fieldErrors).filter((entry): entry is [string, string[]] =>
      Boolean(entry[1]?.length)
    )
  );
}

export async function runServerAction<TInput, TOutput>(
  schema: ZodSchema<TInput>,
  input: unknown,
  handler: (input: TInput) => Promise<TOutput>
): Promise<ActionResult<TOutput>> {
  try {
    const parsedInput = schema.parse(input);
    const data = await handler(parsedInput);

    return {
      ok: true,
      data
    };
  } catch (error) {
    const appError = normalizeError(error);

    logger.error(
      {
        err: appError,
        code: appError.code
      },
      "Server action failed"
    );

    return {
      ok: false,
      error: {
        ...toPublicError(appError),
        fieldErrors:
          error instanceof ZodError
            ? compactFieldErrors(error.flatten().fieldErrors)
            : undefined
      }
    };
  }
}
