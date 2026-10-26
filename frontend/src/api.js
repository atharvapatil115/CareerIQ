const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

export function apiUrl(path) {
  const normalizedPath = path.startsWith("/")
    ? path
    : `/${path}`;

  if (import.meta.env.DEV) {
    return `/api${normalizedPath}`;
  }

  return `${API_BASE_URL}${normalizedPath}`;
}

export default API_BASE_URL;