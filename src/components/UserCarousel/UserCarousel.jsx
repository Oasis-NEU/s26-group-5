import { useCarousel } from "../../hooks/useCarousel";
import UserCard from "../UserCard/UserCard";
import "./UserCarousel.css";

export default function UserCarousel({ users }) {
  const { trackRef, showLeft, showRight, handleScroll, scroll } = useCarousel(users);

  return (
    <section className="user-carousel-section">
      <div className="user-carousel-header">
        <h2 className="user-carousel-title">Users Near Me</h2>
      </div>
      <div className="user-carousel">
        {showLeft && (
          <button className="carousel-btn carousel-btn--left" onClick={() => scroll(-1, 2)}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </button>
        )}

        <div className="carousel-track-clip">
          <div className="carousel-track user-carousel-track" ref={trackRef} onScroll={handleScroll}>
            {users.map((user) => (
              <UserCard key={user.id} {...user} />
            ))}
          </div>
        </div>

        {showRight && (
          <button className="carousel-btn carousel-btn--right" onClick={() => scroll(1, 2)}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </button>
        )}
      </div>
    </section>
  );
}
