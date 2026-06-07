"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getAdminOrganizationId } from "@/lib/admin/organization";
import { prisma } from "@/lib/db/prisma";
import { AppError } from "@/lib/errors/app-error";
import { dateFromInput } from "@/lib/materials/service";

const materialUnitSchema = z.enum([
  "BAG",
  "KG",
  "TON",
  "CFT",
  "SQFT",
  "PIECE",
  "LOAD"
]);

const materialFormFields = z.object({
  projectId: z.string().min(1),
  usageDate: z.string().optional(),
  cementQuantity: z.coerce.number().min(0).default(0),
  cementUnit: materialUnitSchema.default("BAG"),
  steelQuantity: z.coerce.number().min(0).default(0),
  steelUnit: materialUnitSchema.default("KG"),
  bricksQuantity: z.coerce.number().min(0).default(0),
  bricksUnit: materialUnitSchema.default("PIECE"),
  sandQuantity: z.coerce.number().min(0).default(0),
  sandUnit: materialUnitSchema.default("CFT"),
  aggregateQuantity: z.coerce.number().min(0).default(0),
  aggregateUnit: materialUnitSchema.default("CFT"),
  notes: z.string().trim().max(2000).optional()
});

const updateMaterialSchema = materialFormFields.extend({
  materialUsageId: z.string().min(1)
});

function optionalText(value: FormDataEntryValue | null) {
  const text = value?.toString().trim();

  return text ? text : undefined;
}

function getMaterialPayload(formData: FormData) {
  return {
    projectId: formData.get("projectId"),
    usageDate: optionalText(formData.get("usageDate")),
    cementQuantity: formData.get("cementQuantity") ?? 0,
    cementUnit: formData.get("cementUnit") ?? "BAG",
    steelQuantity: formData.get("steelQuantity") ?? 0,
    steelUnit: formData.get("steelUnit") ?? "KG",
    bricksQuantity: formData.get("bricksQuantity") ?? 0,
    bricksUnit: formData.get("bricksUnit") ?? "PIECE",
    sandQuantity: formData.get("sandQuantity") ?? 0,
    sandUnit: formData.get("sandUnit") ?? "CFT",
    aggregateQuantity: formData.get("aggregateQuantity") ?? 0,
    aggregateUnit: formData.get("aggregateUnit") ?? "CFT",
    notes: optionalText(formData.get("notes"))
  };
}

async function getScopedProject({
  organizationId,
  projectId
}: {
  organizationId: string;
  projectId: string;
}) {
  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      organizationId
    },
    select: {
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

  return project;
}

function materialPaths(projectId: string) {
  return ["/admin", "/admin/material-usage", "/customer", `/customer/projects/${projectId}`];
}

export async function addMaterialUsageAction(formData: FormData) {
  const organizationId = await getAdminOrganizationId();
  const parsed = materialFormFields.parse(getMaterialPayload(formData));
  const project = await getScopedProject({
    organizationId,
    projectId: parsed.projectId
  });

  await prisma.materialUsage.create({
    data: {
      projectId: project.id,
      usageDate: dateFromInput(parsed.usageDate),
      cementQuantity: parsed.cementQuantity.toString(),
      cementUnit: parsed.cementUnit,
      steelQuantity: parsed.steelQuantity.toString(),
      steelUnit: parsed.steelUnit,
      bricksQuantity: parsed.bricksQuantity.toString(),
      bricksUnit: parsed.bricksUnit,
      sandQuantity: parsed.sandQuantity.toString(),
      sandUnit: parsed.sandUnit,
      aggregateQuantity: parsed.aggregateQuantity.toString(),
      aggregateUnit: parsed.aggregateUnit,
      notes: parsed.notes
    }
  });

  materialPaths(project.id).forEach((path) => revalidatePath(path));
}

export async function updateMaterialUsageAction(formData: FormData) {
  const organizationId = await getAdminOrganizationId();
  const parsed = updateMaterialSchema.parse({
    ...getMaterialPayload(formData),
    materialUsageId: formData.get("materialUsageId")
  });
  const project = await getScopedProject({
    organizationId,
    projectId: parsed.projectId
  });
  const materialUsage = await prisma.materialUsage.findFirst({
    where: {
      id: parsed.materialUsageId,
      project: {
        organizationId
      }
    },
    select: {
      id: true,
      projectId: true
    }
  });

  if (!materialUsage) {
    throw new AppError({
      code: "NOT_FOUND",
      message: "Material record was not found.",
      statusCode: 404
    });
  }

  await prisma.materialUsage.update({
    where: {
      id: materialUsage.id
    },
    data: {
      projectId: project.id,
      usageDate: dateFromInput(parsed.usageDate),
      cementQuantity: parsed.cementQuantity.toString(),
      cementUnit: parsed.cementUnit,
      steelQuantity: parsed.steelQuantity.toString(),
      steelUnit: parsed.steelUnit,
      bricksQuantity: parsed.bricksQuantity.toString(),
      bricksUnit: parsed.bricksUnit,
      sandQuantity: parsed.sandQuantity.toString(),
      sandUnit: parsed.sandUnit,
      aggregateQuantity: parsed.aggregateQuantity.toString(),
      aggregateUnit: parsed.aggregateUnit,
      notes: parsed.notes
    }
  });

  materialPaths(materialUsage.projectId).forEach((path) => revalidatePath(path));
  materialPaths(project.id).forEach((path) => revalidatePath(path));
}
