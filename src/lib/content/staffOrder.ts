import type { Staff } from "./types";

function compareText(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0;
}

export function sortStaff(staff: Staff[]): Staff[] {
  return [...staff].sort((a, b) => {
    const aOrder =
      typeof a.displayOrder === "number" && Number.isFinite(a.displayOrder)
        ? a.displayOrder
        : undefined;
    const bOrder =
      typeof b.displayOrder === "number" && Number.isFinite(b.displayOrder)
        ? b.displayOrder
        : undefined;
    if (aOrder === undefined && bOrder !== undefined) return 1;
    if (aOrder !== undefined && bOrder === undefined) return -1;
    if (aOrder !== undefined && bOrder !== undefined && aOrder !== bOrder)
      return aOrder - bOrder;
    return compareText(a.name, b.name) || compareText(a._id, b._id);
  });
}
