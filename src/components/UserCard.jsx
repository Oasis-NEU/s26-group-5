import "./UserCarousel.css";

export default function UserCard({ name, collageColors }) {
  return (
    <div className="user-card">
      <div className="user-card-collage">
        {collageColors.map((color, i) => (
          <div key={i} className="user-card-collage-cell" style={{ backgroundColor: color }} />
        ))}
      </div>
      <div className="user-card-info">
        <div className="user-card-pfp">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="8" r="4"/>
            <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
          </svg>
        </div>
        <p className="user-card-name">{name}</p>
        <p className="user-card-listings">Placeholder listings</p>
      </div>
    </div>
  );
}
