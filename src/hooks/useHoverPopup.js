import { useState, useRef, useEffect } from "react";

/**
 * Manages hover popup state: which entry is hovered, its position,
 * and the enter/leave handlers with a debounce delay.
 */
export function useHoverPopup(delayMs = 120) {
  const [hoveredEntry, setHoveredEntry] = useState(null);
  const [popupRect, setPopupRect] = useState(null);
  const leaveTimer = useRef(null);
  const hoveredEl = useRef(null);

  // Keep popup anchored to the element while scrolling
  useEffect(() => {
    if (!hoveredEntry) return;
    function onScroll() {
      if (hoveredEl.current)
        setPopupRect(hoveredEl.current.getBoundingClientRect());
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [hoveredEntry]);

  function onEnter(entry, e) {
    clearTimeout(leaveTimer.current);
    hoveredEl.current = e.currentTarget;
    setHoveredEntry(entry);
    setPopupRect(e.currentTarget.getBoundingClientRect());
  }

  function onLeave() {
    leaveTimer.current = setTimeout(() => setHoveredEntry(null), delayMs);
  }

  function onPopupEnter() {
    clearTimeout(leaveTimer.current);
  }

  function onPopupLeave() {
    leaveTimer.current = setTimeout(() => setHoveredEntry(null), delayMs);
  }

  return { hoveredEntry, setHoveredEntry, popupRect, onEnter, onLeave, onPopupEnter, onPopupLeave };
}
