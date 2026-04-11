import { Link } from "react-router-dom";
import "./BookCard.css";

export default function BookCard({
  id,
  title,
  author,
  price,
  coverColor = "#e5e7eb",
  ...book
}) {
  return (
    <Link to={`/books/${id}`} state={{ book: { id, title, author, price, coverColor, ...book } }} className="book-card-link">
      <article className="book-card">
        <div className="book-cover-artwork" style={{ backgroundColor: coverColor }}>
          <span className="book-cover-label">Cover</span>
        </div>

        <div className="book-card-content">
          <h2 className="book-card-title">{title}</h2>
          <p className="book-card-meta">Author: {author}</p>
          <div className="book-card-bottom-row">
            <span className="book-card-price">{price}</span>
            <span className="book-card-cta">View details</span>
          </div>
        </div>
      </article>
    </Link>
  );
}
