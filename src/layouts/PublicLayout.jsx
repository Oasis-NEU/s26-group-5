/* Layout for public pages (home, cart, etc...). Majority of the pages on our 
website will use this layout and it includes the navbar and footer */

import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";

function PublicLayout() {
  return (
    <div style={styles.pageShell}>
      <Navbar />
      <main>
        <Outlet />
      </main>
    </div>
  );
}

const styles = {
  pageShell: {
    width: "100%",
  },
};

export default PublicLayout;