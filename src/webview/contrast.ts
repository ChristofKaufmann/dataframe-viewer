// Pure helper: pick a readable text color for a given background. Kept
// DOM-free so it can be unit-tested.

/**
 * Returns black or white (whichever is more readable) for a "#rrggbb"
 * background, or 'inherit' if the string isn't a 6-digit hex color. Uses the
 * ITU-R BT.601 luma with a mid threshold.
 */
export function idealTextColor(hex: string): string {
  const match = /^#?([0-9a-fA-F]{6})$/.exec(hex.trim());
  if (!match) {
    return 'inherit';
  }
  const value = parseInt(match[1], 16);
  const r = (value >> 16) & 0xff;
  const g = (value >> 8) & 0xff;
  const b = value & 0xff;
  const luma = 0.299 * r + 0.587 * g + 0.114 * b;
  return luma > 140 ? '#000000' : '#ffffff';
}
