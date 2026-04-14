import { useNavigate } from "react-router-dom";
import "../UserCarousel/UserCarousel.css";

function nameToHue(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return h % 360;
}

const FAN = {
  0: [],
  1: [{ r: 0,   x: 0  }],
  2: [{ r: -10, x: -26 }, { r: 10,  x: 26  }],
  3: [{ r: -15, x: -34 }, { r: 0,   x: 0   }, { r: 15,  x: 34  }],
  4: [{ r: -18, x: -42 }, { r: -6,  x: -14 }, { r: 6,   x: 14  }, { r: 18,  x: 42  }],
};

export default function UserCard({ id, name, thumbnails = [], listingCount = 0 }) {
  const navigate = useNavigate();
  const count = Math.min(thumbnails.length, 4);
  const positions = FAN[count];
  const hue = nameToHue(name || "user");
  const fanBg = `linear-gradient(150deg, hsl(${hue},50%,88%) 0%, hsl(${(hue + 30) % 360},45%,82%) 100%)`;

  return (
    <div
      className="user-card"
      onClick={() => navigate('/trade', { state: { theirUserId: id, theirName: name, prefillAll: true } })}
    >
      <div className="user-card-fan" style={{ background: fanBg }}>
        {count === 0 ? (
          <div className="user-card-fan-empty" />
        ) : (
          <>
            {thumbnails.slice(0, 4).map((src, i) => (
              <img
                key={i}
                src={src}
                alt=""
                className="user-card-fan-book"
                style={{
                  transform: `rotate(${positions[i].r}deg) translateX(${positions[i].x}px)`,
                  zIndex: i + 1,
                }}
              />
            ))}
            {listingCount > count && (
              <div
                className="user-card-fan-more"
                style={{
                  transform: `rotate(${positions[count - 1].r}deg) translateX(${positions[count - 1].x}px)`,
                  zIndex: count + 1,
                }}
              >
                +{listingCount - count}
              </div>
            )}
          </>
        )}
      </div>
      <div className="user-card-info">
        <div
          className="user-card-pfp"
          style={{
            backgroundColor: `hsl(${hue},50%,88%)`,
            borderColor:     `hsl(${hue},40%,80%)`,
            color:           `hsl(${hue},45%,32%)`,
          }}
        >
          <span className="user-card-pfp-initial">{name?.[0]?.toUpperCase() ?? "?"}</span>
        </div>
        <p className="user-card-name">{name}</p>
        <p className="user-card-listings">{listingCount} listing{listingCount !== 1 ? "s" : ""}</p>
      </div>
    </div>
  );
}
