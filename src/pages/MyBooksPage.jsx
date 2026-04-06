import { useState, useEffect, useRef } from "react";
import { supabase } from "../lib/supabaseClient";
import Auth from "../components/Auth";
import "./MyBooksPage.css";

const CONDITIONS = ["Like New", "Good", "Acceptable"];
const BOOKS_PER_SHELF = 12;
const MIN_SHELVES = 3;

// Deterministic spine color from title
const SPINE_COLORS = [
  "#1e3a5f",
  "#3b1f5e",
  "#1f5e3b",
  "#5e3b1f",
  "#5e1f1f",
  "#1f4a5e",
  "#4a2060",
  "#1a5632",
  "#7d3c00",
  "#1b2631",
  "#283747",
  "#512e5f",
  "#145a32",
  "#6e2f0a",
  "#4a0e0e",
  "#0b3d40",
  "#3d2b0b",
  "#2b0b3d",
  "#0b3d1a",
  "#3d0b2b",
];

function hashStr(str = "") {
  let h = 0;
  for (let i = 0; i < str.length; i++)
    h = (str.charCodeAt(i) + ((h << 5) - h)) | 0;
  return Math.abs(h);
}

function spineColor(title) {
  return SPINE_COLORS[hashStr(title) % SPINE_COLORS.length];
}

function spineDimensions(title) {
  const h = hashStr(title);
  const heights = [142, 148, 154, 160, 165, 170, 156, 146];
  const widths = [28, 32, 36, 38, 34, 30, 40, 26];
  return {
    height: heights[h % heights.length],
    width: widths[(h >> 4) % widths.length],
  };
}

// Compute where to render the fixed popup so it stays in the viewport
const POPUP_W = 210;
const POPUP_H = 360; // approximate max height
const POPUP_GAP = 14;

function computePopupStyle(rect) {
  if (!rect) return {};

  // Horizontal: center on spine, clamp to viewport
  let left = rect.left + rect.width / 2 - POPUP_W / 2;
  left = Math.max(8, Math.min(left, window.innerWidth - POPUP_W - 8));

  // Vertical: prefer above the spine, fall back to below
  let top = rect.top - POPUP_H - POPUP_GAP;
  if (top < 8) top = rect.bottom + POPUP_GAP;

  return { top, left };
}

export default function MyBooksPage() {
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [showLogin, setShowLogin] = useState(false);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setAuthLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (!session) setBooks([]);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Search / add state
  const [showSearch, setShowSearch] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [condition, setCondition] = useState(CONDITIONS[0]);
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState(null);

  // Edit state
  const [editingId, setEditingId] = useState(null);
  const [editCondition, setEditCondition] = useState("");
  const [saving, setSaving] = useState(false);

  // Hover popup state — fixed positioning to avoid overflow clipping
  const [hoveredEntry, setHoveredEntry] = useState(null);
  const [popupRect, setPopupRect] = useState(null);
  const leaveTimer = useRef(null);

  useEffect(() => {
    if (session) fetchBooks();
  }, [session]);

  // ── Fetch ────────────────────────────────────────────────

  async function fetchBooks() {
    setLoading(true);
    const { data, error } = await supabase
      .from("user_books")
      .select(
        "id, condition, created_at, book:books(id, google_books_id, title, authors, thumbnail, published_date)"
      )
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false });

    if (!error) setBooks(data || []);
    setLoading(false);
  }

  // ── Search ───────────────────────────────────────────────

  async function searchBooks() {
    if (!query.trim()) return;
    setSearching(true);
    setResults([]);
    setSelectedBook(null);

    const apiKey = import.meta.env.VITE_GOOGLE_BOOKS_API_KEY;
    const res = await fetch(
      `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(
        query
      )}&maxResults=6&key=${apiKey}`
    );
    const data = await res.json();
    setResults(data.items || []);
    setSearching(false);
  }

  // ── Add book ─────────────────────────────────────────────

  async function addBook() {
    if (!selectedBook) return;
    setAdding(true);
    setAddError(null);

    const info = selectedBook.volumeInfo;

    const { data: bookData, error: bookError } = await supabase
      .from("books")
      .upsert(
        {
          google_books_id: selectedBook.id,
          title: info.title,
          authors: info.authors || [],
          description: info.description || null,
          thumbnail: info.imageLinks?.thumbnail || null,
          published_date: info.publishedDate || null,
          page_count: info.pageCount || null,
          categories: info.categories || [],
        },
        { onConflict: "google_books_id" }
      )
      .select("id")
      .single();

    if (bookError) {
      setAddError("Failed to save book: " + bookError.message);
      setAdding(false);
      return;
    }

    const { error: linkError } = await supabase
      .from("user_books")
      .upsert(
        { user_id: session.user.id, book_id: bookData.id, condition },
        { onConflict: "user_id,book_id" }
      );

    if (linkError) {
      setAddError("Failed to add to library: " + linkError.message);
      setAdding(false);
      return;
    }

    cancelSearch();
    setAdding(false);
    fetchBooks();
  }

  function cancelSearch() {
    setShowSearch(false);
    setQuery("");
    setResults([]);
    setSelectedBook(null);
    setCondition(CONDITIONS[0]);
    setAddError(null);
  }

  // ── Edit ─────────────────────────────────────────────────

  function startEditing(entry) {
    setEditingId(entry.id);
    setEditCondition(entry.condition || CONDITIONS[0]);
  }

  async function saveEdit(entryId) {
    setSaving(true);
    const { error } = await supabase
      .from("user_books")
      .update({ condition: editCondition })
      .eq("id", entryId);

    if (!error) {
      setBooks((prev) =>
        prev.map((b) =>
          b.id === entryId ? { ...b, condition: editCondition } : b
        )
      );
      setEditingId(null);
    }
    setSaving(false);
  }

  // ── Remove ────────────────────────────────────────────────

  async function removeBook(entryId) {
    setHoveredEntry(null);
    await supabase.from("user_books").delete().eq("id", entryId);
    setBooks((prev) => prev.filter((b) => b.id !== entryId));
  }

  async function signOut() {
    await supabase.auth.signOut();
  }

  // ── Hover handlers ────────────────────────────────────────
  // Use a short leave-timer so the user can move from spine → popup
  // without the card disappearing.

  function onBookEnter(entry, e) {
    clearTimeout(leaveTimer.current);
    const rect = e.currentTarget.getBoundingClientRect();
    setHoveredEntry(entry);
    setPopupRect(rect);
  }

  function onBookLeave() {
    leaveTimer.current = setTimeout(() => setHoveredEntry(null), 120);
  }

  function onPopupEnter() {
    clearTimeout(leaveTimer.current);
  }

  function onPopupLeave() {
    leaveTimer.current = setTimeout(() => setHoveredEntry(null), 120);
  }

  if (authLoading) return null;

  // Group books into shelves, always show at least MIN_SHELVES rows
  const shelves = [];
  for (let i = 0; i < books.length; i += BOOKS_PER_SHELF) {
    shelves.push(books.slice(i, i + BOOKS_PER_SHELF));
  }
  while (shelves.length < MIN_SHELVES) shelves.push([]);

  const isEditing = hoveredEntry ? editingId === hoveredEntry.id : false;
  const popupStyle = computePopupStyle(popupRect);

  // ── Render ────────────────────────────────────────────────

  return (
    <div className="lib-page">
      {/* Header */}
      <header className="lib-header">
        <h1 className="lib-title">My Library</h1>
        <div className="lib-header-actions">
          {session ? (
            <>
              {!showSearch && (
                <button
                  className="btn-primary"
                  onClick={() => setShowSearch(true)}
                >
                  + Add Book
                </button>
              )}
              <button className="btn-ghost" onClick={signOut}>
                Sign Out
              </button>
            </>
          ) : (
            <button
              className="btn-primary"
              onClick={() => setShowLogin((v) => !v)}
            >
              Sign In
            </button>
          )}
          {showLogin && <Auth onClose={() => setShowLogin(false)} />}
        </div>
      </header>

      {/* Search / Add Panel */}
      {showSearch && (
        <div className="lib-search-panel">
          <h2>Find a Book</h2>

          <div className="search-row">
            <input
              type="text"
              placeholder="Search by title or author..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && searchBooks()}
            />
            <button className="btn-primary" onClick={searchBooks}>
              Search
            </button>
          </div>

          {searching && (
            <p style={{ color: "#8c7055", fontSize: 14, margin: 0 }}>
              Searching...
            </p>
          )}

          {results.length > 0 && (
            <ul className="result-list">
              {results.map((item) => {
                const isSelected = selectedBook?.id === item.id;
                return (
                  <li
                    key={item.id}
                    className={`result-item${isSelected ? " selected" : ""}`}
                    onClick={() => setSelectedBook(isSelected ? null : item)}
                  >
                    {item.volumeInfo.imageLinks?.thumbnail && (
                      <img
                        src={item.volumeInfo.imageLinks.thumbnail}
                        alt="cover"
                        style={{
                          width: 48,
                          objectFit: "contain",
                          flexShrink: 0,
                          borderRadius: 3,
                        }}
                      />
                    )}
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: 14 }}>
                        {item.volumeInfo.title}
                      </div>
                      <div style={{ color: "#6b7280", fontSize: 13 }}>
                        {item.volumeInfo.authors?.join(", ")}
                      </div>
                      <div style={{ color: "#9ca3af", fontSize: 12 }}>
                        {item.volumeInfo.publishedDate}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}

          {selectedBook && (
            <div className="confirm-box">
              <div style={{ fontWeight: 700, marginBottom: 12 }}>
                "{selectedBook.volumeInfo.title}"
              </div>

              <span className="label-sm">Condition</span>
              <div className="condition-btns">
                {CONDITIONS.map((c) => (
                  <button
                    key={c}
                    className={`condition-btn${
                      condition === c ? " active" : ""
                    }`}
                    onClick={() => setCondition(c)}
                  >
                    {c}
                  </button>
                ))}
              </div>
              <p className="condition-hint">
                {condition === "Like New" &&
                  "Barely read — no marks or damage."}
                {condition === "Good" &&
                  "Some wear but fully readable, no missing pages."}
                {condition === "Acceptable" &&
                  "Noticeable wear, but complete and readable."}
              </p>

              {addError && <p className="add-error">{addError}</p>}

              <div className="add-actions">
                <button
                  className="btn-primary"
                  onClick={addBook}
                  disabled={adding}
                >
                  {adding ? "Adding..." : "Add to My Library"}
                </button>
                <button className="btn-ghost" onClick={cancelSearch}>
                  Cancel
                </button>
              </div>
            </div>
          )}

          {!selectedBook && (
            <button
              className="btn-ghost"
              style={{ marginTop: 10 }}
              onClick={cancelSearch}
            >
              Cancel
            </button>
          )}
        </div>
      )}

      {/* Bookcase */}
      <div className="lib-shelves">
        <div className="bookcase-outer">
          <div className="bookcase">
            <div className="bookcase-crown" />

            {shelves.map((shelfBooks, shelfIdx) => (
              <div className="bookcase-row" key={shelfIdx}>
                <div className="shelf-interior">
                  {shelfIdx === 0 && !session && (
                    <p className="shelf-empty-msg">
                      Sign in to start building your library
                    </p>
                  )}
                  {shelfIdx === 0 && session && loading && (
                    <p className="shelf-empty-msg">Loading your books...</p>
                  )}
                  {shelfIdx === 0 &&
                    session &&
                    !loading &&
                    books.length === 0 && (
                      <p className="shelf-empty-msg">
                        Your shelf is empty — add a book to get started
                      </p>
                    )}

                  {shelfBooks.map((entry) => {
                    const book = entry.book;
                    const { height, width } = spineDimensions(book.title);
                    const color = spineColor(book.title);
                    const isActive = hoveredEntry?.id === entry.id;

                    return (
                      <div
                        className={`book${isActive ? " book-active" : ""}`}
                        key={entry.id}
                        onMouseEnter={(e) => onBookEnter(entry, e)}
                        onMouseLeave={onBookLeave}
                      >
                        <div
                          className="book-spine"
                          style={{ background: color, height, width }}
                        >
                          <span className="book-spine-title">{book.title}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="shelf-plank" />
              </div>
            ))}

            <div className="bookcase-base" />
          </div>
        </div>
      </div>

      {/* Fixed popup — rendered outside bookcase so it's never clipped */}
      {hoveredEntry && (
        <div
          className="book-popup-fixed"
          style={popupStyle}
          onMouseEnter={onPopupEnter}
          onMouseLeave={onPopupLeave}
        >
          {hoveredEntry.book.thumbnail ? (
            <img src={hoveredEntry.book.thumbnail} alt="cover" />
          ) : (
            <div className="book-card-no-cover">No Cover</div>
          )}

          <div className="book-card-title">{hoveredEntry.book.title}</div>
          <div className="book-card-author">
            {hoveredEntry.book.authors?.join(", ")}
          </div>
          {hoveredEntry.book.published_date && (
            <div className="book-card-year">
              {hoveredEntry.book.published_date.slice(0, 4)}
            </div>
          )}

          {isEditing ? (
            <div className="book-edit-form">
              <select
                value={editCondition}
                onChange={(e) => setEditCondition(e.target.value)}
              >
                {CONDITIONS.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
              <div className="book-card-actions">
                <button
                  className="btn-edit"
                  onClick={() => saveEdit(hoveredEntry.id)}
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save"}
                </button>
                <button
                  className="btn-remove"
                  onClick={() => setEditingId(null)}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              {hoveredEntry.condition && (
                <span className="book-card-condition">
                  {hoveredEntry.condition}
                </span>
              )}
              <div className="book-card-actions">
                <button
                  className="btn-edit"
                  onClick={() => startEditing(hoveredEntry)}
                >
                  Edit
                </button>
                <button
                  className="btn-remove"
                  onClick={() => removeBook(hoveredEntry.id)}
                >
                  Remove
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
