import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const adminPasswordHash = await bcrypt.hash("Admin@12345", 12);
  const customerPasswordHash = await bcrypt.hash("Customer@12345", 12);

  const organization = await prisma.organization.upsert({
    where: { slug: "apex-constructions" },
    update: {},
    create: {
      name: "Apex Constructions",
      slug: "apex-constructions",
      email: "ops@apexconstructions.example",
      phone: "+91-9876543210",
      website: "https://apexconstructions.example",
      address: "MG Road, Bengaluru, Karnataka"
    }
  });

  const admin = await prisma.user.upsert({
    where: { email: "admin@apexconstructions.example" },
    update: {
      passwordHash: adminPasswordHash,
      role: "ADMIN",
      isActive: true
    },
    create: {
      name: "Aarav Sharma",
      email: "admin@apexconstructions.example",
      phone: "+91-9000000001",
      passwordHash: adminPasswordHash,
      role: "ADMIN",
      memberships: {
        create: {
          organizationId: organization.id,
          role: "ADMIN"
        }
      }
    }
  });

  const staff = await prisma.user.upsert({
    where: { email: "staff@apexconstructions.example" },
    update: {
      passwordHash: adminPasswordHash,
      role: "ADMIN",
      isActive: true
    },
    create: {
      name: "Meera Iyer",
      email: "staff@apexconstructions.example",
      phone: "+91-9000000002",
      passwordHash: adminPasswordHash,
      role: "ADMIN",
      memberships: {
        create: {
          organizationId: organization.id,
          role: "ADMIN"
        }
      }
    }
  });

  const customerUser = await prisma.user.upsert({
    where: { email: "customer@example.com" },
    update: {
      passwordHash: customerPasswordHash,
      role: "CUSTOMER",
      isActive: true
    },
    create: {
      name: "Rohan Mehta",
      email: "customer@example.com",
      phone: "+91-9000000003",
      passwordHash: customerPasswordHash,
      role: "CUSTOMER"
    }
  });

  const existingLead = await prisma.lead.findFirst({
    where: {
      organizationId: organization.id,
      phone: "+91-9000000003"
    }
  });

  const lead =
    existingLead ??
    (await prisma.lead.create({
      data: {
        organizationId: organization.id,
        assignedToId: admin.id,
        name: "Rohan Mehta",
        phone: "+91-9000000003",
        email: "customer@example.com",
        location: "Whitefield, Bengaluru",
        budget: "8500000",
        plotSize: "2400",
        requirement:
          "G+1 house construction with modern elevation, turnkey execution, and interior planning.",
        status: "SITE_VISIT_COMPLETED",
        source: "WEBSITE"
      }
    }));

  const existingSiteVisit = await prisma.siteVisit.findFirst({
    where: {
      organizationId: organization.id,
      leadId: lead.id,
      visitDate: new Date("2026-06-15T00:00:00.000Z")
    }
  });

  if (!existingSiteVisit) {
    await prisma.siteVisit.create({
      data: {
        organizationId: organization.id,
        leadId: lead.id,
        assignedStaffId: staff.id,
        visitDate: new Date("2026-06-15T00:00:00.000Z"),
        visitTime: new Date("1970-01-01T10:30:00.000Z"),
        status: "COMPLETED",
        notes:
          "Plot access verified. Soil test recommended before final structural quotation.",
        completedAt: new Date("2026-06-15T12:00:00.000Z")
      }
    });
  }

  const customer = await prisma.customer.upsert({
    where: { userId: customerUser.id },
    update: {
      organizationId: organization.id,
      leadId: lead.id,
      name: "Rohan Mehta",
      phone: "+91-9000000003",
      email: "customer@example.com"
    },
    create: {
      organizationId: organization.id,
      userId: customerUser.id,
      leadId: lead.id,
      type: "INDIVIDUAL",
      name: "Rohan Mehta",
      phone: "+91-9000000003",
      email: "customer@example.com",
      address: "Whitefield, Bengaluru",
      billingAddress: "Whitefield, Bengaluru",
      siteAddress: "Plot 27, Whitefield, Bengaluru"
    }
  });

  const project = await prisma.project.upsert({
    where: {
      organizationId_code: {
        organizationId: organization.id,
        code: "APX-HC-2026-001"
      }
    },
    update: {
      customerId: customer.id,
      status: "IN_PROGRESS",
      progress: 32
    },
    create: {
      organizationId: organization.id,
      customerId: customer.id,
      code: "APX-HC-2026-001",
      name: "Mehta Residence Construction",
      serviceType: "HOUSE_CONSTRUCTION",
      status: "IN_PROGRESS",
      priority: "HIGH",
      location: "Whitefield, Bengaluru",
      budget: "8500000",
      progress: 32,
      startDate: new Date("2026-07-01T00:00:00.000Z"),
      targetEndDate: new Date("2027-02-28T00:00:00.000Z")
    }
  });

  const updateCount = await prisma.projectUpdate.count({
    where: { projectId: project.id }
  });

  if (updateCount === 0) {
    await prisma.projectUpdate.createMany({
      data: [
        {
          projectId: project.id,
          authorId: staff.id,
          title: "Foundation excavation completed",
          description:
            "Excavation and layout marking completed as per approved structural drawings.",
          progress: 18,
          visibility: "CUSTOMER",
          updateDate: new Date("2026-07-12T09:00:00.000Z")
        },
        {
          projectId: project.id,
          authorId: staff.id,
          title: "Footing reinforcement inspection",
          description:
            "Steel reinforcement checked internally before concrete pour.",
          progress: 32,
          visibility: "INTERNAL",
          updateDate: new Date("2026-07-20T09:00:00.000Z")
        }
      ]
    });
  }

  const payment = await prisma.payment.upsert({
    where: {
      organizationId_invoiceNumber: {
        organizationId: organization.id,
        invoiceNumber: "INV-2026-0001"
      }
    },
    update: {
      customerId: customer.id,
      projectId: project.id,
      totalAmount: "1700000",
      paidAmount: "1000000",
      dueAmount: "700000",
      status: "PARTIALLY_PAID"
    },
    create: {
      organizationId: organization.id,
      customerId: customer.id,
      projectId: project.id,
      invoiceNumber: "INV-2026-0001",
      title: "Mobilization advance",
      totalAmount: "1700000",
      paidAmount: "1000000",
      dueAmount: "700000",
      dueDate: new Date("2026-08-01T00:00:00.000Z"),
      status: "PARTIALLY_PAID"
    }
  });

  const paymentHistory = await prisma.paymentHistory.findFirst({
    where: {
      paymentId: payment.id,
      transactionRef: "NEFT-APX-0001"
    }
  });

  if (!paymentHistory) {
    await prisma.paymentHistory.create({
      data: {
        paymentId: payment.id,
        amount: "1000000",
        method: "BANK_TRANSFER",
        transactionRef: "NEFT-APX-0001",
        paidAt: new Date("2026-07-01T11:30:00.000Z"),
        receivedBy: "Aarav Sharma",
        notes: "Initial mobilization payment received."
      }
    });
  }

  const materialUsage = await prisma.materialUsage.findFirst({
    where: {
      projectId: project.id,
      usageDate: new Date("2026-07-20T00:00:00.000Z")
    }
  });

  if (!materialUsage) {
    await prisma.materialUsage.create({
      data: {
        projectId: project.id,
        usageDate: new Date("2026-07-20T00:00:00.000Z"),
        cementQuantity: "180",
        cementUnit: "BAG",
        steelQuantity: "3200",
        steelUnit: "KG",
        sandQuantity: "850",
        sandUnit: "CFT",
        aggregateQuantity: "620",
        aggregateUnit: "CFT",
        bricksQuantity: "12000",
        bricksUnit: "PIECE",
        notes: "Foundation and plinth-level material consumption."
      }
    });
  }

  const mediaCount = await prisma.mediaAsset.count({
    where: { projectId: project.id }
  });

  if (mediaCount === 0) {
    await prisma.mediaAsset.createMany({
      data: [
        {
          organizationId: organization.id,
          projectId: project.id,
          uploadedById: staff.id,
          title: "Site condition before excavation",
          category: "BEFORE_CONSTRUCTION",
          publicId: "construction/projects/apx-hc-2026-001/before-site",
          secureUrl:
            "https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg",
          resourceType: "image",
          folder: "construction/projects/apx-hc-2026-001",
          bytes: 120000,
          format: "jpg",
          width: 864,
          height: 576
        },
        {
          organizationId: organization.id,
          projectId: project.id,
          uploadedById: staff.id,
          title: "Foundation work progress",
          category: "DURING_CONSTRUCTION",
          publicId: "construction/projects/apx-hc-2026-001/foundation-progress",
          secureUrl:
            "https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg",
          resourceType: "image",
          folder: "construction/projects/apx-hc-2026-001",
          bytes: 120000,
          format: "jpg",
          width: 864,
          height: 576
        },
        {
          organizationId: organization.id,
          projectId: project.id,
          uploadedById: staff.id,
          title: "Completed construction reference",
          category: "COMPLETED_CONSTRUCTION",
          publicId: "construction/projects/apx-hc-2026-001/completed-reference",
          secureUrl:
            "https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg",
          resourceType: "image",
          folder: "construction/projects/apx-hc-2026-001",
          bytes: 120000,
          format: "jpg",
          width: 864,
          height: 576
        }
      ]
    });
  }

  const documentCount = await prisma.document.count({
    where: { projectId: project.id }
  });

  if (documentCount === 0) {
    await prisma.document.createMany({
      data: [
        {
          organizationId: organization.id,
          customerId: customer.id,
          projectId: project.id,
          uploadedById: admin.id,
          type: "QUOTATION",
          title: "Turnkey Construction Quotation",
          fileName: "quotation-apx-hc-2026-001.pdf",
          mimeType: "application/pdf",
          secureUrl:
            "https://res.cloudinary.com/demo/raw/upload/v1/construction/documents/quotation-apx-hc-2026-001.pdf",
          issuedAt: new Date("2026-06-20T00:00:00.000Z")
        },
        {
          organizationId: organization.id,
          customerId: customer.id,
          projectId: project.id,
          uploadedById: admin.id,
          type: "AGREEMENT",
          title: "Construction Agreement",
          fileName: "agreement-apx-hc-2026-001.pdf",
          mimeType: "application/pdf",
          secureUrl:
            "https://res.cloudinary.com/demo/raw/upload/v1/construction/documents/agreement-apx-hc-2026-001.pdf",
          issuedAt: new Date("2026-06-25T00:00:00.000Z")
        },
        {
          organizationId: organization.id,
          customerId: customer.id,
          projectId: project.id,
          uploadedById: staff.id,
          type: "BLUEPRINT",
          title: "Approved Ground Floor Blueprint",
          fileName: "blueprint-ground-floor.pdf",
          mimeType: "application/pdf",
          secureUrl:
            "https://res.cloudinary.com/demo/raw/upload/v1/construction/documents/blueprint-ground-floor.pdf",
          issuedAt: new Date("2026-06-28T00:00:00.000Z")
        },
        {
          organizationId: organization.id,
          customerId: customer.id,
          projectId: project.id,
          uploadedById: admin.id,
          type: "INVOICE",
          title: "Mobilization Invoice",
          fileName: "invoice-inv-2026-0001.pdf",
          mimeType: "application/pdf",
          secureUrl:
            "https://res.cloudinary.com/demo/raw/upload/v1/construction/documents/invoice-inv-2026-0001.pdf",
          issuedAt: new Date("2026-07-01T00:00:00.000Z")
        }
      ]
    });
  }

  const testimonial = await prisma.testimonial.findFirst({
    where: {
      organizationId: organization.id,
      projectId: project.id,
      customerId: customer.id
    }
  });

  if (!testimonial) {
    await prisma.testimonial.create({
      data: {
        organizationId: organization.id,
        customerId: customer.id,
        projectId: project.id,
        name: "Rohan Mehta",
        designation: "Home Owner",
        rating: 5,
        message:
          "The project updates and payment tracking made the construction process transparent from day one.",
        isPublished: true,
        publishedAt: new Date("2026-07-25T00:00:00.000Z")
      }
    });
  }

  const notification = await prisma.notification.findFirst({
    where: {
      organizationId: organization.id,
      recipientId: customerUser.id,
      projectId: project.id,
      title: "New project update"
    }
  });

  if (!notification) {
    await prisma.notification.create({
      data: {
        organizationId: organization.id,
        recipientId: customerUser.id,
        projectId: project.id,
        type: "PROJECT",
        title: "New project update",
        message: "Foundation excavation has been completed.",
        actionUrl: `/dashboard/projects/${project.id}`
      }
    });
  }

  const reminder = await prisma.dueReminder.findFirst({
    where: {
      organizationId: organization.id,
      paymentId: payment.id,
      title: "Collect pending mobilization due"
    }
  });

  if (!reminder) {
    await prisma.dueReminder.create({
      data: {
        organizationId: organization.id,
        customerId: customer.id,
        projectId: project.id,
        paymentId: payment.id,
        assignedToId: admin.id,
        createdById: admin.id,
        title: "Collect pending mobilization due",
        description:
          "Follow up with customer for remaining mobilization amount.",
        dueAt: new Date("2026-08-01T09:00:00.000Z"),
        priority: "HIGH"
      }
    });
  }

  const auditLog = await prisma.auditLog.findFirst({
    where: {
      organizationId: organization.id,
      projectId: project.id,
      action: "SEED_CREATED"
    }
  });

  if (!auditLog) {
    await prisma.auditLog.create({
      data: {
        organizationId: organization.id,
        projectId: project.id,
        actorId: admin.id,
        action: "SEED_CREATED",
        entityType: "Project",
        entityId: project.id,
        metadata: {
          code: project.code,
          source: "prisma/seed.mjs"
        }
      }
    });
  }

  console.log("Seed completed", {
    organization: organization.slug,
    admin: admin.email,
    project: project.code
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
