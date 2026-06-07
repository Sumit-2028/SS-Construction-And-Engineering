import Image from "next/image";
import Link from "next/link";
import { ExternalLink, ImageIcon, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAdminOrganizationId } from "@/lib/admin/organization";
import { formatDate } from "@/lib/admin/format";
import { prisma } from "@/lib/db/prisma";
import {
  getMediaCategoryLabel,
  mediaCategoryOptions,
  summarizeMediaByCategory
} from "@/lib/media/service";
import {
  deleteProjectImageAction,
  uploadProjectImageAction
} from "@/server/actions/admin-media-actions";

export default async function AdminMediaPage() {
  const organizationId = await getAdminOrganizationId();
  const [projects, mediaAssets] = await Promise.all([
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
    prisma.mediaAsset.findMany({
      where: { organizationId, resourceType: "image" },
      include: {
        project: {
          select: {
            code: true,
            id: true,
            name: true
          }
        },
        uploadedBy: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: "desc" }
    })
  ]);
  const categorySummary = summarizeMediaByCategory(mediaAssets);

  return (
    <section className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase text-accent">
          Media Management
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-primary">
          Project Image Gallery
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Upload, preview, categorize, and delete Cloudinary-hosted project
          images for customer galleries.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {categorySummary.map((category) => (
          <Card key={category.value} className="rounded-md bg-white">
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase text-muted-foreground">
                    {category.label}
                  </p>
                  <p className="mt-3 text-2xl font-bold text-primary">
                    {category.count}
                  </p>
                </div>
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-accent/10 text-accent">
                  <ImageIcon className="h-5 w-5" aria-hidden="true" />
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="rounded-md bg-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl text-primary">
            <Plus className="h-5 w-5 text-accent" aria-hidden="true" />
            Upload Project Image
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form action={uploadProjectImageAction} className="grid gap-4">
            <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
              <label className="space-y-1 text-sm font-medium text-primary">
                Project
                <select
                  className="h-10 rounded-md border bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                  name="projectId"
                  required
                >
                  <option value="">Select project</option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.code} · {project.name} · {project.customer.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="space-y-1 text-sm font-medium text-primary">
                Category
                <select
                  className="h-10 rounded-md border bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                  name="category"
                  required
                >
                  {mediaCategoryOptions.map((category) => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="grid gap-4 lg:grid-cols-[1fr_1fr_auto] lg:items-end">
              <label className="space-y-1 text-sm font-medium text-primary">
                Image Title
                <input
                  className="h-10 rounded-md border bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                  maxLength={180}
                  name="title"
                  placeholder="Foundation reinforcement"
                />
              </label>
              <label className="space-y-1 text-sm font-medium text-primary">
                Image File
                <input
                  accept="image/*"
                  className="h-10 rounded-md border bg-white px-3 py-2 text-sm outline-none file:mr-3 file:rounded-md file:border-0 file:bg-secondary file:px-3 file:py-1 file:text-xs file:font-semibold file:text-primary focus:ring-2 focus:ring-ring"
                  name="image"
                  required
                  type="file"
                />
              </label>
              <Button type="submit">Upload</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-6">
        {mediaCategoryOptions.map((category) => {
          const categoryAssets = mediaAssets.filter(
            (asset) => asset.category === category.value
          );

          return (
            <Card key={category.value} className="rounded-md bg-white">
              <CardHeader>
                <CardTitle className="text-xl text-primary">
                  {category.label}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {categoryAssets.length > 0 ? (
                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {categoryAssets.map((asset) => (
                      <figure
                        key={asset.id}
                        className="overflow-hidden rounded-md border bg-white"
                      >
                        <Image
                          alt={asset.title ?? getMediaCategoryLabel(asset.category)}
                          className="aspect-[4/3] w-full object-cover"
                          height={asset.height ?? 480}
                          src={asset.secureUrl}
                          width={asset.width ?? 640}
                        />
                        <figcaption className="space-y-3 p-4">
                          <div>
                            <p className="font-semibold text-primary">
                              {asset.title ?? "Project image"}
                            </p>
                            <p className="mt-1 text-xs text-muted-foreground">
                              {asset.project?.code ?? "No project"} ·{" "}
                              {asset.project?.name ?? "Project removed"}
                            </p>
                            <p className="mt-1 text-xs text-muted-foreground">
                              Uploaded {formatDate(asset.createdAt)} by{" "}
                              {asset.uploadedBy?.name ??
                                asset.uploadedBy?.email ??
                                "Admin"}
                            </p>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <Button asChild size="sm" variant="outline">
                              <a
                                href={asset.secureUrl}
                                target="_blank"
                                rel="noreferrer"
                              >
                                <ExternalLink
                                  className="h-4 w-4"
                                  aria-hidden="true"
                                />
                                Preview
                              </a>
                            </Button>
                            {asset.projectId ? (
                              <Button asChild size="sm" variant="outline">
                                <Link
                                  href={`/customer/projects/${asset.projectId}`}
                                >
                                  Customer View
                                </Link>
                              </Button>
                            ) : null}
                            <form action={deleteProjectImageAction}>
                              <input
                                name="mediaId"
                                type="hidden"
                                value={asset.id}
                              />
                              <Button
                                size="sm"
                                type="submit"
                                variant="destructive"
                              >
                                <Trash2
                                  className="h-4 w-4"
                                  aria-hidden="true"
                                />
                                Delete
                              </Button>
                            </form>
                          </div>
                        </figcaption>
                      </figure>
                    ))}
                  </div>
                ) : (
                  <p className="rounded-md border border-dashed p-6 text-sm text-muted-foreground">
                    No images uploaded for this category yet.
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
