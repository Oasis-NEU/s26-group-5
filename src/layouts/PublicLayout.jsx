/* Layout for public pages (home, cart, etc...). Majority of the pages on our 
website will use this layout and it includes the navbar and footer */

import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";

function PublicLayout() {
  return (
    <>
      <Navbar />
      <main>
        <Outlet />
      </main>
    </>
  );
}

export default PublicLayout;