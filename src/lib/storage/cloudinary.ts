import "server-only";
import { v2 as cloudinary } from "cloudinary";
import { env } from "@/config/env";
import { AppError } from "@/lib/errors/app-error";

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
  secure: true
});

export const cloudinaryFolders = {
  projects: "construction/projects",
  clients: "construction/clients",
  documents: "construction/documents",
  profiles: "construction/profiles"
} as const;

export function assertCloudinaryConfigured() {
  if (
    !env.CLOUDINARY_CLOUD_NAME ||
    !env.CLOUDINARY_API_KEY ||
    !env.CLOUDINARY_API_SECRET
  ) {
    throw new AppError({
      code: "STORAGE_ERROR",
      message: "Cloudinary is not configured",
      statusCode: 500,
      expose: false
    });
  }
}

export { cloudinary };
