export const SAMPLE_BOOKS = [
  {
    id: "placeholder-title-one",
    title: "Placeholder Title One",
    author: "Placeholder Author",
    seller: "Placeholder Seller",
    price: "$12.99",
    condition: "Like New",
    description:
      "Placeholder description for a listing. Use this area to highlight the book's plot, edition details, and any seller notes.",
    coverColor: "#c0392b",
    genre: "Placeholder Genre",
    pages: "Placeholder Pages",
    shipping: "Placeholder Shipping",
  },
  {
    id: "placeholder-title-two",
    title: "Placeholder Title Two",
    author: "Placeholder Author",
    seller: "Placeholder Seller",
    price: "$8.50",
    condition: "Good",
    description:
      "Placeholder description for a listing. You can later connect this card to real inventory data and a details page.",
    coverColor: "#1f2937",
    genre: "Placeholder Genre",
    pages: "Placeholder Pages",
    shipping: "Placeholder Shipping",
  },
  {
    id: "placeholder-title-three",
    title: "Placeholder Title Three",
    author: "Placeholder Author",
    seller: "Placeholder Seller",
    price: "$15.00",
    condition: "Very Good",
    description:
      "Placeholder description for a listing. This card is reusable, so you can pass in real values once your backend is ready.",
    coverColor: "#0f766e",
    genre: "Placeholder Genre",
    pages: "Placeholder Pages",
    shipping: "Placeholder Shipping",
  },
  {
    id: "placeholder-title-four",
    title: "Placeholder Title Four",
    author: "Placeholder Author",
    seller: "Placeholder Seller",
    price: "$10.75",
    condition: "Good",
    description:
      "Placeholder description for a listing. Swap this with real book details once your inventory and backend routes are connected.",
    coverColor: "#7c3aed",
    genre: "Placeholder Genre",
    pages: "Placeholder Pages",
    shipping: "Placeholder Shipping",
  },
  {
    id: "placeholder-title-five",
    title: "Placeholder Title Five",
    author: "Placeholder Author",
    seller: "Placeholder Seller",
    price: "$18.20",
    condition: "Like New",
    description:
      "Placeholder description for a listing. Keep this as sample content until real listing metadata is available.",
    coverColor: "#b45309",
    genre: "Placeholder Genre",
    pages: "Placeholder Pages",
    shipping: "Placeholder Shipping",
  },
  {
    id: "placeholder-title-six",
    title: "Placeholder Title Six",
    author: "Placeholder Author",
    seller: "Placeholder Seller",
    price: "$9.99",
    condition: "Good",
    description:
      "Placeholder description for a listing. Replace this with real book data once your inventory is connected.",
    coverColor: "#0369a1",
    genre: "Placeholder Genre",
    pages: "Placeholder Pages",
    shipping: "Placeholder Shipping",
  },
];

export function getBookById(bookId) {
  return SAMPLE_BOOKS.find((book) => book.id === bookId) ?? null;
}
