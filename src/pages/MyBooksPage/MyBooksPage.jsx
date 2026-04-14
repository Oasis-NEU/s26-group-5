import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import { spineColor, spineDimensions } from "../../utils/bookSpine";
import { secureImageUrl } from "../../utils/image";
import { createShelves } from "../../utils/shelf";
import { computePopupStyle } from "../../utils/popup";
import { useAuthSession } from "../../hooks/useAuthSession";
import { useHoverPopup } from "../../hooks/useHoverPopup";
import "./MyBooksPage.css";

const BOOKS_PER_SHELF = 12;
const MIN_SHELVES = 3;
const POPUP_W = 210;
const POPUP_H = 360;

const STATUS_COLORS = {
  active:  "#16a34a",
  pending: "#d97706",
  traded:  "#6b7280",
};

export default function MyBooksPage() {
  const navigate = useNavigate();
  const { session, loading: authLoading } = useAuthSession();
  const { hoveredEntry, setHoveredEntry, popupRect, onEnter, onLeave, onPopupEnter, onPopupLeave } = useHoverPopup();

  // Tabs
  const [activeTab, setActiveTab] = useState("books");

  // My Books
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  // My Listings
  const [listings, setListings] = useState([]);
  const [loadingListings, setLoadingListings] = useState(false);

  // Incoming pending trades (books I may receive)
  const [incomingTrades, setIncomingTrades] = useState([]);

  useEffect(() => {
    if (!session) { setBooks([]); setListings([]); }
  }, [session]);

  useEffect(() => {
    if (session) {
      fetchBooks();
      fetchListings();
      fetchIncomingTrades();
    }
  }, [session]);

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

  function editListing(entry) {
    setHoveredEntry(null);
    navigate("/add-book", {
      state: {
        editListing: {
          id: entry.id,
          book: entry.book,
          condition: entry.condition,
          notes: entry.notes,
        },
      },
    });
  }

  async function unlistBook(entry) {
    setHoveredEntry(null);
    if (!session) return;
    const { error: insertError } = await supabase
      .from("user_books")
      .upsert(
        { user_id: session.user.id, book_id: entry.book.id, condition: entry.condition, notes: entry.notes || null },
        { onConflict: "user_id,book_id" }
      );
    if (insertError) { console.error("unlistBook error:", insertError); return; }
    await supabase.from("trade_listings").delete().eq("id", entry.id);
    setListings((prev) => prev.filter((l) => l.id !== entry.id));
  }

  function listForTrade(entry) {
    setHoveredEntry(null);
    navigate("/add-book", {
      state: { book: entry.book, condition: entry.condition, notes: entry.notes, userBookId: entry.id },
    });
  }

  async function removeBook(entryId) {
    setHoveredEntry(null);
    await supabase.from("user_books").delete().eq("id", entryId);
    setBooks((prev) => prev.filter((b) => b.id !== entryId));
  }

  async function removeListing(listingId) {
    await supabase.from("trade_listings").delete().eq("id", listingId);
    setListings((prev) => prev.filter((l) => l.id !== listingId));
  }

  if (authLoading) return null;

  // Build shelves
  const shelves = createShelves(books, BOOKS_PER_SHELF, MIN_SHELVES);
  if (incomingTrades.length > 0) {
    const last = shelves[shelves.length - 1];
    const combined = [...last, ...incomingTrades];
    shelves[shelves.length - 1] = combined.slice(0, BOOKS_PER_SHELF);
    for (let i = BOOKS_PER_SHELF; i < combined.length; i += BOOKS_PER_SHELF)
      shelves.push(combined.slice(i, i + BOOKS_PER_SHELF));
  }
  const listingShelves = createShelves(listings, BOOKS_PER_SHELF, MIN_SHELVES);

  const isAlreadyListed = hoveredEntry
    ? listings.some((l) => l.book?.id === hoveredEntry.book.id)
    : false;
  const popupStyle = computePopupStyle(popupRect, POPUP_W, POPUP_H);

  return (
    <div className="lib-page">

      {/* FAB */}
      {session && (
        <button className="lib-fab-add" onClick={() => navigate("/add-book")}>
          + {activeTab === "listings" ? "Add Listing" : "Add Book"}
        </button>
      )}

      {/* Header */}
      <div className="lib-header">
        <div className="lib-header-inner">
          <h1 className="lib-page-title">My Library</h1>
          <div className="lib-tabs">
            <button
              className={`lib-tab${activeTab === "books" ? " active" : ""}`}
              onClick={() => setActiveTab("books")}
            >
              My Books
              {books.length > 0 && <span className="lib-tab-count">{books.length}</span>}
            </button>
            <button
              className={`lib-tab${activeTab === "listings" ? " active" : ""}`}
              onClick={() => setActiveTab("listings")}
            >
              My Listings
              {listings.length > 0 && <span className="lib-tab-count">{listings.length}</span>}
            </button>
          </div>
        </div>
      </div>

      {/* My Books Tab */}
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
                      const color = spineColor(book.title);
                      return (
                        <div
                          className={`book${hoveredEntry?.id === entry.id ? " book-active" : ""}`}
                          key={entry.id}
                          onMouseEnter={(e) => onEnter(entry, e)}
                          onMouseLeave={onLeave}
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

      {/* My Listings Tab */}
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
                      const color = spineColor(book.title);
                      return (
                        <div
                          className={`book${hoveredEntry?.id === entry.id ? " book-active" : ""}`}
                          key={entry.id}
                          onMouseEnter={(e) => onEnter(entry, e)}
                          onMouseLeave={onLeave}
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
            <img src={secureImageUrl(hoveredEntry.book.thumbnail)} alt="cover" />
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
              {activeTab === "listings" && (
                <>
                  <button className="btn-edit" onClick={() => editListing(hoveredEntry)}>Edit</button>
                  <button className="btn-unlist" onClick={() => unlistBook(hoveredEntry)}>Unlist</button>
                </>
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
