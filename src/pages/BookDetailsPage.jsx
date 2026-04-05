import { Link, useLocation, useParams } from "react-router-dom";
import { getBookById } from "../data/books";

export default function BookDetailsPage() {
  const { bookId } = useParams();
  const location = useLocation();
  const book = location.state?.book ?? getBookById(bookId);

  if (!book) {
    return (
      <main style={styles.page}>
        <section style={styles.missingCard}>
          <p style={styles.kicker}>Listing not found</p>
          <h1 style={styles.title}>This book is not available right now.</h1>
          <p style={styles.description}>
            The route loaded, but there is no placeholder listing data for this item yet.
          </p>
          <Link to="/" style={styles.backLink}>
            Back to home
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main style={styles.page}>
      <section style={styles.layout}>
        <div style={styles.coverPanel}>
          <div style={{ ...styles.cover, backgroundColor: book.coverColor }}>
            <span style={styles.coverLabel}>Book Cover</span>
          </div>
          <div style={styles.quickFacts}>
            <div style={styles.factBox}>
              <span style={styles.factLabel}>Price</span>
              <strong style={styles.factValue}>{book.price}</strong>
            </div>
            <div style={styles.factBox}>
              <span style={styles.factLabel}>Condition</span>
              <strong style={styles.factValue}>{book.condition}</strong>
            </div>
          </div>
        </div>

        <div style={styles.contentPanel}>
          <p style={styles.kicker}>Placeholder listing details</p>
          <h1 style={styles.title}>{book.title}</h1>
          <p style={styles.subtitle}>
            by {book.author} · Sold by {book.seller}
          </p>

          <div style={styles.metaGrid}>
            <div style={styles.metaItem}>
              <span style={styles.metaLabel}>Genre</span>
              <span style={styles.metaValue}>{book.genre}</span>
            </div>
            <div style={styles.metaItem}>
              <span style={styles.metaLabel}>Pages</span>
              <span style={styles.metaValue}>{book.pages}</span>
            </div>
            <div style={styles.metaItem}>
              <span style={styles.metaLabel}>Shipping</span>
              <span style={styles.metaValue}>{book.shipping}</span>
            </div>
          </div>

          <p style={styles.description}>{book.description}</p>

          <div style={styles.actions}>
            <button type="button" style={styles.primaryButton}>
              Add to Cart
            </button>
            <button type="button" style={styles.secondaryButton}>
              Save Listing
            </button>
          </div>

          <Link to="/" style={styles.backLink}>
            Back to listings
          </Link>
        </div>
      </section>
    </main>
  );
}

const styles = {
  page: {
    padding: "2vh 0 3vh",
  },
  layout: {
    display: "grid",
    gridTemplateColumns: "minmax(260px, 360px) 1fr",
    gap: "2rem",
    alignItems: "start",
  },
  coverPanel: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  },
  cover: {
    aspectRatio: "3 / 4",
    borderRadius: "24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "1rem",
    color: "#fff",
    backgroundImage:
      "linear-gradient(135deg, rgba(255,255,255,0.28), rgba(255,255,255,0.04))",
  },
  coverLabel: {
    fontSize: "1rem",
    fontWeight: "700",
    letterSpacing: "0.08em",
    textTransform: "uppercase",
  },
  quickFacts: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: "0.75rem",
  },
  factBox: {
    border: "1px solid #e5e7eb",
    borderRadius: "18px",
    backgroundColor: "#fff",
    padding: "0.9rem 1rem",
  },
  factLabel: {
    display: "block",
    marginBottom: "0.35rem",
    fontSize: "0.82rem",
    fontWeight: "700",
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    color: "#6b7280",
  },
  factValue: {
    fontSize: "1rem",
    color: "#111827",
  },
  contentPanel: {
    border: "1px solid #e5e7eb",
    borderRadius: "24px",
    backgroundColor: "#fff",
    padding: "1.75rem",
    boxShadow: "0 10px 28px rgba(15, 23, 42, 0.06)",
  },
  kicker: {
    margin: 0,
    fontSize: "0.82rem",
    fontWeight: "700",
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    color: "#c0392b",
  },
  title: {
    margin: "0.4rem 0 0.45rem",
    fontSize: "2rem",
    lineHeight: 1.1,
    color: "#111827",
  },
  subtitle: {
    margin: 0,
    fontSize: "1rem",
    color: "#4b5563",
  },
  metaGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
    gap: "0.85rem",
    marginTop: "1.35rem",
  },
  metaItem: {
    border: "1px solid #e5e7eb",
    borderRadius: "16px",
    padding: "0.9rem 1rem",
    backgroundColor: "#f9fafb",
  },
  metaLabel: {
    display: "block",
    marginBottom: "0.3rem",
    fontSize: "0.8rem",
    fontWeight: "700",
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    color: "#6b7280",
  },
  metaValue: {
    fontSize: "0.98rem",
    color: "#111827",
  },
  actions: {
    display: "flex",
    flexWrap: "wrap",
    gap: "0.75rem",
    marginTop: "1.5rem",
  },
  primaryButton: {
    border: "none",
    borderRadius: "999px",
    padding: "0.9rem 1.25rem",
    backgroundColor: "#c0392b",
    color: "#fff",
    fontSize: "0.95rem",
    fontWeight: "700",
    cursor: "pointer",
  },
  secondaryButton: {
    border: "1px solid #d1d5db",
    borderRadius: "999px",
    padding: "0.9rem 1.25rem",
    backgroundColor: "#fff",
    color: "#111827",
    fontSize: "0.95rem",
    fontWeight: "700",
    cursor: "pointer",
  },
  backLink: {
    display: "inline-block",
    marginTop: "1.5rem",
    color: "#c0392b",
    fontWeight: "700",
  },
  missingCard: {
    maxWidth: "720px",
    margin: "0 auto",
    padding: "2rem",
    borderRadius: "24px",
    border: "1px solid #e5e7eb",
    backgroundColor: "#fff",
    boxShadow: "0 10px 28px rgba(15, 23, 42, 0.06)",
  },
  description: {
    margin: "1rem 0 0",
    fontSize: "1rem",
    lineHeight: 1.7,
    color: "#4b5563",
  },
};
