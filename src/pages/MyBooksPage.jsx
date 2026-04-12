import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import "./MyBooksPage.css";

const BOOKS_PER_SHELF = 12;
const MIN_SHELVES = 3;

const SPINE_COLORS = [
  "#1e3a5f", "#3b1f5e", "#1f5e3b", "#5e3b1f", "#5e1f1f",
  "#1f4a5e", "#4a2060", "#1a5632", "#7d3c00", "#1b2631",
  "#283747", "#512e5f", "#145a32", "#6e2f0a", "#4a0e0e",
  "#0b3d40", "#3d2b0b", "#2b0b3d", "#0b3d1a", "#3d0b2b",
];

const STATUS_COLORS = {
  active:  "#16a34a",
  pending: "#d97706",
  traded:  "#6b7280",
};

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
  const widths  = [28, 32, 36, 38, 34, 30, 40, 26];
  return {
    height: heights[h % heights.length],
    width:  widths[(h >> 4) % widths.length],
  };
}

const POPUP_W = 210;
const POPUP_H = 360;
const POPUP_GAP = 14;

function computePopupStyle(rect) {
  if (!rect) return {};
  let left = rect.left + rect.width / 2 - POPUP_W / 2;
  left = Math.max(8, Math.min(left, window.innerWidth - POPUP_W - 8));
  let top = rect.top - POPUP_H - POPUP_GAP;
  if (top < 8) top = rect.bottom + POPUP_GAP;
  return { top, left };
}

export default function MyBooksPage() {
  const navigate = useNavigate();

  const [session, setSession]         = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Tabs
  const [activeTab, setActiveTab] = useState("books");

  // My Books
  const [books, setBooks]   = useState([]);
  const [loading, setLoading] = useState(true);

  // My Listings
  const [listings, setListings]               = useState([]);
  const [loadingListings, setLoadingListings] = useState(false);

  // Incoming pending trades (books I may receive)
  const [incomingTrades, setIncomingTrades] = useState([]);



  // Hover popup
  const [hoveredEntry, setHoveredEntry] = useState(null);
  const [popupRect, setPopupRect]       = useState(null);
  const leaveTimer = useRef(null);
  const hoveredEl  = useRef(null);

  // ── Auth ──────────────────────────────────────────────────

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (!session) {
        setBooks([]);
        setListings([]);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Track hovered spine position on scroll
  useEffect(() => {
    if (!hoveredEntry) return;
    function onScroll() {
      if (hoveredEl.current)
        setPopupRect(hoveredEl.current.getBoundingClientRect());
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [hoveredEntry]);

  useEffect(() => {
    if (session) {
      fetchBooks();
      fetchListings();
      fetchIncomingTrades();
    }
  }, [session]);

  // ── Fetch ─────────────────────────────────────────────────

  async function fetchBooks() {
    setLoading(true);
    const { data, error } = await supabase
      .from("user_books")
      .select("id, condition, notes, created_at, book:books(id, google_books_id, title, authors, thumbnail, published_date, genre)")
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false });
    if (!error) setBooks(data || []);
    setLoading(false);
  }

  async function fetchListings() {
    setLoadingListings(true);
    const { data, error } = await supabase
      .from("trade_listings")
      .select("id, condition, notes, status, created_at, book:books(id, title, authors, thumbnail, genre)")
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false });
    if (error) console.error("fetchListings error:", error);
    else setListings(data || []);
    setLoadingListings(false);
  }

  async function fetchIncomingTrades() {
    const { data, error } = await supabase
      .from("pending_trades")
      .select("id, old_user, book:books(id, title, authors, thumbnail, genre)")
      .eq("new_user", session.user.id);
    if (error) { console.error("fetchIncomingTrades error:", error); return; }
    setIncomingTrades(
      (data || []).map((t) => ({
        id:         `incoming-${t.id}`,
        book:       t.book,
        status:     "pending",
        isIncoming: true,
      }))
    );
  }

  // ── Edit book ─────────────────────────────────────────────

  function editBook(entry) {
    setHoveredEntry(null);
    navigate("/add-book", {
      state: {
        editEntry: {
          id: entry.id,
          book: entry.book,
          condition: entry.condition,
          notes: entry.notes,
        },
      },
    });
  }

  // ── List for Trade ────────────────────────────────────────

  function listForTrade(entry) {
    setHoveredEntry(null);
    navigate("/add-book", {
      state: { book: entry.book, condition: entry.condition, notes: entry.notes, userBookId: entry.id },
    });
  }

  // ── Remove ────────────────────────────────────────────────

  async function removeBook(entryId) {
    setHoveredEntry(null);
    await supabase.from("user_books").delete().eq("id", entryId);
    setBooks((prev) => prev.filter((b) => b.id !== entryId));
  }

  async function removeListing(listingId) {
    await supabase.from("trade_listings").delete().eq("id", listingId);
    setListings((prev) => prev.filter((l) => l.id !== listingId));
  }

  // ── Hover handlers ────────────────────────────────────────

  function onBookEnter(entry, e) {
    clearTimeout(leaveTimer.current);
    hoveredEl.current = e.currentTarget;
    setHoveredEntry(entry);
    setPopupRect(e.currentTarget.getBoundingClientRect());
  }

  function onBookLeave() {
    leaveTimer.current = setTimeout(() => setHoveredEntry(null), 120);
  }

  function onPopupEnter() { clearTimeout(leaveTimer.current); }
  function onPopupLeave() {
    leaveTimer.current = setTimeout(() => setHoveredEntry(null), 120);
  }

  if (authLoading) return null;

  const shelves = [];
  for (let i = 0; i < books.length; i += BOOKS_PER_SHELF)
    shelves.push(books.slice(i, i + BOOKS_PER_SHELF));
  while (shelves.length < MIN_SHELVES) shelves.push([]);
  // Append incoming pending trades to the last shelf of My Books
  if (incomingTrades.length > 0) {
    const last = shelves[shelves.length - 1];
    const combined = [...last, ...incomingTrades];
    shelves[shelves.length - 1] = combined.slice(0, BOOKS_PER_SHELF);
    for (let i = BOOKS_PER_SHELF; i < combined.length; i += BOOKS_PER_SHELF)
      shelves.push(combined.slice(i, i + BOOKS_PER_SHELF));
  }

  const listingShelves = [];
  for (let i = 0; i < listings.length; i += BOOKS_PER_SHELF)
    listingShelves.push(listings.slice(i, i + BOOKS_PER_SHELF));
  while (listingShelves.length < MIN_SHELVES) listingShelves.push([]);

  const isAlreadyListed = hoveredEntry
    ? listings.some((l) => l.book?.id === hoveredEntry.book.id)
    : false;
  const popupStyle = computePopupStyle(popupRect);

  // ── Render ────────────────────────────────────────────────

  return (
    <div className="lib-page">

      {/* FAB */}
      {session && (
        <button className="lib-fab-add" onClick={() => navigate("/add-book")}>
          + {activeTab === "listings" ? "Add Listing" : "Add Book"}
        </button>
      )}

      {/* ── Header ── */}
      <div className="lib-header">
        <div className="lib-header-inner">
          <h1 className="lib-page-title">My Library</h1>
          <div className="lib-tabs">
            <button
              className={`lib-tab${activeTab === "books" ? " active" : ""}`}
              onClick={() => setActiveTab("books")}
            >
              My Books
              {books.length > 0 && (
                <span className="lib-tab-count">{books.length}</span>
              )}
            </button>
            <button
              className={`lib-tab${activeTab === "listings" ? " active" : ""}`}
              onClick={() => setActiveTab("listings")}
            >
              My Listings
              {listings.length > 0 && (
                <span className="lib-tab-count">{listings.length}</span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ── My Books Tab ── */}
      {activeTab === "books" && (
        <div className="lib-shelves">
          <div className="bookcase-outer">
            <div className="bookcase">
              <div className="bookcase-crown" />

              {shelves.map((shelfBooks, shelfIdx) => (
                <div className="bookcase-row" key={shelfIdx}>
                  <div className="shelf-interior">
                    {shelfIdx === 0 && !session && (
                      <p className="shelf-empty-msg">Sign in to start building your library</p>
                    )}
                    {shelfIdx === 0 && session && loading && (
                      <p className="shelf-empty-msg">Loading your books...</p>
                    )}
                    {shelfIdx === 0 && session && !loading && books.length === 0 && (
                      <p className="shelf-empty-msg">Your shelf is empty — add a book to get started</p>
                    )}

                    {shelfBooks.map((entry) => {
                      const book = entry.book;
                      const { height, width } = spineDimensions(book.title);
                      const color    = spineColor(book.title);
                      const isActive = hoveredEntry?.id === entry.id;

                      return (
                        <div
                          className={`book${isActive ? " book-active" : ""}`}
                          key={entry.id}
                          onMouseEnter={(e) => onBookEnter(entry, e)}
                          onMouseLeave={onBookLeave}
                        >
                          <div className="book-spine" style={{ background: color, height, width }}>
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
      )}

      {/* ── My Listings Tab ── */}
      {activeTab === "listings" && (
        <div className="lib-shelves">
          <div className="bookcase-outer">
            <div className="bookcase">
              <div className="bookcase-crown" />

              {listingShelves.map((shelfListings, shelfIdx) => (
                <div className="bookcase-row" key={shelfIdx}>
                  <div className="shelf-interior">
                    {shelfIdx === 0 && !session && (
                      <p className="shelf-empty-msg">Sign in to see your listings</p>
                    )}
                    {shelfIdx === 0 && session && loadingListings && (
                      <p className="shelf-empty-msg">Loading your listings...</p>
                    )}
                    {shelfIdx === 0 && session && !loadingListings && listings.length === 0 && (
                      <p className="shelf-empty-msg">No listings yet — list a book for trade to get started</p>
                    )}

                    {shelfListings.map((entry) => {
                      const book = entry.book;
                      const { height, width } = spineDimensions(book.title);
                      const color    = spineColor(book.title);
                      const isActive = hoveredEntry?.id === entry.id;

                      return (
                        <div
                          className={`book${isActive ? " book-active" : ""}`}
                          key={entry.id}
                          onMouseEnter={(e) => onBookEnter(entry, e)}
                          onMouseLeave={onBookLeave}
                        >
                          <div className="book-spine" style={{ background: color, height, width }}>
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
      )}

      {/* Hover popup */}
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
          <div className="book-card-author">{hoveredEntry.book.authors?.join(", ")}</div>

          {activeTab === "books" && !hoveredEntry.isIncoming && hoveredEntry.book.published_date && (
            <div className="book-card-year">{hoveredEntry.book.published_date.slice(0, 4)}</div>
          )}

          {activeTab === "listings" && (
            <div className="book-card-year" style={{ color: STATUS_COLORS[hoveredEntry.status] ?? "#6b7280" }}>
              ● {hoveredEntry.status}
            </div>
          )}

          {activeTab === "books" && hoveredEntry.isIncoming && (
            <div className="book-card-year" style={{ color: STATUS_COLORS["pending"] }}>
              ● pending — incoming trade
            </div>
          )}

          {activeTab === "books" && !hoveredEntry.isIncoming && (
            isAlreadyListed ? (
              <div className="book-card-listed-badge">Already listed for trade</div>
            ) : (
              <button className="btn-list-trade" onClick={() => listForTrade(hoveredEntry)}>
                List for Trade
              </button>
            )
          )}

          {!hoveredEntry.isIncoming && (
            <div className="book-card-actions">
              {activeTab === "books" && (
                <button className="btn-edit" onClick={() => editBook(hoveredEntry)}>Edit</button>
              )}
              <button
                className="btn-remove"
                onClick={() => activeTab === "books" ? removeBook(hoveredEntry.id) : removeListing(hoveredEntry.id)}
              >
                Remove
              </button>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
