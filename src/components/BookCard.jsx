import { Link } from "react-router-dom";

export default function BookCard({
  id,
  title,
  author,
  price,
  coverColor = "#e5e7eb",
  ...book
}) {
  return (
    <Link to={`/books/${id}`} state={{ book: { id, title, author, price, coverColor, ...book } }} style={styles.cardLink}>
      <article style={styles.card}>
        <div style={{ ...styles.coverArtwork, backgroundColor: coverColor }}>
          <span style={styles.coverLabel}>Cover</span>
        </div>

        <div style={styles.content}>
          <h2 style={styles.title}>{title}</h2>
          <p style={styles.meta}>Author: {author}</p>
          <div style={styles.bottomRow}>
            <span style={styles.price}>{price}</span>
            <span style={styles.cta}>View details</span>
          </div>
        </div>
      </article>
    </Link>
  );
}

const styles = {
  cardLink: {
    textDecoration: "none",
    color: "inherit",
    display: "block",
  },
  card: {
    display: "grid",
    gridTemplateRows: "25vh 1fr",
    gap: "1vh",
    height: "42vh",
    padding: "0.7vw",
    borderRadius: "1.2vw",
    border: "1px solid #e5e7eb",
    backgroundColor: "#fff",
    transition: "transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease",
    overflow: "hidden",
  },
  coverArtwork: {
    height: "25vh",
    minHeight: "0",
    borderRadius: "1vw",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "0.8vw",
    color: "#fff",
    textAlign: "center",
    backgroundImage:
      "linear-gradient(135deg, rgba(255,255,255,0.28), rgba(255,255,255,0.04))",
  },
  coverLabel: {
    fontSize: "18px",
    fontWeight: "700",
    letterSpacing: "0.08em",
    textTransform: "uppercase",
  },
  content: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    gap: "0.6vh",
    minWidth: 0,
  },
  title: {
    margin: 0,
    fontSize: "18px",
    lineHeight: 1.2,
    color: "#111827",
    overflow: "hidden",
    textOverflow: "ellipsis",
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
  },
  price: {
    fontSize: "16px",
    fontWeight: "700",
    color: "#111827",
    whiteSpace: "nowrap",
  },
  meta: {
    margin: 0,
    fontSize: "0.76vw",
    color: "#374151",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  bottomRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
   
  },
  cta: {
    fontSize: "0.7vw",
    fontWeight: "700",
    color: "#c0392b",
    whiteSpace: "nowrap",
  },
};
