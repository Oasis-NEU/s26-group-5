/**
 * Computes a fixed popup position that stays within the viewport.
 * @param {DOMRect} rect - bounding rect of the anchor element
 * @param {number} popupW - popup width in px
 * @param {number} popupH - popup height in px
 * @param {number} [gap=0] - gap between anchor and popup in px
 */
export function computePopupStyle(rect, popupW, popupH, gap = 0) {
  if (!rect) return {};
  let left = rect.left + rect.width / 2 - popupW / 2;
  left = Math.max(8, Math.min(left, window.innerWidth - popupW - 8));
  let top = rect.top - popupH - gap;
  if (top < 8) top = rect.bottom + gap;
  return { top, left };
}
