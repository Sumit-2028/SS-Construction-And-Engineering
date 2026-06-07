export type ErrorCode =
  | "BAD_REQUEST"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "VALIDATION_ERROR"
  | "DATABASE_ERROR"
  | "STORAGE_ERROR"
  | "EMAIL_ERROR"
  | "INTERNAL_SERVER_ERROR";

type AppErrorOptions = {
  code: ErrorCode;
  message: string;
  statusCode?: number;
  expose?: boolean;
  cause?: unknown;
};

export class AppError extends Error {
  readonly code: ErrorCode;
  readonly statusCode: number;
  readonly expose: boolean;

  constructor({
    code,
    message,
    statusCode = 500,
    expose = statusCode < 500,
    cause
  }: AppErrorOptions) {
    super(message, { cause });
    this.name = "AppError";
    this.code = code;
    this.statusCode = statusCode;
    this.expose = expose;
  }
}
