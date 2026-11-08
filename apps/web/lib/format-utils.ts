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
