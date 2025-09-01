// urlService.js
// This file acts like a client-side API layer that performs operations and uses loggingMiddleware for every operation.
// It stores URL mappings in localStorage under key "UM_URLS".
// Each mapping:
// { shortcode, longUrl, createdAt, expiresAt (ISO), clicks: number, clickDetails: [ {timestamp, referrer, source, geo} ] }

import dayjs from 'dayjs';
import loggingMiddleware from '../middleware/loggingMiddleware';
import { isValidUrl, isValidShortcode, toIntMinutes } from '../utils/validation';
import { generateShortcode } from '../utils/shortcode';

const STORE_KEY = 'UM_URLS';
const DEFAULT_VALIDITY_MINUTES = 30;

function readStore() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    localStorage.setItem(STORE_KEY, JSON.stringify([]));
    return [];
  }
}
function writeStore(items) {
  localStorage.setItem(STORE_KEY, JSON.stringify(items));
}

// helper to find mapping
export function findByShortcode(code) {
  const items = readStore();
  return items.find(i => i.shortcode === code);
}

// create multiple short links (accepts array)
export async function createShortLinks(entries = []) {
  // log attempt
  loggingMiddleware('create_attempt', { entriesCount: entries.length });

  if (!Array.isArray(entries) || entries.length === 0) {
    const r = { success: false, message: 'No entries provided' };
    loggingMiddleware('create_failed', r);
    return r;
  }
  const results = [];
  const store = readStore();

  for (let entry of entries.slice(0,5)) { // only up to 5
    const { longUrl, validityMinutes, preferredShortcode } = entry;

    // Validation
    if (!isValidUrl(longUrl)) {
      const r = { success: false, message: 'Invalid URL', longUrl };
      loggingMiddleware('create_entry_invalid_url', { longUrl });
      results.push(r);
      continue;
    }

    let minutes = toIntMinutes(validityMinutes);
    if (minutes === null) minutes = DEFAULT_VALIDITY_MINUTES;

    // Check shortcode validity or generate
    let chosen = preferredShortcode && preferredShortcode.trim() !== '' ? preferredShortcode.trim() : generateShortcode();

    if (preferredShortcode && !isValidShortcode(preferredShortcode)) {
      const r = { success: false, message: 'Invalid shortcode format', preferredShortcode };
      loggingMiddleware('create_entry_invalid_shortcode', r);
      results.push(r);
      continue;
    }

    // ensure uniqueness
    let collision = store.find(it => it.shortcode === chosen);
    if (collision) {
      // if user supplied custom shortcode and collision => error
      if (preferredShortcode) {
        const r = { success: false, message: 'Shortcode already exists', preferredShortcode };
        loggingMiddleware('create_entry_shortcode_collision', r);
        results.push(r);
        continue;
      } else {
        // generated collided (rare) -> generate until unique
        let attempts = 0;
        while (collision && attempts < 5) {
          chosen = generateShortcode();
          collision = store.find(it => it.shortcode === chosen);
          attempts++;
        }
        if (collision) {
          // fail
          const r = { success: false, message: 'Could not generate unique shortcode' };
          loggingMiddleware('create_entry_generate_failed', r);
          results.push(r);
          continue;
        }
      }
    }

    const createdAt = new Date().toISOString();
    const expiresAt = dayjs().add(minutes, 'minute').toISOString();

    const newEntry = {
      shortcode: chosen,
      longUrl,
      createdAt,
      expiresAt,
      clicks: 0,
      clickDetails: []
    };

    store.push(newEntry);
    results.push({ success: true, mapping: newEntry });
    loggingMiddleware('create_entry_success', { shortcode: chosen, longUrl, createdAt, expiresAt });
  }

  writeStore(store);
  loggingMiddleware('create_complete', { resultsCount: results.length });
  return { success: true, results };
}

// handle redirect when user navigates to /:shortcode
export async function handleRedirectIfShortcode(shortcode) {
  loggingMiddleware('redirect_attempt', { shortcode });
  const store = readStore();
  const mapping = store.find(it => it.shortcode === shortcode);
  if (!mapping) {
    const r = { success: false, message: 'Shortcode not found' };
    loggingMiddleware('redirect_failed_notfound', { shortcode });
    return r;
  }

  // check expiry
  if (dayjs().isAfter(dayjs(mapping.expiresAt))) {
    const r = { success: false, message: 'Shortlink expired' };
    loggingMiddleware('redirect_failed_expired', { shortcode, expiresAt: mapping.expiresAt });
    return r;
  }

  // record click (increment clicks and add detail)
  const referrer = document.referrer || 'direct';
  const timestamp = new Date().toISOString();
  // coarse geo: use navigator.language as a proxy (client-side only)
  const geo = (navigator && navigator.language) ? navigator.language : 'unknown';

  const click = { timestamp, referrer, source: 'client', geo };
  mapping.clicks = (mapping.clicks || 0) + 1;
  mapping.clickDetails = mapping.clickDetails || [];
  mapping.clickDetails.push(click);

  writeStore(store);
  loggingMiddleware('redirect_success', { shortcode, target: mapping.longUrl, click });

  return { success: true, target: mapping.longUrl };
}

// get all mappings (for stats)
export function getAllMappings() {
  loggingMiddleware('get_all_mappings');
  return readStore();
}
