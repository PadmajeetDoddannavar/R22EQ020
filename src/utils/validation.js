// validation.js
export function isValidUrl(value) {
  try {
    // allow http/https only
    const u = new URL(value);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

export function isValidShortcode(s) {
  if (!s) return false;
  // Alphanumeric, hyphen and underscore allowed, length 3-20
  return /^[A-Za-z0-9_-]{3,20}$/.test(s);
}

export function toIntMinutes(v) {
  const n = Number(v);
  if (Number.isInteger(n) && n >= 0) return n;
  return null;
}
