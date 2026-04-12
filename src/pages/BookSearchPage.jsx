import { useState } from "react";
import { supabase } from "../lib/supabaseClient";

function BookSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [saved, setSaved] = useState(null);
  const [loading, setLoading] = useState(false);

  async function searchBooks() {
    if (!query) return;
    setLoading(true);
    setResults([]);
    setSaved(null);

    const apiKey = import.meta.env.VITE_GOOGLE_BOOKS_API_KEY;
    const res = await fetch(
      `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(
        query
      )}&maxResults=5&key=${apiKey}`
    );
    const data = await res.json();
    setResults(data.items || []);
    setLoading(false);
  }

  async function saveBook(item) {
    const info = item.volumeInfo;

    const book = {
      google_books_id: item.id,
      title: info.title,
      authors: info.authors || [],
      description: info.description || null,
      thumbnail: info.imageLinks?.thumbnail || null,
      published_date: info.publishedDate || null,
      page_count: info.pageCount || null,
      categories: info.categories || [],
      genre: info.categories?.[0] || null,
    };

    const { error } = await supabase
      .from("books")
      .upsert(book, { onConflict: "google_books_id" });

    if (error) {
      alert("Error saving book: " + error.message);
    } else {
      setSaved(book.title);
      setResults([]);
      setQuery("");
    }
  }

  return (
    <div
      style={{
        maxWidth: 600,
        margin: "40px auto",
        fontFamily: "sans-serif",
        padding: "0 20px",
      }}
    >
      <h1>Book Exchange</h1>
      <p>Search for a book to add to the database.</p>

      <div style={{ display: "flex", gap: 8 }}>
        <input
          type="text"
          placeholder="Search by title or author..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && searchBooks()}
          style={{ flex: 1, padding: "8px 12px", fontSize: 16 }}
        />
        <button
          onClick={searchBooks}
          style={{ padding: "8px 16px", fontSize: 16 }}
        >
          Search
        </button>
      </div>

      {loading && <p>Searching...</p>}
      {saved && <p style={{ color: "green" }}>"{saved}" saved to database!</p>}

      <ul style={{ listStyle: "none", padding: 0, marginTop: 16 }}>
        {results.map((item) => (
          <li
            key={item.id}
            style={{
              border: "1px solid #ddd",
              borderRadius: 8,
              padding: 12,
              marginBottom: 8,
              display: "flex",
              gap: 12,
            }}
          >
            {item.volumeInfo.imageLinks?.thumbnail && (
              <img
                src={item.volumeInfo.imageLinks.thumbnail}
                alt="cover"
                style={{ width: 60, objectFit: "contain" }}
              />
            )}
            <div style={{ flex: 1 }}>
              <strong>{item.volumeInfo.title}</strong>
              <div style={{ color: "#555", fontSize: 14 }}>
                {item.volumeInfo.authors?.join(", ")}
              </div>
              <div style={{ color: "#888", fontSize: 13 }}>
                {item.volumeInfo.publishedDate}
              </div>
            </div>
            <button
              onClick={() => saveBook(item)}
              style={{ alignSelf: "center", padding: "6px 12px" }}
            >
              Add
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default BookSearch;
