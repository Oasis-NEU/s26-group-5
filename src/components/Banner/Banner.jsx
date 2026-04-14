import { useNavigate } from "react-router-dom";
import "./Banner.css";

export default function Banner({ eyebrow, headline, sub, buttonText, buttonTo }) {
  const navigate = useNavigate();

  return (
    <div className="banner">
      <div className="banner-text">
        {eyebrow && <p className="banner-eyebrow">{eyebrow}</p>}
        <p className="banner-headline">{headline}</p>
        {sub && <p className="banner-sub">{sub}</p>}
      </div>
      {buttonText && (
        <button className="banner-btn" onClick={() => navigate(buttonTo ?? "/")}>
          {buttonText}
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12"/>
            <polyline points="12 5 19 12 12 19"/>
          </svg>
        </button>
      )}
    </div>
  );
}
