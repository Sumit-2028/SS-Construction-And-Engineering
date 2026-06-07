import { Edit, Package, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAdminOrganizationId } from "@/lib/admin/organization";
import { formatDate } from "@/lib/admin/format";
import { prisma } from "@/lib/db/prisma";
import {
  dateInputValue,
  formatMaterialQuantity,
  materialUnitOptions,
  summarizeMaterialUsage
} from "@/lib/materials/service";
import {
  addMaterialUsageAction,
  updateMaterialUsageAction
} from "@/server/actions/admin-material-actions";

const inputClass =
  "h-10 rounded-md border bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-ring";
const labelClass = "space-y-1 text-sm font-medium text-primary";

function UnitSelect({
  defaultValue,
  name
}: {
  defaultValue: string;
  name: string;
}) {
  return (
    <select className={inputClass} defaultValue={defaultValue} name={name}>
      {materialUnitOptions.map((unit) => (
        <option key={unit} value={unit}>
          {unit}
        </option>
      ))}
    </select>
  );
}

export default async function AdminMaterialUsagePage() {
  const organizationId = await getAdminOrganizationId();
  const [projects, materialRecords] = await Promise.all([
    prisma.project.findMany({
      where: { organizationId },
      include: {
        customer: {
          select: {
            name: true
          }
        }
      },
      orderBy: { updatedAt: "desc" }
    }),
    prisma.materialUsage.findMany({
      where: {
        project: {
          organizationId
        }
      },
      include: {
        project: {
          select: {
            code: true,
            id: true,
            name: true,
            customer: {
              select: {
                name: true
              }
            }
          }
        }
      },
      orderBy: [{ usageDate: "desc" }, { createdAt: "desc" }]
    })
  ]);
  const summary = summarizeMaterialUsage(materialRecords);
  const activeProjectCount = new Set(
    materialRecords.map((record) => record.projectId)
  ).size;

  return (
    <section className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase text-accent">
          Material Usage
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-primary">
          Material Usage Tracking
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Add, update, report, and summarize cement, steel, bricks, sand, and
          aggregate usage by project.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
        <Card className="rounded-md bg-white">
          <CardContent className="p-5">
            <p className="text-xs font-semibold uppercase text-muted-foreground">
              Records
            </p>
            <p className="mt-3 text-2xl font-bold text-primary">
              {materialRecords.length}
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              {activeProjectCount} projects tracked
            </p>
          </CardContent>
        </Card>
        <Card className="rounded-md bg-white">
          <CardContent className="p-5">
            <p className="text-xs font-semibold uppercase text-muted-foreground">
              Cement
            </p>
            <p className="mt-3 text-2xl font-bold text-primary">
              {summary.cement}
            </p>
            <p className="mt-2 text-xs text-muted-foreground">Bags total</p>
          </CardContent>
        </Card>
        <Card className="rounded-md bg-white">
          <CardContent className="p-5">
            <p className="text-xs font-semibold uppercase text-muted-foreground">
              Steel
            </p>
            <p className="mt-3 text-2xl font-bold text-primary">
              {summary.steel}
            </p>
            <p className="mt-2 text-xs text-muted-foreground">KG total</p>
          </CardContent>
        </Card>
        <Card className="rounded-md bg-white">
          <CardContent className="p-5">
            <p className="text-xs font-semibold uppercase text-muted-foreground">
              Bricks
            </p>
            <p className="mt-3 text-2xl font-bold text-primary">
              {summary.bricks}
            </p>
            <p className="mt-2 text-xs text-muted-foreground">Pieces total</p>
          </CardContent>
        </Card>
        <Card className="rounded-md bg-white">
          <CardContent className="p-5">
            <p className="text-xs font-semibold uppercase text-muted-foreground">
              Sand
            </p>
            <p className="mt-3 text-2xl font-bold text-primary">
              {summary.sand}
            </p>
            <p className="mt-2 text-xs text-muted-foreground">CFT total</p>
          </CardContent>
        </Card>
        <Card className="rounded-md bg-white">
          <CardContent className="p-5">
            <p className="text-xs font-semibold uppercase text-muted-foreground">
              Aggregate
            </p>
            <p className="mt-3 text-2xl font-bold text-primary">
              {summary.aggregate}
            </p>
            <p className="mt-2 text-xs text-muted-foreground">CFT total</p>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-md bg-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl text-primary">
            <Plus className="h-5 w-5 text-accent" aria-hidden="true" />
            Add Material Record
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form action={addMaterialUsageAction} className="grid gap-4">
            <div className="grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
              <label className={labelClass}>
                Project
                <select className={inputClass} name="projectId" required>
                  <option value="">Select project</option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.code} · {project.name} · {project.customer.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className={labelClass}>
                Usage Date
                <input className={inputClass} name="usageDate" type="date" />
              </label>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
              <label className={labelClass}>
                Cement
                <div className="grid grid-cols-[1fr_88px] gap-2">
                  <input
                    className={inputClass}
                    defaultValue={0}
                    min={0}
                    name="cementQuantity"
                    step="0.01"
                    type="number"
                  />
                  <UnitSelect defaultValue="BAG" name="cementUnit" />
                </div>
              </label>
              <label className={labelClass}>
                Steel
                <div className="grid grid-cols-[1fr_88px] gap-2">
                  <input
                    className={inputClass}
                    defaultValue={0}
                    min={0}
                    name="steelQuantity"
                    step="0.01"
                    type="number"
                  />
                  <UnitSelect defaultValue="KG" name="steelUnit" />
                </div>
              </label>
              <label className={labelClass}>
                Bricks
                <div className="grid grid-cols-[1fr_88px] gap-2">
                  <input
                    className={inputClass}
                    defaultValue={0}
                    min={0}
                    name="bricksQuantity"
                    step="0.01"
                    type="number"
                  />
                  <UnitSelect defaultValue="PIECE" name="bricksUnit" />
                </div>
              </label>
              <label className={labelClass}>
                Sand
                <div className="grid grid-cols-[1fr_88px] gap-2">
                  <input
                    className={inputClass}
                    defaultValue={0}
                    min={0}
                    name="sandQuantity"
                    step="0.01"
                    type="number"
                  />
                  <UnitSelect defaultValue="CFT" name="sandUnit" />
                </div>
              </label>
              <label className={labelClass}>
                Aggregate
                <div className="grid grid-cols-[1fr_88px] gap-2">
                  <input
                    className={inputClass}
                    defaultValue={0}
                    min={0}
                    name="aggregateQuantity"
                    step="0.01"
                    type="number"
                  />
                  <UnitSelect defaultValue="CFT" name="aggregateUnit" />
                </div>
              </label>
            </div>

            <label className={labelClass}>
              Notes
              <textarea
                className="min-h-24 rounded-md border bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                maxLength={2000}
                name="notes"
                placeholder="Delivery batch, site zone, or usage remarks"
              />
            </label>
            <Button className="w-fit" type="submit">
              Add Record
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="rounded-md bg-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl text-primary">
            <Package className="h-5 w-5 text-accent" aria-hidden="true" />
            Usage Report
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1180px] text-left text-sm">
              <thead className="border-b bg-construction-concrete text-primary">
                <tr>
                  <th className="px-3 py-3 font-semibold">Date</th>
                  <th className="px-3 py-3 font-semibold">Project</th>
                  <th className="px-3 py-3 font-semibold">Cement</th>
                  <th className="px-3 py-3 font-semibold">Steel</th>
                  <th className="px-3 py-3 font-semibold">Bricks</th>
                  <th className="px-3 py-3 font-semibold">Sand</th>
                  <th className="px-3 py-3 font-semibold">Aggregate</th>
                  <th className="px-3 py-3 font-semibold">Notes</th>
                  <th className="px-3 py-3 font-semibold">Update</th>
                </tr>
              </thead>
              <tbody>
                {materialRecords.map((record) => (
                  <tr key={record.id} className="border-b align-top">
                    <td className="px-3 py-4 text-muted-foreground">
                      {formatDate(record.usageDate)}
                    </td>
                    <td className="px-3 py-4">
                      <p className="font-semibold text-primary">
                        {record.project.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {record.project.code} · {record.project.customer.name}
                      </p>
                    </td>
                    <td className="px-3 py-4">
                      {formatMaterialQuantity(
                        record.cementQuantity,
                        record.cementUnit
                      )}
                    </td>
                    <td className="px-3 py-4">
                      {formatMaterialQuantity(record.steelQuantity, record.steelUnit)}
                    </td>
                    <td className="px-3 py-4">
                      {formatMaterialQuantity(
                        record.bricksQuantity,
                        record.bricksUnit
                      )}
                    </td>
                    <td className="px-3 py-4">
                      {formatMaterialQuantity(record.sandQuantity, record.sandUnit)}
                    </td>
                    <td className="px-3 py-4">
                      {formatMaterialQuantity(
                        record.aggregateQuantity,
                        record.aggregateUnit
                      )}
                    </td>
                    <td className="px-3 py-4 text-muted-foreground">
                      {record.notes ?? "-"}
                    </td>
                    <td className="px-3 py-4">
                      <details className="rounded-md border p-3">
                        <summary className="flex cursor-pointer items-center gap-2 font-semibold text-primary">
                          <Edit className="h-4 w-4" aria-hidden="true" />
                          Update
                        </summary>
                        <form
                          action={updateMaterialUsageAction}
                          className="mt-4 grid gap-3"
                        >
                          <input
                            name="materialUsageId"
                            type="hidden"
                            value={record.id}
                          />
                          <label className={labelClass}>
                            Project
                            <select
                              className={inputClass}
                              defaultValue={record.projectId}
                              name="projectId"
                              required
                            >
                              {projects.map((project) => (
                                <option key={project.id} value={project.id}>
                                  {project.code} · {project.name}
                                </option>
                              ))}
                            </select>
                          </label>
                          <label className={labelClass}>
                            Usage Date
                            <input
                              className={inputClass}
                              defaultValue={dateInputValue(record.usageDate)}
                              name="usageDate"
                              type="date"
                            />
                          </label>
                          <div className="grid gap-3 sm:grid-cols-2">
                            <label className={labelClass}>
                              Cement
                              <input
                                className={inputClass}
                                defaultValue={Number(record.cementQuantity)}
                                min={0}
                                name="cementQuantity"
                                step="0.01"
                                type="number"
                              />
                              <UnitSelect
                                defaultValue={record.cementUnit}
                                name="cementUnit"
                              />
                            </label>
                            <label className={labelClass}>
                              Steel
                              <input
                                className={inputClass}
                                defaultValue={Number(record.steelQuantity)}
                                min={0}
                                name="steelQuantity"
                                step="0.01"
                                type="number"
                              />
                              <UnitSelect
                                defaultValue={record.steelUnit}
                                name="steelUnit"
                              />
                            </label>
                            <label className={labelClass}>
                              Bricks
                              <input
                                className={inputClass}
                                defaultValue={Number(record.bricksQuantity)}
                                min={0}
                                name="bricksQuantity"
                                step="0.01"
                                type="number"
                              />
                              <UnitSelect
                                defaultValue={record.bricksUnit}
                                name="bricksUnit"
                              />
                            </label>
                            <label className={labelClass}>
                              Sand
                              <input
                                className={inputClass}
                                defaultValue={Number(record.sandQuantity)}
                                min={0}
                                name="sandQuantity"
                                step="0.01"
                                type="number"
                              />
                              <UnitSelect
                                defaultValue={record.sandUnit}
                                name="sandUnit"
                              />
                            </label>
                            <label className={labelClass}>
                              Aggregate
                              <input
                                className={inputClass}
                                defaultValue={Number(record.aggregateQuantity)}
                                min={0}
                                name="aggregateQuantity"
                                step="0.01"
                                type="number"
                              />
                              <UnitSelect
                                defaultValue={record.aggregateUnit}
                                name="aggregateUnit"
                              />
                            </label>
                          </div>
                          <label className={labelClass}>
                            Notes
                            <textarea
                              className="min-h-24 rounded-md border bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                              defaultValue={record.notes ?? ""}
                              maxLength={2000}
                              name="notes"
                            />
                          </label>
                          <Button size="sm" type="submit">
                            Save Record
                          </Button>
                        </form>
                      </details>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {materialRecords.length === 0 ? (
              <p className="p-6 text-sm text-muted-foreground">
                No material records have been added yet.
              </p>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
