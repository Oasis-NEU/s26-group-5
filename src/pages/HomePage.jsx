import BookCarousel from "../components/BookCarousel";
import UserCarousel from "../components/UserCarousel";
import HeroPoster from "../components/HeroPoster";
import { SAMPLE_BOOKS } from "../data/books";
import { SAMPLE_USERS } from "../data/users";
import "./HomePage.css";

const CATEGORIES = [
  { title: "Featured", description: "Hand-picked listings our community is loving right now." },
  { title: "New Postings", description: "Fresh arrivals just added — be the first to grab them." },
  { title: "Nonfiction", description: "True stories, real knowledge, and ideas that challenge how you see the world." },
  { title: "Mystery", description: "Puzzles, suspense, and twists you won't see coming." },
  { title: "Romance", description: "Stories of love, longing, and everything in between." },
  { title: "Sci-Fi", description: "Worlds beyond imagination, from dystopias to deep space." },
];

export default function HomePage() {
  return (
    <main className="home-page">

      <HeroPoster />

      {CATEGORIES.map((cat) => (
        <BookCarousel key={cat.title} title={cat.title} description={cat.description} books={SAMPLE_BOOKS} />
      ))}

      <UserCarousel users={SAMPLE_USERS} />

    </main>
  );
}
