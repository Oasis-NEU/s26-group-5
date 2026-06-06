# BookX

A peer-to-peer book trading platform where readers can list books from their collection, browse what others have available, and propose trades — all without spending money.

Built by Oasis @ Northeastern, Spring 2026 — Group 5.

Deployment: https://bookexg.netlify.app/

---

## Features

- **Book Search** — Search millions of books via the Google Books API with live suggestions in the navbar
- **Personal Library** — Add books to your collection with a visual bookshelf (color-coded spines, hover previews with metadata)
- **Trade Listings** — List books you're willing to trade and track their status (active / pending / traded)
- **Trade Builder** — Select books from your listings to offer, browse a partner's listings, and confirm a trade request
- **Home Feed** — Curated carousels of community listings filtered by genre (Mystery, Romance, Fiction, Horror, Sci-Fi, Textbooks)
- **Authentication** — Email/password sign-up and sign-in via Supabase Auth

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, React Router v7 |
| Build tool | Vite 7 |
| Backend / DB | Supabase (PostgreSQL + Auth) |
| Book metadata | Google Books API v1 |
| Styling | Plain CSS modules (per component) |

---

## Project Structure

```
src/
├── api/
│   └── googleBooks.js          # Google Books search helper
├── assets/                     # Static images (arrows, icons)
├── components/
│   ├── Auth.jsx                # Login / sign-up dropdown modal
│   ├── Banner.jsx              # CTA banner sections
│   ├── BookCard.jsx            # Single book card
│   ├── BookCarousel.jsx        # Horizontally scrolling genre carousel
│   ├── Footer.jsx
│   ├── HeroPoster.jsx          # Homepage hero image
│   ├── Navbar.jsx              # Top nav — search bar, auth, genre links
│   ├── UserCard.jsx
│   └── UserCarousel.jsx
├── data/
│   ├── books.js                # Sample / seed book data
│   └── users.js                # Sample user data
├── hooks/
│   └── useCarousel.js          # Scroll logic for carousels
├── layouts/
│   ├── AuthLayout.jsx          # Bare layout for auth-only pages
│   └── PublicLayout.jsx        # Navbar + Outlet + Footer
├── lib/
│   └── supabaseClient.js       # Supabase client init
└── pages/
    ├── AddBookPage.jsx          # Search → select → add to library or listing
    ├── BookDetailsPage.jsx      # Full book detail view
    ├── HomePage.jsx             # Home feed with genre carousels
    ├── MyBooksPage.jsx          # Personal library and listings manager
    ├── SearchResultsPage.jsx    # Google Books search results page
    └── TradePage.jsx            # Trade builder UI
```

---

## Pages

| Route | Page | Description |
|---|---|---|
| `/` | Home | Hero banner, featured/genre carousels, community listings |
| `/search?q=` | Search Results | Books from Google Books API matching the query |
| `/books/:id` | Book Details | Cover, metadata, similar books, propose trade CTA |
| `/library` | My Library | Visual bookshelf + listings grid with status tracking |
| `/add-book` | Add Book | Search and add a book to your library or trade listings |
| `/trade` | Trade | Side-by-side bookshelf UI for building a trade offer |

---

## Database Schema

**`books`** — Metadata sourced from Google Books, upserted on first add

| Column | Type | Notes |
|---|---|---|
| `id` | uuid | Primary key |
| `google_books_id` | text | Unique — prevents duplicates on upsert |
| `title` | text | |
| `authors` | jsonb | Array of author name strings |
| `description` | text | |
| `thumbnail` | text | Cover image URL from Google Books |
| `published_date` | text | |
| `page_count` | integer | |
| `categories` | jsonb | Full array of genre strings from Google Books |
| `genre` | text | Most specific category — used for carousel filtering |

**`user_books`** — A user's personal library

| Column | Type | Notes |
|---|---|---|
| `id` | uuid | Primary key |
| `user_id` | uuid | FK → auth.users |
| `book_id` | uuid | FK → books |
| `condition` | text | `Like New` / `Good` / `Acceptable` |
| `notes` | text | |
| `created_at` | timestamptz | |

**`listings`** — Books a user is offering to trade (used in library + trade builder)

| Column | Type | Notes |
|---|---|---|
| `id` | uuid | Primary key |
| `user_id` | uuid | FK → auth.users |
| `book_id` | uuid | FK → books |
| `condition` | text | `Like New` / `Good` / `Acceptable` |
| `notes` | text | |
| `status` | text | `active` / `pending` / `traded` |
| `created_at` | timestamptz | |

**`trade_listings`** — Books visible on the homepage community feed

| Column | Type | Notes |
|---|---|---|
| `id` | uuid | Primary key |
| `user_id` | uuid | FK → auth.users |
| `book_id` | uuid | FK → books |
| `condition` | text | |
| `notes` | text | |
| `status` | text | `active` / `pending` / `traded` |
| `created_at` | timestamptz | |

**`users`** — Public profile info

| Column | Type | Notes |
|---|---|---|
| `user_id` | uuid | FK → auth.users |
| `username` | text | Set at sign-up |

---

## Getting Started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project with the schema above applied
- A [Google Books API key](https://developers.google.com/books/docs/v1/using#APIKey)

### Installation

```bash
git clone https://github.com/Oasis-NEU/s26-group-5.git
cd s26-group-5
npm install
```

### Environment Variables

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_GOOGLE_BOOKS_API_KEY=your_google_books_api_key
```

### Running Locally

```bash
npm run dev       # Start dev server → http://localhost:5173
npm run build     # Production build
npm run preview   # Preview production build locally
npm run lint      # Run ESLint
```

---

## Key Design Decisions

**Client-side Google Books calls** — The API is queried directly from the browser. Results are upserted into Supabase so the same book is never stored twice (keyed on `google_books_id`).

**Genre filtering** — The homepage carousels filter on the `genre` column using keyword matching (`"mystery"`, `"thriller"`, `"crime"`, etc.). The `genre` field is set to the most specific category from the Google Books `categories` array rather than always taking the first element, which is typically the generic `"Fiction"`.

**No global state manager** — Each page manages its own Supabase queries and local state via React hooks. Auth state is retrieved via `supabase.auth.getSession()` and `onAuthStateChange` wherever needed.

**Visual bookshelf** — The library page renders books as colored spines whose height and width are deterministically derived from a hash of the title, giving each shelf a natural, varied look without requiring cover images.

**Trade flow** — The trade page splits into side-panel bookshelves (browsable listings) and a center offer area. Clicking a spine in the side panel adds it to the offer; the center holds the final selection before confirming.

---

## Contributing

Open an issue or pull request on [GitHub](https://github.com/Oasis-NEU/s26-group-5).
