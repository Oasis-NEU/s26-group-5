import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { searchBooks } from "../api/googleBooks";
import "./SearchResultsPage.css";

export default function SearchResultsPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!query) return;
    setLoading(true);
    setError(null);
    searchBooks(query)
      .then(setResults)
      .catch(() => setError("Something went wrong. Please try again."))
      .finally(() => setLoading(false));
  }, [query]);

  return (
    <main className="search-results-page">
      <div className="search-results-header">
        <p className="search-results-meta">
          {loading ? "Searching…" : `${results.length} results for `}
          {!loading && <strong>"{query}"</strong>}
        </p>
      </div>

      {error && <p className="search-results-error">{error}</p>}

      <ul className="search-results-list">
        {results.map((item) => {
          const info = item.volumeInfo;
          const thumbnail = info.imageLinks?.thumbnail;
          return (
            <li key={item.id} className="search-result-card">
              <div className="search-result-cover">
                {thumbnail
                  ? <img src={thumbnail} alt={info.title} />
                  : <div className="search-result-cover-placeholder" />}
              </div>
              <div className="search-result-info">
                <h2 className="search-result-title">{info.title}</h2>
                {info.authors && (
                  <p className="search-result-author">by {info.authors.join(", ")}</p>
                )}
                <div className="search-result-meta-row">
                  {info.publishedDate && <span>{info.publishedDate.slice(0, 4)}</span>}
                  {info.categories?.[0] && <span>{info.categories[0]}</span>}
                  {info.pageCount && <span>{info.pageCount} pages</span>}
                </div>
                {info.description && (
                  <p className="search-result-description">{info.description}</p>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      {!loading && results.length === 0 && query && !error && (
        <p className="search-results-empty">No results found for "{query}".</p>
      )}
    </main>
  );
}
