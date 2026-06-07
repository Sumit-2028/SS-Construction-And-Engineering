import "server-only";
import pino from "pino";
import { env } from "@/config/env";

export const logger = pino({
  level: env.LOG_LEVEL,
  base: {
    app: "construction-management-platform",
    runtime: "nextjs"
  },
  redact: {
    paths: [
      "DATABASE_URL",
      "DIRECT_URL",
      "AUTH_SECRET",
      "CLOUDINARY_API_SECRET",
      "RESEND_API_KEY",
      "password",
      "token",
      "access_token",
      "refresh_token",
      "*.password",
      "*.token",
      "*.access_token",
      "*.refresh_token"
    ],
    censor: "[redacted]"
  }
});
