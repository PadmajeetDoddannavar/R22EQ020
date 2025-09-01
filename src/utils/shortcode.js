// shortcode.js
import { v4 as uuidv4 } from 'uuid';

// generate a compact shortcode (6 chars base36 from uuid)
export function generateShortcode() {
  const id = uuidv4().replace(/-/g, '');
  // take first 8 hex chars and convert to base36 to shorten
  const hex = id.slice(0, 8);
  return parseInt(hex, 16).toString(36).slice(0, 7);
}
