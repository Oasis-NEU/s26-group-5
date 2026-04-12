import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Auth from "./Auth";
import { searchBooks } from "../api/googleBooks";
import { supabase } from "../lib/supabaseClient";
import { useAuthSession } from "../hooks/useAuthSession";
import bxLogo from "../assets/bx.png";
import "./Navbar.css";

const GENRES = ["Mystery", "Romance", "Fiction", "Horror", "Sci-Fi", "Textbooks"];
const MORE_GENRES = ["Nonfiction", "Children's Books", "Comics & Graphic Novels", "Self-Help", "Biography", "Poetry", "Art & Photography", "Travel", "Cookbooks"];

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [showLogin, setShowLogin] = useState(false);
  const { user } = useAuthSession();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [tradeRequestCount, setTradeRequestCount] = useState(0);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef(null);
  const userRef = useRef(null);

  // Close login modal when user signs in
  useEffect(() => {
    if (user) setShowLogin(false);
  }, [user]);

  // Trade request badge count
  useEffect(() => {
    if (!user) { setTradeRequestCount(0); return; }

    async function fetchCount() {
      const { data } = await supabase
        .from("pending_trades")
        .select("trade_id")
        .neq("proposer_id", user.id)
        .or(`old_user.eq.${user.id},new_user.eq.${user.id}`);
      setTradeRequestCount(new Set(data?.map((r) => r.trade_id)).size);
    }

    fetchCount();

    const channel = supabase
      .channel("trade-requests-badge")
      .on("postgres_changes", { event: "*", schema: "public", table: "pending_trades" }, fetchCount)
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [user]);

  // Debounced suggestions fetch
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSuggestions([]);
      return;
    }
    const timer = setTimeout(() => {
      searchBooks(searchQuery, 5)
        .then(setSuggestions)
        .catch(() => setSuggestions([]));
    }, 100);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Clear search when navigating away from search page
  useEffect(() => {
    if (location.pathname !== "/search") {
      setSearchQuery("");
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [location.pathname]);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
      if (userRef.current && !userRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleCategoryClick(title) {
    const id = title.toLowerCase().replace(/\s+/g, "-");
    if (location.pathname === "/") {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      navigate(`/#${id}`);
    }
  }

  function handleSearch() {
    if (!searchQuery.trim()) return;
    setShowSuggestions(false);
    navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
  }

  function handleKeyDown(e) {
    if (e.key === "Enter") handleSearch();
    if (e.key === "Escape") setShowSuggestions(false);
  }

  function handleSuggestionClick(item) {
    const title = item.volumeInfo.title;
    setSearchQuery(title);
    setShowSuggestions(false);
    navigate(`/search?q=${encodeURIComponent(title)}`);
  }

  return (
    <div className="navbar-wrapper">
      {/* Top Row */}
      <div className="navbar-top-row">

        {/* Logo */}
        <div className="navbar-logo" onClick={() => navigate("/")} role="button" tabIndex={0}>
          <img src={bxLogo} alt="BookX" className="navbar-logo-icon" />
          <span className="navbar-logo-text">BookX</span>
        </div>

        {/* Search */}
        <div className="navbar-search-wrapper" ref={searchRef}>
          <div className="navbar-search-bar">
            <input
              type="text"
              placeholder="Search titles, authors, or genres..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setShowSuggestions(true); }}
              onKeyDown={handleKeyDown}
              onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
              className="navbar-search-input"
            />
            <button onClick={handleSearch} className="navbar-search-btn">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
            </button>
          </div>

          {showSuggestions && suggestions.length > 0 && (
            <ul className="navbar-suggestions">
              {suggestions.map((item) => {
                const info = item.volumeInfo;
                return (
                  <li key={item.id} className="navbar-suggestion-item" onMouseDown={() => handleSuggestionClick(item)}>
                    {info.imageLinks?.smallThumbnail
                      ? <img src={info.imageLinks.smallThumbnail} alt="" className="navbar-suggestion-thumb" />
                      : <div className="navbar-suggestion-thumb navbar-suggestion-thumb--empty" />
                    }
                    <div className="navbar-suggestion-text">
                      <span className="navbar-suggestion-title">{info.title}</span>
                      {info.authors && <span className="navbar-suggestion-author">{info.authors[0]}</span>}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>{/*  */}

        {/* Add Books */}
        <button className="navbar-action-btn" onClick={() => navigate("/add-book")}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Add Books
        </button>

        {/* Actions */}
        <div className="navbar-actions">
          {/* My Library */}
          <button className="navbar-icon-btn" title="My Library" onClick={() => navigate("/library")}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
            </svg>
          </button>

          {/* Books I Want */}
          <button className="navbar-icon-btn" title="Books I Want">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
          </button>

          {/* Trade Requests */}
          <div className="navbar-notif-wrapper">
            <button className="navbar-icon-btn" title="Trade Requests" onClick={() => navigate("/trade-requests")}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
            </button>
            {tradeRequestCount > 0 && (
              <span className="navbar-notif-badge">
                {tradeRequestCount > 99 ? "99+" : tradeRequestCount}
              </span>
            )}
          </div>

          {user ? (
            <div className="navbar-user-wrapper" ref={userRef}>
              <button className="navbar-user-btn" onClick={() => setShowUserMenu((v) => !v)}>
                <div className="navbar-user-avatar">
                  {(user.user_metadata?.display_name?.[0] ?? user.email[0]).toUpperCase()}
                </div>
                <span className="navbar-user-name">
                  {user.user_metadata?.display_name ?? user.email}
                </span>
              </button>
              {showUserMenu && (
                <div className="navbar-user-menu">
                  <button
                    className="navbar-user-menu-item"
                    onClick={() => { supabase.auth.signOut(); setShowUserMenu(false); }}
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="navbar-login-wrapper">
              <button className="navbar-login-btn" onClick={() => setShowLogin((v) => !v)}>
                Log In
              </button>
              {showLogin && <Auth onClose={() => setShowLogin(false)} />}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Row */}
      <div className="navbar-bottom-row">
        <div className="navbar-genre-group">

          <button className="navbar-featured-btn" onClick={() => handleCategoryClick("Featured")}>Featured</button>
          <button className="navbar-featured-btn" onClick={() => handleCategoryClick("New Listings")}>New Listings</button>
          <div className="navbar-divider" />
          {GENRES.map((genre) => (
            <button key={genre} className="navbar-genre-btn" onClick={() => handleCategoryClick(genre)}>
              {genre}
            </button>
          ))}
          <div className="navbar-more-wrapper">
            <button className="navbar-genre-btn navbar-more-btn">
              More Categories
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="navbar-more-btn-chevron">
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </button>
            <div className="navbar-more-dropdown">
              {MORE_GENRES.map((genre) => (
                <button key={genre} className="navbar-more-dropdown-item">
                  {genre}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
