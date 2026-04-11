import { Link, useLocation, useParams } from "react-router-dom";
import { getBookById } from "../data/books";
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
          <Link to="/" className="book-details-back-link">
            Back to home
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="book-details-page">
      <section className="book-details-layout">
        <div className="book-details-cover-panel">
          <div className="book-details-cover" style={{ backgroundColor: book.coverColor }}>
            <span className="book-details-cover-label">Book Cover</span>
          </div>
          <div className="book-details-quick-facts">
            <div className="book-details-fact-box">
              <span className="detail-label">Price</span>
              <strong className="detail-value">{book.price}</strong>
            </div>
            <div className="book-details-fact-box">
              <span className="detail-label">Condition</span>
              <strong className="detail-value">{book.condition}</strong>
            </div>
          </div>
        </div>

        <div className="detail-card book-details-content-panel">
          <p className="book-details-kicker">Placeholder listing details</p>
          <h1 className="book-details-title">{book.title}</h1>
          <p className="book-details-subtitle">
            by {book.author} · Sold by {book.seller}
          </p>

          <div className="book-details-meta-grid">
            <div className="book-details-meta-item">
              <span className="detail-label">Genre</span>
              <span className="detail-value">{book.genre}</span>
            </div>
            <div className="book-details-meta-item">
              <span className="detail-label">Pages</span>
              <span className="detail-value">{book.pages}</span>
            </div>
            <div className="book-details-meta-item">
              <span className="detail-label">Shipping</span>
              <span className="detail-value">{book.shipping}</span>
            </div>
          </div>

          <p className="book-details-description">{book.description}</p>

          <div className="book-details-actions">
            <button type="button" className="book-details-primary-btn">
              Add to Cart
            </button>
            <button type="button" className="book-details-secondary-btn">
              Save Listing
            </button>
          </div>

          <Link to="/" className="book-details-back-link">
            Back to listings
          </Link>
        </div>
      </section>
    </main>
  );
}
