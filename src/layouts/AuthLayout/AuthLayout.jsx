/* Layout for authentication pages: No header or footers. */

import { Outlet } from "react-router-dom";
import "./AuthLayout.css";

function AuthLayout() {
  return (
    <div className="auth-layout-shell">
      <div className="auth-layout-content">
        <Outlet />
      </div>
    </div>
  );
}

export default AuthLayout;
