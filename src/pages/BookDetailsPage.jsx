import { Link, useLocation, useParams } from "react-router-dom";
import { getBookById, SAMPLE_BOOKS } from "../data/books";
import BookCarousel from "../components/BookCarousel";
import "./BookDetailsPage.css";

export default function BookDetailsPage() {
  const { bookId } = useParams();
  const location = useLocation();
  const book = location.state?.book ?? getBookById(bookId);

  if (!book) {
    return (
      <main className="book-details-page">
        <section className="detail-card book-details-missing-card">
          <p className="book-details-kicker">Listing not found</p>
          <h1 className="book-details-title">This book is not available right now.</h1>
          <p className="book-details-description">
            The route loaded, but there is no placeholder listing data for this item yet.
          </p>
          <Link to="/" className="book-details-back-link">Back to home</Link>
        </section>
      </main>
    );
  }

  const genreId = book.genre?.toLowerCase().replace(/\s+/g, "-");
  const similarBooks = SAMPLE_BOOKS.filter((b) => b.genre === book.genre && b.id !== book.id);

  return (
    <main className="book-details-page">
      <nav className="book-details-breadcrumb">
        <Link to="/" className="breadcrumb-link">Home</Link>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="breadcrumb-chevron">
          <polyline points="9 18 15 12 9 6"/>
        </svg>
        <Link to={`/#${genreId}`} className="breadcrumb-link breadcrumb-link--active">{book.genre}</Link>
      </nav>

      <div className="book-details-layout">

        {/* Left: Cover */}
        <div className="book-details-cover-panel">
          <div className="book-details-cover" style={{ backgroundColor: book.thumbnail ? "transparent" : book.coverColor }}>
            {book.thumbnail ? (
              <img
                src={book.thumbnail.replace("http://", "https://")}
                alt={book.title}
                className="book-details-cover-img"
              />
            ) : (
              <span className="book-details-cover-label">Book Cover</span>
            )}
            <button type="button" className="book-details-heart-btn" title="Save Listing">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Right: Info */}
        <div className="book-details-info-panel">
          <h1 className="book-details-title">{book.title}</h1>
          <p className="book-details-author">by {book.author}</p>
          <p className="book-details-listed-by">Listed by <span>{book.seller}</span></p>

          {book.description && (
            <div className="book-details-section">
              <h3 className="book-details-section-title">About this Book</h3>
              <p className="book-details-description">{book.description}</p>
            </div>
          )}

          <div className="book-details-meta-grid">
            <div className="book-details-meta-item">
              <span className="detail-label">Published</span>
              <span className="detail-value">{book.publishedDate ?? "Unknown"}</span>
            </div>
            <div className="book-details-meta-item">
              <span className="detail-label">Genre</span>
              <span className="detail-value">{book.genre}</span>
            </div>
            <div className="book-details-meta-item">
              <span className="detail-label">Pages</span>
              <span className="detail-value">{book.pageCount ?? "Unknown"}</span>
            </div>
            <div className="book-details-meta-item">
              <span className="detail-label">Condition</span>
              <span className="detail-value">{book.condition}</span>
            </div>
          </div>

          {book.notes && (
            <div className="book-details-section">
              <h3 className="book-details-section-title">Details</h3>
              <p className="book-details-description">{book.notes}</p>
            </div>
          )}

          <div className="book-details-actions">
            <button type="button" className="book-details-primary-btn">Propose a Trade</button>
          </div>
        </div>

      </div>

      {similarBooks.length > 0 && (
        <div className="book-details-similar">
          <BookCarousel
            title={`More in ${book.genre}`}
            books={similarBooks}
          />
        </div>
      )}
    </main>
  );
}
