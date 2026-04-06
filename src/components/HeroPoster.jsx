import { Link } from "react-router-dom";

export default function HeroPoster({
  eyebrow = "Buy & Sell Textbooks",
  headline = <>Your next read<br />is one click away.</>,
  sub = "Browse thousands of used and like-new books listed by students just like you — at prices that won't hurt your wallet.",
  ctaLabel = "Browse all books",
  ctaTo = "/browse",
}) {
  return (
    <section style={styles.poster}>
      <div style={styles.inner}>
        <p style={styles.eyebrow}>{eyebrow}</p>
        <h1 style={styles.headline}>{headline}</h1>
        <p style={styles.sub}>{sub}</p>
        <Link to={ctaTo} style={styles.cta}>{ctaLabel}</Link>
      </div>
    </section>
  );
}

const styles = {
  poster: {
    margin: "6vh 0 6vh",
    background: "linear-gradient(135deg, #111827 0%, #1f2937 60%, #c0392b 160%)",
    minHeight: "40vh",
    borderRadius: "1.2vw",
    display: "flex",
    alignItems: "center",
  },
  inner: {
    padding: "5vh 4vw",
  },
  eyebrow: {
    margin: "0 0 1.2vh",
    fontSize: "0.78vw",
    fontWeight: "700",
    letterSpacing: "0.16em",
    textTransform: "uppercase",
    color: "#f87171",
  },
  headline: {
    margin: "0 0 2vh",
    fontFamily: "'Boldonse', sans-serif",
    fontSize: "4.2vw",
    lineHeight: 1.22,
    color: "#f9fafb",
    letterSpacing: "-0.01em",
  },
  sub: {
    margin: "0 0 3.2vh",
    fontSize: "1vw",
    lineHeight: 1.7,
    color: "#d1d5db",
    maxWidth: "38vw",
  },
  cta: {
    display: "inline-block",
    padding: "1vh 1.8vw",
    borderRadius: "0.5vw",
    backgroundColor: "#c0392b",
    color: "#fff",
    fontSize: "0.82vw",
    fontWeight: "700",
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    textDecoration: "none",
    transition: "background-color 0.15s ease",
  },
};
