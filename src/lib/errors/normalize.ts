import { Prisma } from "@prisma/client";
import { ZodError } from "zod";
import { AppError } from "@/lib/errors/app-error";

export function normalizeError(error: unknown): AppError {
  if (error instanceof AppError) {
    return error;
  }

  if (error instanceof ZodError) {
    return new AppError({
      code: "VALIDATION_ERROR",
      message: "Request validation failed",
      statusCode: 422,
      cause: error
    });
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      return new AppError({
        code: "CONFLICT",
        message: "A record with this value already exists",
        statusCode: 409,
        cause: error
      });
    }

    return new AppError({
      code: "DATABASE_ERROR",
      message: "Database operation failed",
      statusCode: 500,
      expose: false,
      cause: error
    });
  }

  if (error instanceof Error) {
    return new AppError({
      code: "INTERNAL_SERVER_ERROR",
      message: error.message,
      statusCode: 500,
      expose: false,
      cause: error
    });
  }

  return new AppError({
    code: "INTERNAL_SERVER_ERROR",
    message: "Unknown application error",
    statusCode: 500,
    expose: false,
    cause: error
  });
}

export function toPublicError(error: AppError) {
  return {
    code: error.code,
    message: error.expose ? error.message : "An unexpected error occurred"
  };
}
