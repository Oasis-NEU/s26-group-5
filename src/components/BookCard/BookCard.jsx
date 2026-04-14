import { Link } from "react-router-dom";
import { secureImageUrl } from "../../utils/image";
import "./BookCard.css";

export default function BookCard({
  id,
  title,
  author,
  condition,
  thumbnail,
  pageCount,
  publishedDate,
  genre,
  seller,
  coverColor = "#e5e7eb",
  ...book
}) {
  return (
    <Link to={`/books/${id}`} state={{ book: { id, title, author, condition, thumbnail, pageCount, publishedDate, genre, seller, coverColor, ...book } }} className="book-card-link">
      <article className="book-card">
        {thumbnail ? (
          <img src={secureImageUrl(thumbnail)} alt={title} className="book-cover-img" />
        ) : (
          <div className="book-cover-artwork" style={{ backgroundColor: coverColor }}>
            <span className="book-cover-label">Cover</span>
          </div>
        )}

        <div className="book-card-content">
          <h2 className="book-card-title">{title}</h2>
          <p className="book-card-meta">{author}</p>
          <div className="book-card-tags">
            {genre && <span className="book-card-tag">{genre}</span>}
            {publishedDate && <span className="book-card-tag">{publishedDate.slice(0, 4)}</span>}
          </div>
        </div>
      </article>
    </Link>
  );
}
