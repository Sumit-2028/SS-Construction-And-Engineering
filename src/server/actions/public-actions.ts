"use server";

import { z } from "zod";
import { prisma } from "@/lib/db/prisma";

export type PublicFormState = {
  ok: boolean;
  message: string;
};

const initialOrganization = {
  name: "Apex Constructions",
  slug: "apex-constructions",
  email: "ops@apexconstructions.example",
  phone: "+91-9876543210",
  address: "MG Road, Bengaluru, Karnataka"
};

const serviceTypeSchema = z.enum([
  "HOUSE_CONSTRUCTION",
  "BUILDING_CONSTRUCTION",
  "CIVIL_CONTRACTING",
  "RENOVATION"
]);

const optionalPositiveNumber = z.preprocess(
  (value) => (value === "" || value === null ? undefined : value),
  z.coerce.number().positive().optional()
);

const siteVisitSchema = z.object({
  name: z.string().trim().min(2).max(160),
  phone: z.string().trim().min(7).max(32),
  email: z.string().trim().email().optional().or(z.literal("")),
  location: z.string().trim().min(2).max(255),
  plotSize: optionalPositiveNumber,
  projectType: serviceTypeSchema,
  preferredVisitDate: z.string().min(1),
  preferredVisitTime: z.string().min(1),
  budget: optionalPositiveNumber,
  requirements: z.string().trim().min(10).max(3000)
});

const contactSchema = z.object({
  name: z.string().trim().min(2).max(160),
  phone: z.string().trim().min(7).max(32),
  email: z.string().trim().email().optional().or(z.literal("")),
  location: z.string().trim().min(2).max(255),
  message: z.string().trim().min(10).max(3000)
});

async function getPublicOrganization() {
  return prisma.organization.upsert({
    where: { slug: initialOrganization.slug },
    update: {},
    create: initialOrganization
  });
}

export async function requestSiteVisitAction(
  _previousState: PublicFormState,
  formData: FormData
): Promise<PublicFormState> {
  const parsed = siteVisitSchema.safeParse({
    name: formData.get("name"),
    phone: formData.get("phone"),
    email: formData.get("email"),
    location: formData.get("location"),
    plotSize: formData.get("plotSize"),
    projectType: formData.get("projectType"),
    preferredVisitDate: formData.get("preferredVisitDate"),
    preferredVisitTime: formData.get("preferredVisitTime"),
    budget: formData.get("budget"),
    requirements: formData.get("requirements")
  });

  if (!parsed.success) {
    return {
      ok: false,
      message: "Please check the form details and try again."
    };
  }

  const organization = await getPublicOrganization();
  await prisma.lead.create({
    data: {
      organizationId: organization.id,
      name: parsed.data.name,
      phone: parsed.data.phone,
      email: parsed.data.email || null,
      location: parsed.data.location,
      budget: parsed.data.budget,
      plotSize: parsed.data.plotSize,
      requirement: [
        parsed.data.requirements,
        `Project type: ${parsed.data.projectType}`,
        `Preferred visit: ${parsed.data.preferredVisitDate} ${parsed.data.preferredVisitTime}`
      ].join("\n"),
      status: "NEW",
      source: "WEBSITE"
    }
  });

  return {
    ok: true,
    message: "Your free site visit request has been submitted."
  };
}

export async function contactAction(
  _previousState: PublicFormState,
  formData: FormData
): Promise<PublicFormState> {
  const parsed = contactSchema.safeParse({
    name: formData.get("name"),
    phone: formData.get("phone"),
    email: formData.get("email"),
    location: formData.get("location"),
    message: formData.get("message")
  });

  if (!parsed.success) {
    return {
      ok: false,
      message: "Please check the contact details and try again."
    };
  }

  const organization = await getPublicOrganization();

  await prisma.lead.create({
    data: {
      organizationId: organization.id,
      name: parsed.data.name,
      phone: parsed.data.phone,
      email: parsed.data.email || null,
      location: parsed.data.location,
      requirement: parsed.data.message,
      status: "NEW",
      source: "WEBSITE"
    }
  });

  return {
    ok: true,
    message: "Your message has been sent. Our team will contact you soon."
  };
}
