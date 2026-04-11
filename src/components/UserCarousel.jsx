import { useRef, useState, useEffect } from "react";
import UserCard from "./UserCard";
import "./UserCarousel.css";

export default function UserCarousel({ users }) {
  const trackRef = useRef(null);
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(false);

  useEffect(() => {
    const el = trackRef.current;
    if (el) setShowRight(el.scrollWidth > el.clientWidth + 1);
  }, [users]);

  function handleScroll() {
    const el = trackRef.current;
    if (!el) return;
    setShowLeft(el.scrollLeft > 0);
    setShowRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 1);
  }

  function scrollCarousel(dir) {
    const el = trackRef.current;
    if (!el) return;
    const card = el.firstElementChild;
    const gap = parseFloat(getComputedStyle(el).columnGap) || 0;
    const cardWidth = card ? card.offsetWidth + gap : 400;
    el.scrollBy({ left: dir * cardWidth * 3, behavior: "smooth" });
  }

  return (
    <section className="user-carousel-section">
      <div className="user-carousel-header">
        <h2 className="user-carousel-title">Users Near Me</h2>
        <p className="user-carousel-description">Browse traders in your area.</p>
      </div>
      <div className="user-carousel">
        {showLeft && (
          <button className="carousel-btn carousel-btn--left" onClick={() => scrollCarousel(-1)}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </button>
        )}

        <div className="user-carousel-track-clip">
        <div className="user-carousel-track" ref={trackRef} onScroll={handleScroll}>
          {users.map((user) => (
            <UserCard key={user.id} {...user} />
          ))}
        </div>
        </div>

        {showRight && (
          <button className="carousel-btn carousel-btn--right" onClick={() => scrollCarousel(1)}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </button>
        )}
      </div>
    </section>
  );
}
