// src/utils/asset.js
// Build absolute URLs for assets, respecting Vite's BASE_URL (can be '/app/' or '/')
export function assetUrl(path) {
  const rawBase = (typeof import.meta !== 'undefined' && import.meta.env && typeof import.meta.env.BASE_URL === 'string')
    ? import.meta.env.BASE_URL
    : '/';
  const origin = (typeof window !== 'undefined' && window.location && window.location.origin)
    ? window.location.origin
    : '';
  const baseURL = new URL(rawBase || '/', origin);
  const clean = String(path || '').replace(/^\/+/, '');
  return new URL(clean, baseURL).toString();
}