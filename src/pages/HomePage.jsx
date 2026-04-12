import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import BookCarousel from "../components/BookCarousel";
import UserCarousel from "../components/UserCarousel";
import HeroPoster from "../components/HeroPoster";
import Banner from "../components/Banner";
import { SAMPLE_USERS } from "../data/users";
import { supabase } from "../lib/supabaseClient";
import "./HomePage.css";

const GENRE_MAP = {
  "Mystery":            ["mystery", "detective", "thriller", "crime"],
  "Romance":            ["romance"],
  "Fiction":            ["fiction"],
  "Horror":             ["horror"],
  "Sci-Fi":             ["science fiction", "sci-fi", "space opera"],
  "Textbooks":          ["textbook", "education", "study guide"],
};

const CATEGORIES_TOP = [
  { title: "Featured",     description: "Hand-picked listings our community is loving right now." },
  { title: "New Listings", description: "Fresh arrivals just added." },
];

const CATEGORIES_MID = [
  { title: "Mystery", description: "Puzzles, suspense, and twists you won't see coming." },
  { title: "Romance", description: "Stories of love, longing, and everything in between." },
];

const CATEGORIES_BOTTOM = [
  { title: "Fiction",    description: "The past brought to life through unforgettable characters." },
  { title: "Horror",     description: "Spine-chilling reads for those who dare to turn the page." },
  { title: "Sci-Fi",     description: "Worlds beyond imagination, from dystopias to deep space." },
  { title: "Textbooks",  description: "Academic titles for students — swap last semester's books for next semester's." },
];

function toId(title) {
  return title.toLowerCase().replace(/\s+/g, "-");
}

function forGenre(books, genre) {
  const keywords = GENRE_MAP[genre] || [genre.toLowerCase()];
  return books.filter((b) => {
    if (!b.genre) return false;
    const g = b.genre.toLowerCase();
    return keywords.some((kw) => g.includes(kw));
  });
}

function toListing(listing, usernameById) {
  const book = listing.book;
  return {
    id:           book.google_books_id,
    title:        book.title,
    author:       book.authors?.[0] ?? "Unknown Author",
    condition:    listing.condition,
    thumbnail:    book.thumbnail,
    genre:        book.genre,
    pageCount:    book.page_count,
    publishedDate: book.published_date,
    seller:       usernameById[listing.user_id] ?? "Unknown",
    notes:        listing.notes ?? null,
  };
}

export default function HomePage() {
  const location = useLocation();
  const [listings, setListings] = useState([]);

  useEffect(() => {
    if (location.hash) {
      const el = document.getElementById(location.hash.slice(1));
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [location.hash]);

  useEffect(() => {
    async function fetchListings() {
      const { data: tradeRows, error: tradeError } = await supabase
        .from("trade_listings")
        .select("id, condition, notes, book_id, user_id");

      if (tradeError) { console.error("trade_listings error:", tradeError); return; }
      if (!tradeRows?.length) return;

      const bookIds = [...new Set(tradeRows.map((r) => r.book_id))];
      const userIds = [...new Set(tradeRows.map((r) => r.user_id))];

      const [{ data: booksRows, error: booksError }, { data: usersRows, error: usersError }] =
        await Promise.all([
          supabase
            .from("books")
            .select("id, google_books_id, title, authors, thumbnail, genre, page_count, published_date")
            .in("id", bookIds),
          supabase
            .from("users")
            .select("user_id, username")
            .in("user_id", userIds),
        ]);

      if (booksError) { console.error("books error:", booksError); return; }
      if (usersError) { console.error("users error:", usersError); return; }

      const booksById    = Object.fromEntries(booksRows.map((b) => [b.id, b]));
      const usernameById = Object.fromEntries((usersRows ?? []).map((u) => [u.user_id, u.username]));

      setListings(
        tradeRows
          .filter((r) => booksById[r.book_id])
          .map((r) => toListing({ ...r, book: booksById[r.book_id] }, usernameById))
      );
    }

    fetchListings();
  }, []);

  return (
    <main className="home-page">

      <HeroPoster />

      {CATEGORIES_TOP.map((cat) => (
        <BookCarousel
          key={cat.title}
          id={toId(cat.title)}
          title={cat.title}
          description={cat.description}
          books={listings}
        />
      ))}

      <UserCarousel users={SAMPLE_USERS} />

      {CATEGORIES_MID.map((cat) => (
        <BookCarousel
          key={cat.title}
          id={toId(cat.title)}
          title={cat.title}
          description={cat.description}
          books={forGenre(listings, cat.title)}
        />
      ))}

      <Banner
        eyebrow="Exchange guide"
        headline="Trade books with readers near you."
        sub="List a book you're done with, browse what others are offering, and send a trade request. If they agree, you both trade and enjoy something new."
        buttonText="How to Exchange"
        buttonTo="/trade"
      />

      {CATEGORIES_BOTTOM.map((cat) => (
        <BookCarousel
          key={cat.title}
          id={toId(cat.title)}
          title={cat.title}
          description={cat.description}
          books={forGenre(listings, cat.title)}
        />
      ))}

    </main>
  );
}
