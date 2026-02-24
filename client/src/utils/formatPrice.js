/**
 * Formats a number into Indian currency format (Lakhs/Crores).
 * @param {number} price - The price to format.
 * @returns {string} - Formatted price string.
 */
export const formatIndianPrice = (price) => {
  if (price === null || price === undefined) return "N/A";

  const numPrice = Number(price);
  if (isNaN(numPrice)) return price;

  if (numPrice >= 10000000) {
    return `₹ ${(numPrice / 10000000).toFixed(2)} Cr`;
  } else if (numPrice >= 100000) {
    return `₹ ${(numPrice / 100000).toFixed(2)} Lakh`;
  } else {
    return `₹ ${numPrice.toLocaleString("en-IN")}`;
  }
};
