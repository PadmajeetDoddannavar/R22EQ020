// loggingMiddleware.js
// This middleware records structured events to localStorage and exposes a function to push logs.
// Per instructions: DO NOT use console.log or built-in language loggers.
// Logs are stored as an array in localStorage under key "UM_LOGS".
// Each log: { id, eventType, payload, timestamp }

// We also track a simple analytics store to help the app display logs if needed.

import { v4 as uuidv4 } from 'uuid';

const LOG_KEY = 'UM_LOGS';

function readLogs() {
  try {
    const raw = localStorage.getItem(LOG_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    // If parsing fails, reset log store
    localStorage.setItem(LOG_KEY, JSON.stringify([]));
    return [];
  }
}

function writeLogs(logs) {
  localStorage.setItem(LOG_KEY, JSON.stringify(logs));
}

/**
 * loggingMiddleware(eventType, payload)
 * - eventType: string
 * - payload: any JSON-serializable object
 *
 * The middleware stores the log with a timestamp and returns the saved log object.
 */
export default function loggingMiddleware(eventType, payload = {}) {
  try {
    const logs = readLogs();
    const entry = {
      id: uuidv4(),
      eventType,
      payload,
      timestamp: new Date().toISOString()
    };
    logs.push(entry);
    writeLogs(logs);
    // Return entry for callers who want it
    return { success: true, entry };
  } catch (err) {
    // If log writing fails, return structured failure (do NOT console.log)
    return { success: false, message: 'Logging failed', error: String(err) };
  }
}

// Utility to query logs (used by stats page)
export function getLogs() {
  return readLogs();
}

// Utility to clear logs (for development/testing)
export function clearLogs() {
  writeLogs([]);
}
