/* Layout for public pages (home, cart, etc...). Majority of the pages on our
website will use this layout and it includes the navbar and footer */

import { Outlet, useLocation } from "react-router-dom";
import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";
import "./PublicLayout.css";

function PublicLayout() {
  const { key } = useLocation();
  return (
    <div className="public-layout-shell">
      <Navbar />
      <main key={key} className="page-transition">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default PublicLayout;
