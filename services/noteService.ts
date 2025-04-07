/**
 * Generates a simple pseudo-random ID.
 * Replace with a more robust UUID generator if needed.
 */
export const generateNoteId = (): string => {
  return Math.random().toString(36).substring(2, 15);
}; 