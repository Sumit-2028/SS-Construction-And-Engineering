"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getAdminOrganizationId } from "@/lib/admin/organization";
import { requireAdmin } from "@/lib/auth/authorization";
import { prisma } from "@/lib/db/prisma";
import { AppError } from "@/lib/errors/app-error";
import { getProjectMediaFolder } from "@/lib/media/service";
import {
  assertCloudinaryConfigured,
  cloudinary
} from "@/lib/storage";

const mediaCategorySchema = z.enum([
  "BEFORE_CONSTRUCTION",
  "DURING_CONSTRUCTION",
  "COMPLETED_CONSTRUCTION"
]);

const uploadMediaSchema = z.object({
  projectId: z.string().min(1),
  title: z.string().trim().max(180).optional(),
  category: mediaCategorySchema
});

const deleteMediaSchema = z.object({
  mediaId: z.string().min(1)
});

type CloudinaryUploadResult = {
  bytes?: number;
  format?: string;
  height?: number;
  public_id: string;
  resource_type: string;
  secure_url: string;
  width?: number;
};

function optionalText(value: FormDataEntryValue | null) {
  const text = value?.toString().trim();

  return text ? text : undefined;
}

async function uploadImageToCloudinary({
  buffer,
  folder
}: {
  buffer: Buffer;
  folder: string;
}) {
  assertCloudinaryConfigured();

  return new Promise<CloudinaryUploadResult>((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image"
      },
      (error, result) => {
        if (error || !result) {
          reject(error ?? new Error("Cloudinary upload failed"));
          return;
        }

        resolve(result);
      }
    );

    uploadStream.end(buffer);
  });
}

export async function uploadProjectImageAction(formData: FormData) {
  const session = await requireAdmin();
  const organizationId = await getAdminOrganizationId(session);
  const parsed = uploadMediaSchema.parse({
    projectId: formData.get("projectId"),
    title: optionalText(formData.get("title")),
    category: formData.get("category")
  });
  const image = formData.get("image");

  if (!(image instanceof File) || image.size === 0) {
    throw new AppError({
      code: "VALIDATION_ERROR",
      message: "Project image is required.",
      statusCode: 400
    });
  }

  if (!image.type.startsWith("image/")) {
    throw new AppError({
      code: "VALIDATION_ERROR",
      message: "Only image uploads are supported.",
      statusCode: 400
    });
  }

  if (image.size > 8 * 1024 * 1024) {
    throw new AppError({
      code: "VALIDATION_ERROR",
      message: "Image size must be 8 MB or less.",
      statusCode: 400
    });
  }

  const project = await prisma.project.findFirst({
    where: {
      id: parsed.projectId,
      organizationId
    },
    select: {
      code: true,
      id: true
    }
  });

  if (!project) {
    throw new AppError({
      code: "NOT_FOUND",
      message: "Project was not found.",
      statusCode: 404
    });
  }

  const uploadResult = await uploadImageToCloudinary({
    buffer: Buffer.from(await image.arrayBuffer()),
    folder: getProjectMediaFolder({
      organizationId,
      projectCode: project.code
    })
  });

  await prisma.mediaAsset.create({
    data: {
      organizationId,
      projectId: project.id,
      uploadedById: session.user.id,
      title: parsed.title ?? image.name,
      category: parsed.category,
      publicId: uploadResult.public_id,
      secureUrl: uploadResult.secure_url,
      resourceType: uploadResult.resource_type,
      folder: getProjectMediaFolder({
        organizationId,
        projectCode: project.code
      }),
      bytes: uploadResult.bytes,
      format: uploadResult.format,
      width: uploadResult.width,
      height: uploadResult.height
    }
  });

  revalidatePath("/admin");
  revalidatePath("/admin/media");
  revalidatePath("/customer");
  revalidatePath(`/customer/projects/${project.id}`);
}

export async function deleteProjectImageAction(formData: FormData) {
  const organizationId = await getAdminOrganizationId();
  const parsed = deleteMediaSchema.parse({
    mediaId: formData.get("mediaId")
  });
  const media = await prisma.mediaAsset.findFirst({
    where: {
      id: parsed.mediaId,
      organizationId
    },
    select: {
      id: true,
      projectId: true,
      publicId: true
    }
  });

  if (!media) {
    throw new AppError({
      code: "NOT_FOUND",
      message: "Media asset was not found.",
      statusCode: 404
    });
  }

  assertCloudinaryConfigured();
  await cloudinary.uploader.destroy(media.publicId, { resource_type: "image" });

  await prisma.mediaAsset.delete({
    where: {
      id: media.id
    }
  });

  revalidatePath("/admin");
  revalidatePath("/admin/media");
  revalidatePath("/customer");

  if (media.projectId) {
    revalidatePath(`/customer/projects/${media.projectId}`);
  }
}
