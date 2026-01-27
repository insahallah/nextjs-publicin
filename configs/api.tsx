// config/api.ts
// Simple API Configuration

//https://apidata.bar/
//export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://allupipay.in/publicsewa/api';

//export const IMAGES_URL = process.env.NEXT_PUBLIC_API_URL || 'https://allupipay.in/publicsewa/images';
//export const API_BASE_URL2 = process.env.NEXT_PUBLIC_API_URL || 'https://allupipay.in/publicsewa/api/users';


export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://apidata.bar/publicsewa/api';

export const IMAGES_URL = process.env.NEXT_PUBLIC_API_URL || 'https://apidata.bar/publicsewa/images';
export const API_BASE_URL2 = process.env.NEXT_PUBLIC_API_URL || 'https://apidata.bar/publicsewa/api/users';

export const API_ENDPOINTS2 = {
  // Auth endpoints 
  AUTH: {
    LOGIN: `${API_BASE_URL2}/login.php`,
    REGISTER: `${API_BASE_URL2}/register.php`,
    LOGOUT: `${API_BASE_URL2}/logout`,
    FORGOT_PASSWORD: `${API_BASE_URL2}/forgot_password.php`,
    PROFILE: `${API_BASE_URL2}/profile`,
    MOBILE_VALIDATION: `${API_BASE_URL2}/check-mobile.php`,
    CATEGORY_LIST: `${API_BASE_URL2}/category_list.php`,
    MAIN_SEARCH: `${API_BASE_URL2}/main-search.php`,
    BUSINESS_SUBMISSION: `${API_BASE_URL2}/business_submissions.php`,
    DISTRICT_LIST: `${API_BASE_URL2}/district_list.php`,
    GET_BLOCK: `${API_BASE_URL2}/get_blocks.php`,
    FETCH_BUSINESS_BY_USER_ID: `${API_BASE_URL2}/fetch-business-by-user-id.php`,
    BUSINESS_VIEW_RIGHTSIDE: `${API_BASE_URL2}/business_view_rightside.php`,
    GET_VILLAGE_FOR_FILTER: `${API_BASE_URL2}/get_villages_for_filter.php`,
    USERS_PROFILE_UPDATE: `${API_BASE_URL2}/users_profile_update.php`,
    FETCH_USER_SECTION_DATA_FOR_UPDATE: `${API_BASE_URL2}/fetch_user_section_data_for_update_web.php`,
    FETCH_USER_SECTION_DATA_ALL_ADDRESS_FOR_UPDATE: `${API_BASE_URL2}/user_profiles/fetch_user_section_data_all_address_for_update_web.php`,
    FETCH_FEMILYFRIEND_DATA_FOR_UPDATE: `${API_BASE_URL2}/user_profiles/fetch_FamilyFriends_data_for_web.php`,
    DISPLAY_PROFILE_DATA_FOR_RIGHTMODLE: `${API_BASE_URL2}/business_profile/display_business_profile_data_for_RightModel.php`,
    BUSSINESS_FETCH_DATA: `${API_BASE_URL2}/bussiness_edit_page/bussiness_fetch_data.php`,
    BUSSINESS_EDIT_PAGE: `${API_BASE_URL2}/bussiness_edit_page/bussiness_edit_page.php`,
    BUSSINESS_CONTACT_FETCH_FOR_DISPLAY: `${API_BASE_URL2}/business_contact_edit/business_contact_fetch_for_display.php`,
    BUSSINESS_CONTACT_UPDATE: `${API_BASE_URL2}/business_contact_edit/business_contact_update.php`,
    BUSSINESS_ADDRESS_FETCH: `${API_BASE_URL2}/bussiness_address_edit/bussiness_address_fetch.php`,
    BUSSINESS_ADDRESS_UPDATE: `${API_BASE_URL2}/bussiness_address_edit/bussiness_address_edit.php`,
    SUBMIT_REVIEW: `${API_BASE_URL2}/submit_review.php`, 
    GET_REVIEW_FOR_ONE_BUSSINESS: `${API_BASE_URL2}/get_reviews_for_one_bussiness.php`,
    GET_BUSINESS_BY_ID_FOR_WEB: `${API_BASE_URL2}/get-business-by-id-for-web.php`,
    BUSINESS_DETAILS: `${API_BASE_URL2}/business-details.php`,
    MAIN_SEARCH_DISPLAY_REQUEST_FOR_WEB: `${API_BASE_URL2}/main-search-display-request-for-web.php`,
    GET_MULTI_BUSINESS_PHOTO_BY_ID: `${API_BASE_URL2}/get-multi-business-photos_by_id.php`,
     MATADATA: `${API_BASE_URL2}/matadata.php`,

 
   


  }
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