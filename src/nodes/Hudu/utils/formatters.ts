/**
 * String formatting utilities
 */

/**
 * Formats a string to title case and replaces underscores with spaces
 * Example: "hello_world_test" -> "Hello World Test"
 */
export function formatTitleCase(str: string): string {
  // First split by underscores
  return str
    .split('_')
    // Then split any camelCase words
    .map(word => {
      return word
        .replace(/([A-Z])/g, ' $1') // Add space before capital letters
        .trim() // Remove leading space from first word
        .split(' ') // Split into array of words
        .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()) // Capitalize each word
        .join(' '); // Join back with spaces
    })
    .join(' ');
}