# Database Design

## ER Diagram Explanation

```text
Organization
  ├─ Membership ─ User
  ├─ Lead ─ SiteVisit ─ assigned User
  ├─ Lead ─ Customer ─ User
  ├─ Customer ─ Project
  │   ├─ ProjectUpdate ─ author User
  │   ├─ Payment ─ PaymentHistory
  │   ├─ MaterialUsage
  │   ├─ Document
  │   ├─ Notification ─ recipient User
  │   └─ DueReminder ─ assigned/created User
  ├─ Testimonial
  ├─ MediaAsset
  └─ AuditLog
```

The schema is tenant-ready through `Organization`. Every business module is
scoped to an organization so the platform can support multiple branches,
companies, or future franchise structures.

## Core Relationships

- `User` supports Auth.js identity plus platform roles such as `ADMIN` and
  `CUSTOMER`.
- `Membership` connects users to an organization with role and status.
- `Lead` stores pre-sales enquiries with phone, email, location, budget, plot
  size, requirement, source, and status.
- `SiteVisit` belongs to a lead and may be assigned to staff.
- `Customer` can be converted from a lead and optionally linked to a customer
  login user.
- `Project` belongs to a customer and stores budget, status, progress, service
  type, location, and timeline.
- `ProjectUpdate` stores progress logs and can be customer-visible or internal.
- `Payment` stores invoice-level totals: total, paid, due, due date, and status.
- `PaymentHistory` stores every payment transaction against a payment record.
- `MaterialUsage` tracks cement, steel, sand, and bricks with quantities and
  units per project/date.
- `Document` stores quotations, agreements, blueprints, invoices, and other
  Cloudinary-backed files.
- `Testimonial` stores customer feedback, publication status, and rating.
- `Notification` stores in-app notifications per recipient.
- `DueReminder` tracks follow-ups for customers, projects, and payments.
- `AuditLog` gives an append-only trail for important business events.

## Indexes

High-value indexes are included for production list and dashboard workflows:

- Leads: `organizationId + status + createdAt`, phone, email, assigned staff.
- Site visits: organization/date/status, lead, assigned staff/date.
- Customers: organization/phone, organization/email, organization/name.
- Projects: organization/status/progress, customer, service type.
- Payments: organization/status/dueDate, customer, project.
- Payment history: payment/date, transaction reference.
- Documents: organization/type/status, customer, project, uploader.
- Notifications: recipient/status/createdAt, organization/type/createdAt.
- Due reminders: organization/status/dueAt, assignee/status/dueAt.
- Audit logs: organization/createdAt, entity type/id.

## Constraints

- Auth.js account uniqueness is enforced by provider/provider account ID.
- User email is unique.
- Organization slug is unique.
- Membership is unique per organization/user.
- Customer-to-user and customer-to-lead are one-to-one.
- Project code is unique per organization.
- Invoice number is unique per organization.
- Cloudinary public ID is unique per organization.
- Project customer deletion is restricted to protect financial/project history.
- Organization deletion cascades tenant-owned business records.

## Seed Data

Seed file: `prisma/seed.mjs`

Run:

```bash
npm run db:seed
```

The seed creates:

- One construction organization.
- Admin, site engineer, and customer users.
- One lead with site visit.
- One converted customer.
- One active house construction project.
- Project updates.
- Payment and payment history.
- Material usage.
- Quotation, agreement, blueprint, and invoice documents.
- Testimonial.
- Notification.
- Due reminder.
- Audit log.
