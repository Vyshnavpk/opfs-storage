// Utilitie functions

/**
 * Lower case the first letter of the string.
 * @param {string} val - The string.
 * @returns {string} Lower cased string.
 */

function lowerCaseFirstLetter(val) {
  return String(val).charAt(0).toLowerCase() + String(val).slice(1);
}

export { lowerCaseFirstLetter };
