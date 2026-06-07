import "server-only";
import { z } from "zod";

const emptyStringToUndefined = z.literal("").transform(() => undefined);

const optionalString = z
  .union([z.string().min(1), emptyStringToUndefined])
  .optional();

const requiredSecret = z
  .string()
  .min(32, "AUTH_SECRET must be at least 32 characters");

const optionalUrl = z.union([z.string().url(), emptyStringToUndefined]).optional();
const requiredUrl = z.string().url();

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
  LOG_LEVEL: z
    .enum(["trace", "debug", "info", "warn", "error", "fatal"])
    .default("info"),
  DATABASE_URL: requiredUrl,
  DIRECT_URL: requiredUrl,
  AUTH_SECRET: requiredSecret,
  AUTH_URL: optionalUrl,
  CLOUDINARY_CLOUD_NAME: optionalString,
  CLOUDINARY_API_KEY: optionalString,
  CLOUDINARY_API_SECRET: optionalString,
  RESEND_API_KEY: optionalString,
  EMAIL_FROM: optionalString,
  REMINDER_CRON_SECRET: optionalString
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error(parsed.error.flatten().fieldErrors);
  throw new Error("Invalid environment variables");
}

export const env = parsed.data;
export type Env = typeof env;
