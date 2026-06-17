export type MiamiAreaRegion =
  | "central"
  | "beaches"
  | "north"
  | "south"
  | "west";

export const AREA_REGION_LABELS: Record<MiamiAreaRegion, string> = {
  central: "Central Miami & inner neighborhoods",
  beaches: "Beaches & barrier islands",
  north: "North Miami-Dade",
  south: "South Miami-Dade",
  west: "West Miami-Dade",
};

export const AREA_REGION_ORDER: MiamiAreaRegion[] = [
  "central",
  "beaches",
  "north",
  "south",
  "west",
];
