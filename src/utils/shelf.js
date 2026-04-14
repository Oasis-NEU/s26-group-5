/**
 * Splits an array of items into shelf rows.
 * @param {Array} items
 * @param {number} perShelf - max items per shelf
 * @param {number} minShelves - minimum number of shelves (padded with empty arrays)
 * @returns {Array[]}
 */
export function createShelves(items, perShelf, minShelves) {
  const shelves = [];
  for (let i = 0; i < items.length; i += perShelf)
    shelves.push(items.slice(i, i + perShelf));
  while (shelves.length < minShelves) shelves.push([]);
  return shelves;
}
