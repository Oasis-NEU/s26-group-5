import { useState } from "react";
import { useNavigate } from "react-router-dom";

const GENRES = ["Nonfiction", "Horror", "Mystery", "Romance", "Sci-Fi", "Historical Fiction"];
const THEME = "#c0392b";

export default function Navbar() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeGenre, setActiveGenre] = useState(null);

  function handleSearch() {
    console.log("Searching for:", searchQuery);
  }

  function handleKeyDown(e) {
    if (e.key === "Enter") handleSearch();
  }

  return (
    <div style={styles.wrapper}>
      {/* Top Row */}
      <div style={styles.topRow}>

        {/* Logo */}
        <div style={styles.logo}>
          <div style={{ ...styles.logoIcon, backgroundColor: THEME }}>B</div>
          <span style={styles.logoText}>BookX</span>
        </div>

        {/* Search */}
        <div style={styles.searchBar}>
          <input
            type="text"
            placeholder="Search titles, authors, or genres..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            style={styles.searchInput}
          />
          <button onClick={handleSearch} style={{ ...styles.searchBtn, backgroundColor: THEME }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </button>
        </div>

        {/* Actions */}
        <div style={styles.actions}>
          <button style={styles.sellBtn}>Sell Now</button>
          <button style={styles.exchangeBtn} onClick={() => navigate("/trade")}>Exchange</button>

          {/* My Library */}
          <button style={styles.iconBtn} title="My Library">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
            </svg>
          </button>

          {/* Cart */}
          <button style={styles.iconBtn} title="Cart">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 01-8 0"/>
            </svg>
          </button>

          <button style={styles.loginBtn}>
            Log In
          </button>
        </div>
      </div>

      {/* Bottom Row */}
      <div style={styles.bottomRow}>
        <div style={styles.genreGroup}>
          {GENRES.map((genre) => (
            <button
              key={genre}
              onClick={() => setActiveGenre(genre === activeGenre ? null : genre)}
              style={{
                ...styles.genreBtn,
                ...(activeGenre === genre ? { color: THEME, borderBottomColor: THEME } : {}),
              }}
            >
              {genre}
            </button>
          ))}
          <button style={styles.moreBtn}>
            More Categories
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: 4 }}>
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
    backgroundColor: "#fff",
    borderBottom: "1px solid #e5e5e5",
    userSelect: "none",
    padding: "0 11vw",
    position: "sticky",
    top: 0,
    zIndex: 100,
  },
  topRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "2vh 0 1vh 0",
    gap: "3vw",
  },
  logo: {
    display: "flex",
    alignItems: "center",
    gap: "0.5vw",
  },
  logoIcon: {
    width: "44px",
    height: "44px",
    borderRadius: "20px",
    color: "#fff",
    fontWeight: "800",
    fontSize: "24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  logoText: {
    fontFamily: "'Boldonse', 'Open Sans', sans-serif",
    display: "flex",
    alignItems: "center",
    fontSize: "24px",
    color: "#111",
    letterSpacing: "-1px",
    padding: "3px 0 0 0",
  },
  searchBar: {
    display: "flex",
    width: "40vw",
    border: "1.5px solid #d1d5db",
    borderRadius: "15px",
    overflow: "hidden",
    backgroundColor: "#fff",
  },
  searchInput: {
    flex: 1,
    fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
    padding: "18px 22px",
    border: "none",
    outline: "none",
    fontSize: "18px",
    color: "#111",
    backgroundColor: "transparent",
  },
  searchBtn: {
    padding: "0 15px",
    border: "none",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "0 15px 15px 0",
  },
  actions: {
    display: "flex",
    alignItems: "center",
    gap: "1.5vw",
  },
  sellBtn: {
    backgroundColor: THEME,
    fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
    color: "#fff",
    border: "none",
    borderRadius: "12px",
    padding: "12px 22px",
    fontSize: "18px",
    fontWeight: "700",
    cursor: "pointer",
    whiteSpace: "nowrap",
  },
  exchangeBtn: {
    backgroundColor: THEME,
    fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
    color: "#fff",
    border: "none",
    borderRadius: "12px",
    padding: "12px 22px",
    fontSize: "18px",
    fontWeight: "700",
    cursor: "pointer",
    whiteSpace: "nowrap",
  },
  iconBtn: {
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: "6px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#333",
  },
  loginBtn: {
    fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
    padding: "12px 22px",
    borderRadius: "12px",
    backgroundColor: "transparent",
    border: "3px solid #44474a",
    cursor: "pointer",
    fontSize: "18px",
    fontWeight: "600",
    whiteSpace: "nowrap",
  },
  bottomRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0",
  },
  genreGroup: {
    display: "flex",
    alignItems: "center",
    gap: "0.5vw",
  },
  genreBtn: {
    background: "none",
    fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
    border: "none",
    borderBottom: "2px solid transparent",
    cursor: "pointer",
    padding: "20px 20px",
    fontSize: "18px",
    color: "#374151",
    fontWeight: "400",
    whiteSpace: "nowrap",
  },
  moreBtn: {
    display: "flex",
    alignItems: "center",
    background: "none",
    fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
    border: "none",
    cursor: "pointer",
    padding: "15px 20px",
    fontSize: "18px",
    color: "#374151",
    fontWeight: "400",
    whiteSpace: "nowrap",
  },
};