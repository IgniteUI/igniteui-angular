const timestamp = new Date().toLocaleTimeString("en-US", {
  hour12: false,
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
});

const red = "\x1b[31m";
const info = "\x1b[35m";
const dim = "\x1b[2m";
const reset = "\x1b[0m";

/**
 * Log formatter with timestamp and colored category
 * @param {string} category - Log category (will be colored)
 * @param {string} message - Log message
 */
export function log(category, message) {
  console.info(`${dim}${timestamp} ${info}[${category}]${reset} ${message}`);
}

/**
 * Log error with timestamp and colored category
 * @param {string} category - Log category (will be colored)
 * @param {string} message - Error message
 * @param {Error} [error] - Optional error object
 */
export function logError(category, message, error) {
  console.error(
    `${dim}${timestamp} ${info}[${category}]${reset} ${red}${message}${reset}`,
  );

  if (error && error.message) {
    console.error(
      `${" ".repeat(timestamp.length + category.length + 3)} ${error.message}`,
    );
  }
}

