import { useRef, useState, useEffect } from "react";
import "./UserCarousel.css";

function UserCard({ name, listings, collageColors }) {
  return (
    <div className="user-card">
      <div className="user-card-collage">
        {collageColors.map((color, i) => (
          <div key={i} className="user-card-collage-cell" style={{ backgroundColor: color }} />
        ))}
      </div>
      <div className="user-card-info">
        <div className="user-card-pfp">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="8" r="4"/>
            <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
          </svg>
        </div>
        <p className="user-card-name">{name}</p>
        <p className="user-card-listings">{listings} listing{listings !== 1 ? "s" : ""}</p>
      </div>
    </div>
  );
}

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
        <p className="user-carousel-description">Browse local sellers and traders in your area.</p>
      </div>
      <div className="user-carousel">
        {showLeft && (
          <button className="user-carousel-btn user-carousel-btn--left" onClick={() => scrollCarousel(-1)}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </button>
        )}

        <div className="user-carousel-track" ref={trackRef} onScroll={handleScroll}>
          {users.map((user) => (
            <UserCard key={user.id} {...user} />
          ))}
        </div>

        {showRight && (
          <button className="user-carousel-btn user-carousel-btn--right" onClick={() => scrollCarousel(1)}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </button>
        )}
      </div>
    </section>
  );
}
