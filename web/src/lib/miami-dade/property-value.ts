export type AssessedValueSource = "county" | "heated_area_estimate";

const MIN_HEATED_SQFT = 300;
const MAX_HEATED_SQFT = 25_000;

/** Default $/sq ft for Miami-Dade heated living area (override via env). */
export function getHeatedAreaValuePerSqft(): number {
  const rate = Number(process.env.HEATED_AREA_VALUE_PER_SQFT ?? 225);
  return Number.isFinite(rate) && rate > 0 ? rate : 225;
}

export function estimateAssessedValueFromHeatedArea(
  heatedSqft: number | null | undefined,
): number | null {
  if (heatedSqft == null || !Number.isFinite(heatedSqft)) return null;

  const sqft = Math.round(heatedSqft);
  if (sqft < MIN_HEATED_SQFT || sqft > MAX_HEATED_SQFT) return null;

  const value = Math.round(sqft * getHeatedAreaValuePerSqft());
  return value > 0 ? value : null;
}

export function resolvePropertyAssessedValue(input: {
  totalValCur?: number | null;
  buildingHeatedArea?: number | null;
  buildingEffectiveArea?: number | null;
}): {
  assessed_value: number | null;
  assessed_value_source: AssessedValueSource | null;
  building_heated_area: number | null;
} {
  const heated =
    input.buildingHeatedArea != null &&
    Number.isFinite(input.buildingHeatedArea) &&
    input.buildingHeatedArea > 0
      ? Math.round(input.buildingHeatedArea)
      : input.buildingEffectiveArea != null &&
          Number.isFinite(input.buildingEffectiveArea) &&
          input.buildingEffectiveArea > 0
        ? Math.round(input.buildingEffectiveArea)
        : null;

  if (
    input.totalValCur != null &&
    Number.isFinite(input.totalValCur) &&
    input.totalValCur > 0
  ) {
    return {
      assessed_value: Math.round(input.totalValCur),
      assessed_value_source: "county",
      building_heated_area: heated,
    };
  }

  const estimated = estimateAssessedValueFromHeatedArea(heated);
  return {
    assessed_value: estimated,
    assessed_value_source: estimated != null ? "heated_area_estimate" : null,
    building_heated_area: heated,
  };
}
