/**
 * Reusable pluralization helper
 * e.g. pluralize(1, "draft", "drafts") -> "1 draft"
 *      pluralize(2, "draft", "drafts") -> "2 drafts"
 */
export function pluralize(count: number, singular: string, plural?: string): string {
  const word = count === 1 ? singular : (plural ?? `${singular}s`);
  return `${count} ${word}`;
}

/**
 * Detects whether the current user is on macOS
 */
export function isMacPlatform(): boolean {
  if (typeof window === "undefined" || !window.navigator) return false;
  return /Mac|iPod|iPhone|iPad/.test(window.navigator.platform);
}

/**
 * Truncates an ID or string in the middle with an ellipsis
 * e.g. "2w-ng1CTUiLGqpZ6" -> "2w-ng1…pZ6"
 */
export function middleTruncate(str: string, leadChars = 5, tailChars = 4): string {
  if (!str || str.length <= leadChars + tailChars + 1) return str;
  return `${str.slice(0, leadChars)}…${str.slice(-tailChars)}`;
}

/**
 * Returns a clean, shortened display representation of a form's public URL
 * e.g. "localhost:3000/f/2w-ng1…pZ6" or "formly.app/f/2w-ng1…pZ6"
 */
export function formatShareDisplay(shareId: string): string {
  if (!shareId) return "";
  const host = typeof window !== "undefined" ? window.location.host : "formly.app";
  return `${host}/f/${middleTruncate(shareId, 5, 4)}`;
}
