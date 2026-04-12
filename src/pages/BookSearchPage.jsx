import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import "./BookSearchPage.css";

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
    <div className="book-search-container">
      <h1>Book Exchange</h1>
      <p>Search for a book to add to the database.</p>

      <div className="book-search-input-row">
        <input
          type="text"
          placeholder="Search by title or author..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && searchBooks()}
          className="book-search-input"
        />
        <button onClick={searchBooks} className="book-search-btn">
          Search
        </button>
      </div>

      {loading && <p>Searching...</p>}
      {saved && <p className="book-search-saved">"{saved}" saved to database!</p>}

      <ul className="book-search-results">
        {results.map((item) => (
          <li key={item.id} className="book-search-result-item">
            {item.volumeInfo.imageLinks?.thumbnail && (
              <img
                src={item.volumeInfo.imageLinks.thumbnail}
                alt="cover"
                className="book-search-result-cover"
              />
            )}
            <div className="book-search-result-info">
              <strong>{item.volumeInfo.title}</strong>
              <div className="book-search-result-authors">
                {item.volumeInfo.authors?.join(", ")}
              </div>
              <div className="book-search-result-date">
                {item.volumeInfo.publishedDate}
              </div>
            </div>
            <button
              onClick={() => saveBook(item)}
              className="book-search-add-btn"
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
