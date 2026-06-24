/**
 * src/config/env.js
 * ─────────────────────────────────────────────────────────────────
 * Centralized environment configuration for the Campus Notice app.
 *
 * All API URLs are derived from a single REACT_APP_API_URL variable:
 *   - Development (.env.development): http://localhost:5000
 *   - Production   (.env.production): https://campus-notice-8s0b.onrender.com
 *
 * Usage:
 *   import { API_BASE_URL, API_URL, SOCKET_URL } from '../config/env';
 *
 *   // For Axios baseURL  → use API_URL      (includes /api)
 *   // For image <img src> → use API_BASE_URL (no /api suffix)
 *   // For Socket.IO       → use SOCKET_URL   (same as API_BASE_URL)
 * ─────────────────────────────────────────────────────────────────
 */

/** Raw backend origin — e.g. http://localhost:5000 */
export const API_BASE_URL =
  (process.env.REACT_APP_API_URL || 'http://localhost:5000').replace(/\/$/, '');

/** Base URL for all REST API calls — includes /api suffix */
export const API_URL = API_BASE_URL.endsWith('/api')
  ? API_BASE_URL
  : `${API_BASE_URL}/api`;

/** Socket.IO server URL (same origin as the backend, no path) */
export const SOCKET_URL = API_BASE_URL;
