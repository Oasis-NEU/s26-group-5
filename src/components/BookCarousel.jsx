import { useRef, useState, useEffect } from "react";
import BookCard from "./BookCard";
import "./BookCarousel.css";

export default function BookCarousel({ id, title, description, books }) {
  const trackRef = useRef(null);
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(false);

  useEffect(() => {
    const el = trackRef.current;
    if (el) setShowRight(el.scrollWidth > el.clientWidth + 1);
  }, [books]);

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
    const cardWidth = card ? card.offsetWidth + gap : 300;
    el.scrollBy({ left: dir * cardWidth * 6, behavior: "smooth" });
  }

  return (
    <section id={id} className="book-carousel-section">
      <div className="book-carousel-header">
        <h2 className="book-carousel-title">{title}</h2>
        {description && <p className="book-carousel-description">{description}</p>}
      </div>
      <div className="book-carousel">
        {showLeft && (
          <button className="carousel-btn carousel-btn--left" onClick={() => scrollCarousel(-1)}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </button>
        )}

        <div className="book-carousel-track-clip">
        <div className="book-carousel-track" ref={trackRef} onScroll={handleScroll}>
          {books.map((book) => (
            <BookCard key={book.id} {...book} />
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
