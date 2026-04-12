/* Layout for public pages (home, cart, etc...). Majority of the pages on our
website will use this layout and it includes the navbar and footer */

import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "./PublicLayout.css";

function PublicLayout() {
  return (
    <div className="public-layout-shell">
      <Navbar />
      <main>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default PublicLayout;
