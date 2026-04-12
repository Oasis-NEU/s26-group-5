const BOOK_DESCRIPTION =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.";

const SELLER_NOTE =
  "Picked this up a while back and only read it once — still in great shape. Spine is clean, no highlighting or annotations inside. Happy to answer any questions before you propose a trade.";

export const SAMPLE_BOOKS = [
  { id: "placeholder-title-one",    title: "Placeholder Title One",    author: "Placeholder Author", seller: "Placeholder Seller", condition: "Like New",   description: BOOK_DESCRIPTION, sellerNote: SELLER_NOTE, coverColor: "#c0392b", genre: "Placeholder Genre", pages: "Placeholder Pages", shipping: "Placeholder Shipping" },
  { id: "placeholder-title-two",    title: "Placeholder Title Two",    author: "Placeholder Author", seller: "Placeholder Seller", condition: "Good",       description: BOOK_DESCRIPTION, sellerNote: SELLER_NOTE, coverColor: "#1f2937", genre: "Placeholder Genre", pages: "Placeholder Pages", shipping: "Placeholder Shipping" },
  { id: "placeholder-title-three",  title: "Placeholder Title Three",  author: "Placeholder Author", seller: "Placeholder Seller", condition: "Very Good",  description: BOOK_DESCRIPTION, sellerNote: SELLER_NOTE, coverColor: "#0f766e", genre: "Placeholder Genre", pages: "Placeholder Pages", shipping: "Placeholder Shipping" },
  { id: "placeholder-title-four",   title: "Placeholder Title Four",   author: "Placeholder Author", seller: "Placeholder Seller", condition: "Good",       description: BOOK_DESCRIPTION, sellerNote: SELLER_NOTE, coverColor: "#7c3aed", genre: "Placeholder Genre", pages: "Placeholder Pages", shipping: "Placeholder Shipping" },
  { id: "placeholder-title-five",   title: "Placeholder Title Five",   author: "Placeholder Author", seller: "Placeholder Seller", condition: "Like New",   description: BOOK_DESCRIPTION, sellerNote: SELLER_NOTE, coverColor: "#b45309", genre: "Placeholder Genre", pages: "Placeholder Pages", shipping: "Placeholder Shipping" },
  { id: "placeholder-title-six",    title: "Placeholder Title Six",    author: "Placeholder Author", seller: "Placeholder Seller", condition: "Good",       description: BOOK_DESCRIPTION, sellerNote: SELLER_NOTE, coverColor: "#0369a1", genre: "Placeholder Genre", pages: "Placeholder Pages", shipping: "Placeholder Shipping" },
  { id: "placeholder-title-seven",  title: "Placeholder Title Seven",  author: "Placeholder Author", seller: "Placeholder Seller", condition: "Like New",   description: BOOK_DESCRIPTION, sellerNote: SELLER_NOTE, coverColor: "#be185d", genre: "Placeholder Genre", pages: "Placeholder Pages", shipping: "Placeholder Shipping" },
  { id: "placeholder-title-eight",  title: "Placeholder Title Eight",  author: "Placeholder Author", seller: "Placeholder Seller", condition: "Good",       description: BOOK_DESCRIPTION, sellerNote: SELLER_NOTE, coverColor: "#065f46", genre: "Placeholder Genre", pages: "Placeholder Pages", shipping: "Placeholder Shipping" },
  { id: "placeholder-title-nine",   title: "Placeholder Title Nine",   author: "Placeholder Author", seller: "Placeholder Seller", condition: "Very Good",  description: BOOK_DESCRIPTION, sellerNote: SELLER_NOTE, coverColor: "#92400e", genre: "Placeholder Genre", pages: "Placeholder Pages", shipping: "Placeholder Shipping" },
  { id: "placeholder-title-ten",    title: "Placeholder Title Ten",    author: "Placeholder Author", seller: "Placeholder Seller", condition: "Good",       description: BOOK_DESCRIPTION, sellerNote: SELLER_NOTE, coverColor: "#4338ca", genre: "Placeholder Genre", pages: "Placeholder Pages", shipping: "Placeholder Shipping" },
  { id: "placeholder-title-eleven", title: "Placeholder Title Eleven", author: "Placeholder Author", seller: "Placeholder Seller", condition: "Like New",   description: BOOK_DESCRIPTION, sellerNote: SELLER_NOTE, coverColor: "#1e3a5f", genre: "Placeholder Genre", pages: "Placeholder Pages", shipping: "Placeholder Shipping" },
  { id: "placeholder-title-twelve", title: "Placeholder Title Twelve", author: "Placeholder Author", seller: "Placeholder Seller", condition: "Very Good",  description: BOOK_DESCRIPTION, sellerNote: SELLER_NOTE, coverColor: "#5b2333", genre: "Placeholder Genre", pages: "Placeholder Pages", shipping: "Placeholder Shipping" },
];

export function getBookById(bookId) {
  return SAMPLE_BOOKS.find((book) => book.id === bookId) ?? null;
}
