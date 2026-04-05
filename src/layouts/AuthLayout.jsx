/* Layout for authentication pages: No header or footers. */

import { Outlet } from "react-router-dom";

function AuthLayout() {
  return (
    <div style={styles.pageShell}>
      <div style={styles.content}>
        <Outlet />
      </div>
    </div>
  );
}

const styles = {
  pageShell: {
    width: "100%",
  },
  content: {
    display: "flex",
    justifyContent: "center",
    marginTop: "80px",
  },
};

export default AuthLayout;