/**
 * Transforms text to uppercase
 * @param {string} value - The input value to transform
 * @returns {string} The transformed value in uppercase
 */
export default function uppercase(value) {
  if (!value) return '';
  return value.toString().toUpperCase();
}
