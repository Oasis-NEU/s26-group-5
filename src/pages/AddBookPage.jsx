import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import "./AddBookPage.css";

const CONDITIONS = ["Like New", "Good", "Acceptable"];
const CONDITION_HINTS = {
  "Like New": "Barely read — no marks or damage.",
  "Good": "Some wear but fully readable, no missing pages.",
  "Acceptable": "Noticeable wear, but complete and readable.",
};

export default function AddBookPage() {
  const navigate = useNavigate();
  const location = useLocation();

  // Pre-populate when coming from "List for Trade" in My Library
  useEffect(() => {
    const state = location.state;
    if (!state?.book) return;
    const { book, condition: preCondition, notes: preNotes } = state;
    setSelectedBook({
      id: book.google_books_id,
      _supabaseBookId: book.id,
      volumeInfo: {
        title: book.title,
        authors: book.authors || [],
        imageLinks: book.thumbnail ? { thumbnail: book.thumbnail } : undefined,
        publishedDate: book.published_date,
        categories: book.genre ? [book.genre] : [],
      },
    });
    if (preCondition) setCondition(preCondition);
    if (preNotes) setSellerNotes(preNotes);
    setDestination("trade");
  }, []);

  // Search
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);

  // Selected book
  const [selectedBook, setSelectedBook] = useState(null);

  // Form fields
  const [condition, setCondition] = useState(CONDITIONS[0]);
  const [sellerNotes, setSellerNotes] = useState("");
  const [photos, setPhotos] = useState([]); // [{ file, url }]
  const [destination, setDestination] = useState("library"); // "library" | "trade"

  // Submit
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const photoInputRef = useRef(null);

  useEffect(() => {
    if (submitted) window.scrollTo({ top: 0, behavior: "smooth" });
  }, [submitted]);

  async function handleSearch() {
    if (!query.trim()) return;
    setSearching(true);
    setResults([]);
    const apiKey = import.meta.env.VITE_GOOGLE_BOOKS_API_KEY;
    const res = await fetch(
      `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=6&key=${apiKey}`
    );
    const data = await res.json();
    setResults(data.items || []);
    setSearching(false);
  }

  function selectBook(item) {
    setSelectedBook(item);
    setResults([]);
    setQuery("");
  }

  function handlePhotoAdd(e) {
    const files = Array.from(e.target.files);
    const newPhotos = files.map((file) => ({ file, url: URL.createObjectURL(file) }));
    setPhotos((prev) => [...prev, ...newPhotos].slice(0, 6));
    e.target.value = "";
  }

  function removePhoto(idx) {
    setPhotos((prev) => prev.filter((_, i) => i !== idx));
  }

  async function handleSubmit() {
    if (!selectedBook || !destination) return;
    setSubmitting(true);
    setSubmitError(null);

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      setSubmitError("You must be logged in to add a book.");
      setSubmitting(false);
      return;
    }

    const info = selectedBook.volumeInfo;

    // If coming from My Library the book already exists — skip the upsert
    let bookId = selectedBook._supabaseBookId ?? null;

    if (!bookId) {
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
            genre: info.categories?.[0] || null,
          },
          { onConflict: "google_books_id" }
        )
        .select("id")
        .single();

      if (bookError) {
        setSubmitError("Failed to save book: " + bookError.message);
        setSubmitting(false);
        return;
      }
      bookId = bookData.id;
    }

    if (destination === "library") {
      const { error: linkError } = await supabase
        .from("user_books")
        .upsert(
          { user_id: session.user.id, book_id: bookId, condition, notes: sellerNotes || null },
          { onConflict: "user_id,book_id" }
        );
      if (linkError) {
        setSubmitError("Failed to add to library: " + linkError.message);
        setSubmitting(false);
        return;
      }
    } else {
      const { error: listingError } = await supabase
        .from("listings")
        .insert({
          user_id: session.user.id,
          book_id: bookId,
          condition,
          seller_notes: sellerNotes || null,
          status: "active",
        });
      if (listingError) {
        setSubmitError("Failed to create listing: " + listingError.message);
        setSubmitting(false);
        return;
      }
    }

    setSubmitting(false);
    setSubmitted(true);
  }

  function resetForm() {
    setSelectedBook(null);
    setQuery("");
    setResults([]);
    setCondition(CONDITIONS[0]);
    setSellerNotes("");
    setPhotos([]);
    setDestination("library");
    setSubmitted(false);
    setSubmitError(null);
  }

  const info          = selectedBook?.volumeInfo;
  const fromLibrary   = !!selectedBook?._supabaseBookId;
  const isListingMode = destination === "trade" || fromLibrary;
  const canSubmit     = !!selectedBook && !!destination &&
    (!isListingMode || sellerNotes.trim().length > 0);

  // ── Success screen ────────────────────────────────────────
  if (submitted) {
    const destinationMsg =
      destination === "library" ? "Added to your library." : "Listed for trade.";

    return (
      <div className="add-book-page">
        <div className="add-book-success">
          <div className="add-book-success-icon">✓</div>
          <h2>Book added!</h2>
          <p>{destinationMsg}</p>
          <div className="add-book-success-actions">
            <button className="abp-btn-primary" onClick={() => navigate("/library")}>
              Go to My Library
            </button>
            <button className="abp-btn-ghost" onClick={resetForm}>
              Add Another
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Main page ─────────────────────────────────────────────
  return (
    <div className="add-book-page">
      <div className="add-book-inner">

        {/* Header */}
        <div className="add-book-header">
          <button className="add-book-back" onClick={() => navigate(-1)}>
            ← Back
          </button>
          <h1 className="add-book-title">{fromLibrary ? "List for Trade" : "Add a Book"}</h1>
          <p className="add-book-subtitle">
            {fromLibrary
              ? "Fill in the details for your listing — condition and notes are required."
              : "Search for your book, fill in the details, and choose where it goes."}
          </p>
        </div>

        {/* Step 1: Search */}
        {!selectedBook && (
          <section className="add-book-section">
            <div className="add-book-search-row">
              <input
                type="text"
                className="add-book-search-input"
                placeholder="Search by title or author..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
              <button className="abp-btn-primary" onClick={handleSearch} disabled={searching}>
                {searching ? "Searching..." : "Search"}
              </button>
            </div>

            {results.length > 0 && (
              <ul className="add-book-results">
                {results.map((item) => {
                  const v = item.volumeInfo;
                  return (
                    <li key={item.id} className="add-book-result-item" onClick={() => selectBook(item)}>
                      {v.imageLinks?.thumbnail ? (
                        <img src={v.imageLinks.thumbnail} alt="cover" className="add-book-result-thumb" />
                      ) : (
                        <div className="add-book-result-thumb add-book-result-thumb--empty" />
                      )}
                      <div className="add-book-result-info">
                        <div className="add-book-result-title">{v.title}</div>
                        <div className="add-book-result-author">{v.authors?.join(", ")}</div>
                        <div className="add-book-result-year">{v.publishedDate?.slice(0, 4)}</div>
                      </div>
                      <span className="add-book-result-cta">Select →</span>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        )}

        {/* Step 2: Form */}
        {selectedBook && (
          <div className="add-book-form-layout">

            {/* Left: selected book preview */}
            <aside className="add-book-preview">
              <div className="add-book-preview-cover">
                {info.imageLinks?.thumbnail ? (
                  <img src={info.imageLinks.thumbnail} alt="cover" />
                ) : (
                  <div className="add-book-preview-no-cover">No Cover</div>
                )}
              </div>
              <div className="add-book-preview-meta">
                <div className="add-book-preview-book-title">{info.title}</div>
                {info.authors && (
                  <div className="add-book-preview-author">{info.authors.join(", ")}</div>
                )}
                {info.publishedDate && (
                  <div className="add-book-preview-detail">{info.publishedDate.slice(0, 4)}</div>
                )}
                {info.categories?.[0] && (
                  <div className="add-book-preview-detail">{info.categories[0]}</div>
                )}
              </div>
              {!fromLibrary && (
                <button
                  className="add-book-change-btn"
                  onClick={() => { setSelectedBook(null); setResults([]); }}
                >
                  Change book
                </button>
              )}
            </aside>

            {/* Right: form fields */}
            <div className="add-book-form">

              {/* Condition */}
              <div className="add-book-field">
                <span className="add-book-label">
                  Condition{" "}
                  {isListingMode
                    ? <span className="add-book-required">*</span>
                    : <span className="add-book-optional">(optional)</span>}
                </span>
                <div className="abp-condition-btns">
                  {CONDITIONS.map((c) => (
                    <button
                      key={c}
                      className={`abp-condition-btn${condition === c ? " active" : ""}`}
                      onClick={() => setCondition(c)}
                    >
                      {c}
                    </button>
                  ))}
                </div>
                <p className="abp-condition-hint">{CONDITION_HINTS[condition]}</p>
              </div>

              {/* Seller notes */}
              <div className="add-book-field">
                <span className="add-book-label">
                  Seller Notes{" "}
                  {isListingMode
                    ? <span className="add-book-required">*</span>
                    : <span className="add-book-optional">(optional)</span>}
                </span>
                <textarea
                  className="add-book-textarea"
                  placeholder="Describe the book's condition in more detail, any highlights, damage, inscription, etc."
                  value={sellerNotes}
                  onChange={(e) => setSellerNotes(e.target.value)}
                  rows={4}
                />
              </div>

              {/* Photos — optional for all, view only for now */}
              <div className="add-book-field">
                <span className="add-book-label">
                  Photos <span className="add-book-optional">(optional, up to 6)</span>
                </span>
                <div className="add-book-photos">
                  {photos.map((p, i) => (
                    <div key={i} className="add-book-photo-thumb">
                      <img src={p.url} alt={`photo ${i + 1}`} />
                      <button className="add-book-photo-remove" onClick={() => removePhoto(i)}>
                        ×
                      </button>
                    </div>
                  ))}
                  {photos.length < 6 && (
                    <button
                      className="add-book-photo-add"
                      onClick={() => photoInputRef.current?.click()}
                    >
                      <span className="add-book-photo-add-icon">+</span>
                      Add Photo
                    </button>
                  )}
                  <input
                    ref={photoInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    style={{ display: "none" }}
                    onChange={handlePhotoAdd}
                  />
                </div>
              </div>

              {/* Where to add — hidden when coming from library (always listing for trade) */}
              {!fromLibrary && <div className="add-book-field">
                <span className="add-book-label">Where to add</span>
                <div className="add-book-checkboxes">
                  <label className={`add-book-checkbox-row${destination === "library" ? " checked" : ""}`}>
                    <input
                      type="radio"
                      name="destination"
                      checked={destination === "library"}
                      onChange={() => setDestination("library")}
                    />
                    <div className="add-book-checkbox-text">
                      <span className="add-book-checkbox-title">My Library</span>
                      <span className="add-book-checkbox-desc">
                        Adds to your personal bookcase for display
                      </span>
                    </div>
                  </label>
                  <label className={`add-book-checkbox-row${destination === "trade" ? " checked" : ""}`}>
                    <input
                      type="radio"
                      name="destination"
                      checked={destination === "trade"}
                      onChange={() => setDestination("trade")}
                    />
                    <div className="add-book-checkbox-text">
                      <span className="add-book-checkbox-title">List for Trade</span>
                      <span className="add-book-checkbox-desc">
                        Makes this book visible to others who want to propose a trade
                      </span>
                    </div>
                  </label>
                </div>
              </div>}

              {submitError && <p className="add-book-checkbox-error">{submitError}</p>}
              <button
                className="abp-btn-primary add-book-submit"
                onClick={handleSubmit}
                disabled={!canSubmit || submitting}
              >
                {submitting
                  ? (fromLibrary ? "Listing..." : "Adding...")
                  : (fromLibrary ? "Create Listing" : "Add Book")}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
