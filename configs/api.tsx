// config/api.ts
// Simple API Configuration
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://allupipay.in/publicsewa/api';


export const API_BASE_URL2 = process.env.NEXT_PUBLIC_API_URL || 'https://allupipay.in/publicsewa/api/users';

export const API_ENDPOINTS2 = {
  // Auth endpoints
  AUTH: {
    LOGIN: `${API_BASE_URL2}/login.php`,
    REGISTER: `${API_BASE_URL2}/register`,
    LOGOUT: `${API_BASE_URL2}/logout`,
    PROFILE: `${API_BASE_URL2}/profile`,
    MOBILE_VALIDATION: `${API_BASE_URL2}/check-mobile.php`,
    CATEGORY_LIST: `${API_BASE_URL2}/category_list.php`,
    MAIN_SEARCH: `${API_BASE_URL2}/main-search.php`,
  },
}


// API Endpoints
export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    LOGIN: `${API_BASE_URL}/login.php`,
    REGISTER: `${API_BASE_URL}/register`,
    LOGOUT: `${API_BASE_URL}/logout`,
    PROFILE: `${API_BASE_URL}/profile`,
  },
  
  // User endpoints
  USER: {
    PROFILE: `${API_BASE_URL}/user/profile`,
    UPDATE: `${API_BASE_URL}/user/update`,
  },

  // Business endpoints
  BUSINESS: {
    LIST: `${API_BASE_URL}/business/list`,
    CREATE: `${API_BASE_URL}/business/create`,
    SEARCH: `${API_BASE_URL}/business/search`,
  },
};

// Common headers
export const getAuthHeaders = () => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  // Add authorization header if token exists
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('authToken');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  return headers;
};