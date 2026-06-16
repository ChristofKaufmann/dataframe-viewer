// Pure helpers for the column-statistics row. Kept free of DOM/global access
// so the formatting behavior can be pinned down by unit tests.

/**
 * Formats a percentage for the stats row: rounded to a whole number once it
 * reaches 10%, and to one decimal below that (so small-but-nonzero shares keep
 * some precision instead of collapsing to "0%").
 */
export function formatPercent(p: number): string {
  if (p >= 10) {
    return `${Math.round(p)}%`;
  }
  return `${p.toFixed(1)}%`;
}
