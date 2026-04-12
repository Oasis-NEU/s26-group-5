import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import BookCarousel from "../components/BookCarousel";
import UserCarousel from "../components/UserCarousel";
import HeroPoster from "../components/HeroPoster";
import Banner from "../components/Banner";
import { SAMPLE_BOOKS } from "../data/books";
import { SAMPLE_USERS } from "../data/users";
import "./HomePage.css";

const CATEGORIES_TOP = [
  { title: "Featured", description: "Hand-picked listings our community is loving right now." },
  { title: "New Listings", description: "Fresh arrivals just added." },
];

const CATEGORIES_MID = [
  { title: "Mystery", description: "Puzzles, suspense, and twists you won't see coming." },
  { title: "Romance", description: "Stories of love, longing, and everything in between." },
];

const CATEGORIES_BOTTOM = [
  { title: "Historical Fiction", description: "The past brought to life through unforgettable characters." },
  { title: "Horror", description: "Spine-chilling reads for those who dare to turn the page." },
  { title: "Sci-Fi", description: "Worlds beyond imagination, from dystopias to deep space." },
  { title: "Textbooks", description: "Academic titles for students — swap last semester's books for next semester's." },
];

function toId(title) {
  return title.toLowerCase().replace(/\s+/g, "-");
}

export default function HomePage() {
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const el = document.getElementById(location.hash.slice(1));
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [location.hash]);

  return (
    <main className="home-page">

      <HeroPoster />

      {CATEGORIES_TOP.map((cat) => (
        <BookCarousel key={cat.title} id={toId(cat.title)} title={cat.title} description={cat.description} books={SAMPLE_BOOKS} />
      ))}

      <UserCarousel users={SAMPLE_USERS} />

      {CATEGORIES_MID.map((cat) => (
        <BookCarousel key={cat.title} id={toId(cat.title)} title={cat.title} description={cat.description} books={SAMPLE_BOOKS} />
      ))}

      <Banner
        eyebrow="Exchange guide"
        headline="Trade books with readers near you."
        sub="List a book you're done with, browse what others are offering, and send a trade request. If they agree, you both trade and enjoy something new."
        buttonText="How to Exchange"
        buttonTo="/trade"
      />

      {CATEGORIES_BOTTOM.map((cat) => (
        <BookCarousel key={cat.title} id={toId(cat.title)} title={cat.title} description={cat.description} books={SAMPLE_BOOKS} />
      ))}

    </main>
  );
}
