/* Layout for authentication pages: No header or footers. */

import { Outlet } from "react-router-dom";

function AuthLayout() {
  return (
    <div style={{ display: "flex", justifyContent: "center", marginTop: "80px" }}>
      <Outlet />
    </div>
  );
}

export default AuthLayout;