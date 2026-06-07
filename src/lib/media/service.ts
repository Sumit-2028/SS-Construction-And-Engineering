import type { MediaCategory } from "@prisma/client";

export const mediaCategoryOptions: Array<{
  label: string;
  value: MediaCategory;
}> = [
  { label: "Before Construction", value: "BEFORE_CONSTRUCTION" },
  { label: "During Construction", value: "DURING_CONSTRUCTION" },
  { label: "Completed Construction", value: "COMPLETED_CONSTRUCTION" }
];

export function getMediaCategoryLabel(category: MediaCategory | string) {
  return (
    mediaCategoryOptions.find((option) => option.value === category)?.label ??
    category
      .toLowerCase()
      .split("_")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ")
  );
}

export function getProjectMediaFolder({
  organizationId,
  projectCode
}: {
  organizationId: string;
  projectCode: string;
}) {
  const safeProjectCode = projectCode.toLowerCase().replace(/[^a-z0-9-]+/g, "-");

  return `construction/projects/${organizationId}/${safeProjectCode}`;
}

export function summarizeMediaByCategory<
  TMedia extends {
    category: MediaCategory;
  }
>(mediaAssets: TMedia[]) {
  return mediaCategoryOptions.map((category) => ({
    ...category,
    count: mediaAssets.filter((asset) => asset.category === category.value).length
  }));
}
