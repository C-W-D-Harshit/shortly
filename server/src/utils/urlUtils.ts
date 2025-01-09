import { customAlphabet } from "nanoid";

const ALPHABET =
  "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
const SHORT_ID_LENGTH = 7;

/**
 * Type definition for the short ID generator function
 */
type ShortIdGenerator = () => string;

/**
 * Generates a unique short ID for URLs
 * @returns A string of length SHORT_ID_LENGTH containing characters from ALPHABET
 */
export const generateShortId: ShortIdGenerator = customAlphabet(
  ALPHABET,
  SHORT_ID_LENGTH
);

/**
 * Validates if a string is a properly formatted URL
 * @param url URL string to validate
 * @returns boolean indicating if URL is valid
 */
export function isValidUrl(url: string): boolean {
  try {
    const urlObject = new URL(url);

    // Ensure protocol is http or https
    if (urlObject.protocol !== "http:" && urlObject.protocol !== "https:") {
      return false;
    }

    // Ensure there's a hostname
    if (!urlObject.hostname) {
      return false;
    }

    // Ensure hostname has at least one dot (e.g., example.com)
    if (!urlObject.hostname.includes(".")) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}
