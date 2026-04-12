import { useNavigate } from "react-router-dom";
import bxLogo from "../assets/bx.png";
import "./Footer.css";

export default function Footer() {
  const navigate = useNavigate();

  function goTo(path) {
    navigate(path);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function goToSection(id) {
    navigate("/");
    setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  }

  return (
    <footer className="footer">
      <div className="footer-inner">

        {/* Brand */}
        <div className="footer-brand">
          <div className="footer-logo">
            <img src={bxLogo} alt="BookX" className="footer-logo-icon" />
            <span className="footer-logo-text">BookX</span>
          </div>
          <p className="footer-tagline">
            Trade books with readers in your community.
          </p>
        </div>

        {/* Link columns */}
        <div className="footer-links">

          <div className="footer-col">
            <h4 className="footer-col-heading">Browse</h4>
            <ul className="footer-col-list">
              <li onClick={() => goToSection("featured")}>Featured Listings</li>
              <li onClick={() => goToSection("new-listings")}>New Postings</li>
              <li>Nonfiction</li>
              <li onClick={() => goToSection("horror")}>Horror</li>
              <li onClick={() => goToSection("mystery")}>Mystery</li>
              <li onClick={() => goToSection("romance")}>Romance</li>
              <li onClick={() => goToSection("sci-fi")}>Sci-Fi</li>
              <li onClick={() => goToSection("textbooks")}>Textbooks</li>
            </ul>
          </div>

          <div className="footer-col">
            <h4 className="footer-col-heading">Trading</h4>
            <ul className="footer-col-list">
              <li onClick={() => goTo("/add-book")}>Add a Listing</li>
              <li onClick={() => goTo("/trade")}>How Trades Work</li>
              <li>Condition Guide</li>
              <li>Shipping Info</li>
            </ul>
          </div>

          <div className="footer-col">
            <h4 className="footer-col-heading">Company</h4>
            <ul className="footer-col-list">
              <li>About Us</li>
              <li>How It Works</li>
              <li>Blog</li>
              <li>Careers</li>
              <li>Contact</li>
            </ul>
          </div>

          <div className="footer-col">
            <h4 className="footer-col-heading">Support</h4>
            <ul className="footer-col-list">
              <li>Help Center</li>
              <li>Report an Issue</li>
              <li>Privacy Policy</li>
              <li>Terms of Service</li>
              <li>Cookie Settings</li>
            </ul>
          </div>

        </div>
      </div>

      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} BookX. All rights reserved.</span>
        <span className="footer-bottom-right">Made for book lovers.</span>
      </div>
    </footer>
  );
}
