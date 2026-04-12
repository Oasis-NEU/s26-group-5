import { Link } from "react-router-dom";
import "./HeroPoster.css";

export default function HeroPoster({
  eyebrow = "Trade Books Near You",
  headline = <>Your next read<br />is one trade away.</>,
  sub = "Browse thousands of used and like-new books listed by readers just like you — swap what you've finished for something you actually want.",
  ctaLabel = "Browse all books",
  ctaTo = "/browse",
}) {
  return (
    <section className="hero-poster">
      <div className="hero-poster-inner">
        <p className="hero-poster-eyebrow">{eyebrow}</p>
        <h1 className="hero-poster-headline">{headline}</h1>
        <p className="hero-poster-sub">{sub}</p>
        <Link to={ctaTo} className="hero-poster-cta">{ctaLabel}</Link>
      </div>
    </section>
  );
}
