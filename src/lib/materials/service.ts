import type { MaterialUnit } from "@prisma/client";

export const materialUnitOptions: MaterialUnit[] = [
  "BAG",
  "KG",
  "TON",
  "CFT",
  "SQFT",
  "PIECE",
  "LOAD"
];

export function materialNumber(value: unknown) {
  if (value === null || value === undefined || value === "") {
    return 0;
  }

  return Number(value);
}

export function formatMaterialQuantity(value: unknown, unit: string) {
  return `${new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 2
  }).format(materialNumber(value))} ${unit.replaceAll("_", " ")}`;
}

export function summarizeMaterialUsage<
  TUsage extends {
    cementQuantity: unknown;
    steelQuantity: unknown;
    bricksQuantity: unknown;
    sandQuantity: unknown;
    aggregateQuantity: unknown;
  }
>(records: TUsage[]) {
  return records.reduce(
    (summary, usage) => ({
      aggregate: summary.aggregate + materialNumber(usage.aggregateQuantity),
      bricks: summary.bricks + materialNumber(usage.bricksQuantity),
      cement: summary.cement + materialNumber(usage.cementQuantity),
      sand: summary.sand + materialNumber(usage.sandQuantity),
      steel: summary.steel + materialNumber(usage.steelQuantity)
    }),
    {
      aggregate: 0,
      bricks: 0,
      cement: 0,
      sand: 0,
      steel: 0
    }
  );
}

export function dateFromInput(value?: string | null) {
  if (!value) {
    return new Date();
  }

  return new Date(`${value}T00:00:00.000Z`);
}

export function dateInputValue(value: Date | null | undefined) {
  if (!value) {
    return "";
  }

  return value.toISOString().slice(0, 10);
}
