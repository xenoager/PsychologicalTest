/**
 * Lightweight GA4 helpers.
 * Assumes gtag.js is loaded via index.html and VITE_GA_ID is set.
 */
export function sendEvent(name, params = {}) {
  try {
    if (typeof window === "undefined" || !window.gtag) return;
    window.gtag("event", name, params);
  } catch (e) {
    // no-op
  }
}
