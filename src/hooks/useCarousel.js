import { useRef, useState, useEffect } from "react";

export function useCarousel(items) {
  const trackRef = useRef(null);
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(false);

  useEffect(() => {
    const el = trackRef.current;
    if (el) setShowRight(el.scrollWidth > el.clientWidth + 1);
  }, [items]);

  function handleScroll() {
    const el = trackRef.current;
    if (!el) return;
    setShowLeft(el.scrollLeft > 0);
    setShowRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 1);
  }

  function scroll(dir, count) {
    const el = trackRef.current;
    if (!el) return;
    const card = el.firstElementChild;
    const gap = parseFloat(getComputedStyle(el).columnGap) || 0;
    const cardWidth = card ? card.offsetWidth + gap : 300;
    el.scrollBy({ left: dir * cardWidth * count, behavior: "smooth" });
  }

  return { trackRef, showLeft, showRight, handleScroll, scroll };
}
