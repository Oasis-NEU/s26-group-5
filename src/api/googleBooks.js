const API_KEY = import.meta.env.VITE_GOOGLE_BOOKS_API_KEY;

export async function searchBooks(query, maxResults = 12) {
  const res = await fetch(
    `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=${maxResults}&key=${API_KEY}`
  );
  if (!res.ok) throw new Error("Failed to fetch books");
  const data = await res.json();
  return data.items || [];
}
