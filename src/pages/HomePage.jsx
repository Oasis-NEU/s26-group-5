import BookCard from "../components/BookCard";
import HeroPoster from "../components/HeroPoster";
import { SAMPLE_BOOKS } from "../data/books";

export default function HomePage() {
  return (
    <main style={styles.page}>

      <HeroPoster />

      <section style={styles.hero}>
        <div>
          <p style={styles.eyebrow}>Featured listings</p>
          <h1 style={styles.title}>Browse books people can click into and explore</h1>
          <p style={styles.description}>
            The homepage cards stay compact. Click into any listing to open a separate page with the full
            placeholder title, author, seller, condition, shipping, and description details.
          </p>
        </div>
      </section>

      <section style={styles.grid}>
        {SAMPLE_BOOKS.map((book) => (
          <BookCard key={book.title} {...book} />
        ))}
      </section>
    </main>
  );
}

const styles = {
  page: {
    padding: "0 11vw 4vh",
  },
  hero: {
    marginBottom: "4vh",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    gap: "1.5vw",
  },
  eyebrow: {
    margin: 0,
    fontSize: "0.8vw",
    fontWeight: "700",
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    color: "#c0392b",
  },
  title: {
    margin: "0.35vh 0 0.65vh",
    fontSize: "30px",
    lineHeight: 1.1,
    color: "#111827",
  },
  description: {
    margin: 0,
    maxWidth: "60vw",
    fontSize: "18px",
    lineHeight: 1.7,
    color: "#4b5563",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(6, minmax(0, 1fr))",
    gap: "1vw",
  },
};
