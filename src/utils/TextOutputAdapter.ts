// src/utils/TextOutputAdapter.ts

/**
 * Cleans a raw day_label string (e.g., "Mon-Upper-H") into a more readable format (e.g., "Upper H").
 * Rules:
 * 1. Remove everything up to and including the first '-'.
 * 2. Replace remaining non-alphanumeric characters (e.g., '-', '_') with a single space.
 * 3. Capitalize the first letter of each word.
 * @param raw The raw day_label string.
 * @returns The cleaned day_label string, or an empty string if input is null/undefined/empty.
 */
export function cleanDayLabel(raw: string | null | undefined): string {
  if (!raw) {
    return ''; // Or handle as 'Unnamed Day', depending on desired fallback
  }

  // 1. Remove everything up to and including the first '-'.
  const firstDashIndex = raw.indexOf('-');
  let processedLabel = firstDashIndex !== -1 ? raw.substring(firstDashIndex + 1) : raw;

  // 2. Replace remaining non-alphanumeric characters (e.g., '-', '_') with a single space.
  //    And trim leading/trailing spaces that might result.
  processedLabel = processedLabel.replace(/[^a-zA-Z0-9]+/g, ' ').trim();

  // 3. Capitalize the first letter of each word.
  if (!processedLabel) {
    return ''; // Handle cases like 'Mon-' which become empty after step 1 & 2
  }
  
  return processedLabel
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.substring(1).toLowerCase()) // Ensure rest is lowercase for consistency, or just word.substring(1) if mixed case is fine
    .join(' ');
}

/**
 * Cleans a raw split_type string (e.g., "push_pull_legs") into a more readable format (e.g., "Push Pull Legs").
 * Rules:
 * 1. Replace underscores with spaces.
 * 2. Capitalize the first letter of each word.
 * @param raw The raw split_type string.
 * @returns The cleaned split_type string, or an empty string if input is null/undefined/empty.
 */
/**
 * Formats a raw string from the database (e.g., "general_fitness", "push_pull_legs") 
 * into a human-readable format (e.g., "General Fitness", "Push Pull Legs").
 * Rules:
 * 1. Replaces underscores with spaces.
 * 2. Capitalizes the first letter of each word.
 * @param raw The raw string.
 * @returns The formatted string, or an empty string if input is null/undefined/empty.
 */
export function formatText(raw: string | null | undefined): string {
  if (!raw) {
    return '';
  }

  return raw
    .replace(/_/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.substring(1).toLowerCase())
    .join(' ');
}

/**
 * Cleans a raw split_type string (e.g., "push_pull_legs") into a more readable format (e.g., "Push Pull Legs").
 * This is an alias for formatText for semantic clarity in existing code.
 * @param raw The raw split_type string.
 * @returns The cleaned split_type string, or an empty string if input is null/undefined/empty.
 */
export function cleanSplitType(raw: string | null | undefined): string {
  return formatText(raw);
}

