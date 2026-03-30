import { BrowserRouter, Routes, Route } from "react-router-dom";
import PublicLayout from "./layouts/PublicLayout";
import AuthLayout from "./layouts/AuthLayout";

function PlaceholderPage({ title }) {
  return (
    <section style={{ padding: "2rem" }}>
      <h1>{title}</h1>
      <p>This page is a temporary placeholder while the real page is in progress.</p>
    </section>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/*Navbar pages*/}
        <Route element={<PublicLayout/>}>
          <Route path="/"       element={<PlaceholderPage title="Home" />} />
          <Route path="/browse" element={<PlaceholderPage title="Browse" />} />
        </Route>

        {/*Non navbar pages*/}
        <Route element={<AuthLayout/>}>
          <Route path="/login"    element={<PlaceholderPage title="Login" />} />
          <Route path="/register" element={<PlaceholderPage title="Register" />} />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;