# Design Document — URL Shortener (Frontend)

## Purpose
Single-page React application implementing URL shortening functionality, redirect handling, and statistics - all client-side.

## Technology choices
- React + Create React App (ensures port 3000)
- Material UI for UI components and responsiveness
- react-router-dom for client-side routes and redirect handling
- localStorage as persistent store (simple, deterministic, offline)
- dayjs for date formatting and expiry calculations
- custom logging middleware that writes logs to localStorage (no console logs)

## Key design decisions
1. **Client-side only:** No backend allowed per assignment. localStorage stores URL mappings and logs.
2. **Logging middleware:** `middleware/loggingMiddleware.js` — writes structured logs to localStorage under `UM_LOGS`. Integrated from the first app lifecycle event.
3. **Data model (URL mapping):**
