/**
 * API origin helper.
 *
 * In Vite dev, API calls stay on the same host/port as the frontend
 * (e.g. http://192.168.x.x:5173/api/...) and Vite proxies them to the
 * backend on 127.0.0.1:5000. That way a phone on Wi-Fi never has to
 * open port 5000, and never talks to "localhost" (which would be the phone).
 *
 * Override only if you must: VITE_API_URL=http://192.168.x.x:5000
 */
export const getApiBaseUrl = () => {
  const fromEnv = import.meta.env.VITE_API_URL;
  if (fromEnv && String(fromEnv).trim()) {
    return String(fromEnv).replace(/\/$/, '');
  }

  // Same-origin: laptop localhost, LAN IP, and real phones all work.
  return '';
};

export const apiUrl = (path = '') => {
  const base = getApiBaseUrl();
  const suffix = path.startsWith('/') ? path : `/${path}`;
  return `${base}${suffix}`;
};

export const API_BASE_URL = getApiBaseUrl();

if (typeof window !== 'undefined') {
  console.log('🔗 API Base URL:', getApiBaseUrl() || window.location.origin);
  console.log('🌐 Page origin:', window.location.origin);
}
