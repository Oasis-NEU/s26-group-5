import { secureImageUrl } from "../../utils/image";
import { spineColor } from "../../utils/bookSpine";

/**
 * Renders a book cover image, falling back to a colored spine placeholder.
 *
 * @param {object}  book                 - book object with thumbnail and title
 * @param {string}  className            - applied to both the img and the placeholder div
 * @param {string}  placeholderClassName - extra class added to the placeholder div
 * @param {string}  titleClassName       - class for the title span inside the placeholder
 */
export default function BookCover({ book, className = "", placeholderClassName = "", titleClassName = "" }) {
  if (book?.thumbnail) {
    return (
      <img
        src={secureImageUrl(book.thumbnail)}
        alt={book.title}
        className={className}
      />
    );
  }
  return (
    <div
      className={[className, placeholderClassName].filter(Boolean).join(" ")}
      style={{ background: spineColor(book?.title ?? "x") }}
    >
      {titleClassName && <span className={titleClassName}>{book?.title}</span>}
    </div>
  );
}
