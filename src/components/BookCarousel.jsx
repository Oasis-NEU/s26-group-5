import { useCarousel } from "../hooks/useCarousel";
import BookCard from "./BookCard";
import "./BookCarousel.css";

export default function BookCarousel({ id, title, description, books }) {
  const { trackRef, showLeft, showRight, handleScroll, scroll } = useCarousel(books);

  return (
    <section id={id} className="book-carousel-section">
      <div className="book-carousel-header">
        <h2 className="book-carousel-title">{title}</h2>
        {description && <p className="book-carousel-description">{description}</p>}
      </div>
      <div className="book-carousel">
        {showLeft && (
          <button className="carousel-btn carousel-btn--left" onClick={() => scroll(-1, 6)}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </button>
        )}

        <div className="carousel-track-clip">
          <div className="carousel-track book-carousel-track" ref={trackRef} onScroll={handleScroll}>
            {books.map((book) => (
              <BookCard key={book.id} {...book} />
            ))}
          </div>
        </div>

        {showRight && (
          <button className="carousel-btn carousel-btn--right" onClick={() => scroll(1, 6)}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </button>
        )}
      </div>
    </section>
  );
}
