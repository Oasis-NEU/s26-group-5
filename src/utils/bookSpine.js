export const SPINE_COLORS = [
  "#1e3a5f", "#3b1f5e", "#1f5e3b", "#5e3b1f", "#5e1f1f",
  "#1f4a5e", "#4a2060", "#1a5632", "#7d3c00", "#1b2631",
  "#283747", "#512e5f", "#145a32", "#6e2f0a", "#4a0e0e",
  "#0b3d40", "#3d2b0b", "#2b0b3d", "#0b3d1a", "#3d0b2b",
];

export function hashStr(str = "") {
  let h = 0;
  for (let i = 0; i < str.length; i++)
    h = (str.charCodeAt(i) + ((h << 5) - h)) | 0;
  return Math.abs(h);
}

export function spineColor(title) {
  return SPINE_COLORS[hashStr(title) % SPINE_COLORS.length];
}

const HEIGHTS_LARGE = [142, 148, 154, 160, 165, 170, 156, 146];
const WIDTHS_LARGE  = [28, 32, 36, 38, 34, 30, 40, 26];
const HEIGHTS_SMALL = [118, 124, 130, 136, 142, 128, 122, 126];
const WIDTHS_SMALL  = [24, 28, 32, 34, 30, 26, 36, 22];

// size: "large" (default, MyBooksPage) | "small" (TradePage)
export function spineDimensions(title, size = "large") {
  const h = hashStr(title);
  const heights = size === "small" ? HEIGHTS_SMALL : HEIGHTS_LARGE;
  const widths  = size === "small" ? WIDTHS_SMALL  : WIDTHS_LARGE;
  return {
    height: heights[h % heights.length],
    width:  widths[(h >> 4) % widths.length],
  };
}
