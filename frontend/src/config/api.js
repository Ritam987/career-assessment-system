/**
 * API origin helper.
 * Configured for Production Railway Backend URL:
 * https://career-assessment-system-production.up.railway.app
 */
export const getApiBaseUrl = () => {
  const fromEnv =
    import.meta.env.REACT_APP_BACKEND_URL ||
    import.meta.env.VITE_API_URL ||
    import.meta.env.VITE_BACKEND_URL;

  if (fromEnv && String(fromEnv).trim()) {
    return String(fromEnv).replace(/\/$/, '');
  }

  // Deployed Railway Production Backend URL
  return 'https://career-assessment-system-production.up.railway.app';
};

export const apiUrl = (path = '') => {
  const base = getApiBaseUrl();
  const suffix = path.startsWith('/') ? path : `/${path}`;
  return `${base}${suffix}`;
};

export const API_BASE_URL = getApiBaseUrl();

if (typeof window !== 'undefined') {
  console.log('🔗 API Base URL:', getApiBaseUrl());
  console.log('🌐 Page origin:', window.location.origin);
}
