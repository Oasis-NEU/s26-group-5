import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Auth from "./Auth";
import "./Navbar.css";

const GENRES = ["Nonfiction", "Horror", "Mystery", "Romance", "Sci-Fi", "Historical Fiction", "Textbooks"];
const MORE_GENRES = ["Children's Books", "Comics & Graphic Novels", "Self-Help", "Biography", "Poetry", "Art & Photography", "Travel", "Cookbooks"];

export default function Navbar() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [showLogin, setShowLogin] = useState(false);

  function handleSearch() {
    console.log("Searching for:", searchQuery);
  }

  function handleKeyDown(e) {
    if (e.key === "Enter") handleSearch();
  }

  return (
    <div className="navbar-wrapper">
      {/* Top Row */}
      <div className="navbar-top-row">

        {/* Logo */}
        <div className="navbar-logo" onClick={() => navigate("/")} role="button" tabIndex={0}>
          <div className="navbar-logo-icon">Bx</div>
          <span className="navbar-logo-text">BookX</span>
        </div>

        {/* Search */}
        <div className="navbar-search-bar">
          <input
            type="text"
            placeholder="Search titles, authors, or genres..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="navbar-search-input"
          />
          <button onClick={handleSearch} className="navbar-search-btn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </button>
        </div>

        {/* Actions */}
        <div className="navbar-actions">
          <button className="navbar-action-btn" onClick={() => navigate("/trade")}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '6px'}}>
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Add Listing
          </button>

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
          <button className="navbar-icon-btn" title="Trade Requests">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
          </button>

          <div className="navbar-login-wrapper">
            <button className="navbar-login-btn" onClick={() => setShowLogin((v) => !v)}>
              Log In
            </button>
            {showLogin && <Auth onClose={() => setShowLogin(false)} />}
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="navbar-bottom-row">
        <div className="navbar-genre-group">
          <button className="navbar-featured-btn">Featured</button>
          <button className="navbar-featured-btn">New Postings</button>
          <div className="navbar-divider" />
          {GENRES.map((genre) => (
            <button key={genre} className="navbar-genre-btn">
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
                <button
                  key={genre}
                  className="navbar-more-dropdown-item"
                >
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
