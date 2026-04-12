import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import PublicLayout from "./layouts/PublicLayout";
import AuthLayout from "./layouts/AuthLayout";
import HomePage from "./pages/HomePage";
import BookDetailsPage from "./pages/BookDetailsPage";
import TradePage from "./pages/TradePage";
import MyBooksPage from "./pages/MyBooksPage";
import SearchResultsPage from "./pages/SearchResultsPage";
import AddBookPage from "./pages/AddBookPage";

// Forces AddBookPage to fully remount on every navigation to /add-book,
// giving a clean form state without effects fighting against the router.
function KeyedAddBook() {
  const { key } = useLocation();
  return <AddBookPage key={key} />;
}

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
          <Route path="/"       element={<HomePage />} />
          <Route path="/browse" element={<PlaceholderPage title="Browse" />} />
          <Route path="/books/:bookId" element={<BookDetailsPage />} />
          <Route path="/trade" element={<TradePage />} />
          <Route path="/library" element={<MyBooksPage />} />
          <Route path="/search" element={<SearchResultsPage />} />
          <Route path="/add-book" element={<KeyedAddBook />} />
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
