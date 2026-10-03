import axios from 'axios';


// ============================================================
// MAIN API INSTANCE
// ============================================================

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
});


// ============================================================
// REFRESH API INSTANCE
// ============================================================
//
// IMPORTANT:
//
// Refresh request ke liye separate Axios instance use kar rahe hain.
//
// Isse /auth/refresh khud main interceptor ke andar nahi aata.
// ============================================================

const refreshApi = axios.create({
  baseURL: '/api',
  withCredentials: true,
});


// ============================================================
// ACCESS TOKEN
// ============================================================

let accessToken = null;


// ------------------------------------------------------------
// SET ACCESS TOKEN
// ------------------------------------------------------------

export const setAccessToken = (token) => {
  accessToken = token || null;
};


// ------------------------------------------------------------
// GET ACCESS TOKEN
// ------------------------------------------------------------

export const getAccessToken = () => {
  return accessToken;
};


// ============================================================
// REQUEST INTERCEPTOR
// ============================================================

api.interceptors.request.use(
  (config) => {

    // Make sure headers exists
    config.headers = config.headers || {};


    // --------------------------------------------------------
    // Attach current access token
    // --------------------------------------------------------

    if (accessToken) {

      config.headers.Authorization =
        `Bearer ${accessToken}`;

    }


    return config;

  },

  (error) => {
    return Promise.reject(error);
  }
);


// ============================================================
// TOKEN REFRESH MANAGEMENT
// ============================================================

let isRefreshing = false;

let refreshSubscribers = [];


// ============================================================
// SUBSCRIBE REQUEST
// ============================================================

const subscribeTokenRefresh = (callback) => {

  refreshSubscribers.push(callback);

};


// ============================================================
// NOTIFY TOKEN REFRESH
// ============================================================

const notifyTokenRefresh = (
  newToken
) => {

  refreshSubscribers.forEach(
    (callback) => {
      callback(newToken);
    }
  );

  refreshSubscribers = [];

};


// ============================================================
// REJECT QUEUED REQUESTS
// ============================================================

const rejectTokenRefresh = (
  error
) => {

  refreshSubscribers.forEach(
    (callback) => {
      callback(null, error);
    }
  );

  refreshSubscribers = [];

};


// ============================================================
// REFRESH ACCESS TOKEN
// ============================================================

const refreshAccessToken = async () => {

  console.log(
    '[Auth] Requesting new access token...'
  );


  const response =
    await refreshApi.post(
      '/auth/refresh'
    );


  // ----------------------------------------------------------
  // Support both possible backend response formats
  // ----------------------------------------------------------

  const newAccessToken =
    response.data?.accessToken ||
    response.data?.data?.accessToken;


  if (!newAccessToken) {

    throw new Error(
      'Refresh endpoint did not return an access token.'
    );

  }


  // ----------------------------------------------------------
  // Save new token
  // ----------------------------------------------------------

  setAccessToken(
    newAccessToken
  );


  console.log(
    '[Auth] Access token refreshed successfully.'
  );


  return newAccessToken;

};


// ============================================================
// RESPONSE INTERCEPTOR
// ============================================================

api.interceptors.response.use(

  // ----------------------------------------------------------
  // SUCCESS
  // ----------------------------------------------------------

  (response) => {

    return response;

  },


  // ----------------------------------------------------------
  // ERROR
  // ----------------------------------------------------------

  async (error) => {

    const originalRequest =
      error.config;


    // --------------------------------------------------------
    // No request information
    // --------------------------------------------------------

    if (!originalRequest) {

      return Promise.reject(
        error
      );

    }


    const status =
      error.response?.status;


    const url =
      originalRequest.url || '';


    // ========================================================
    // ENDPOINTS THAT MUST NEVER TRIGGER REFRESH
    // ========================================================

    const noRefreshEndpoints = [

      '/auth/login',

      '/auth/register',

      '/auth/forgot-password',

      '/auth/reset-password',

      '/auth/verify-email',

      '/auth/google',

      '/auth/google/callback',

      '/auth/refresh',

    ];


    const shouldNotRefresh =
      noRefreshEndpoints.some(
        (endpoint) =>
          url.includes(endpoint)
      );


    // ========================================================
    // ONLY HANDLE 401
    // ========================================================

    if (

      status !== 401 ||

      originalRequest._retry ||

      shouldNotRefresh

    ) {

      return Promise.reject(
        error
      );

    }


    // ========================================================
    // MARK REQUEST AS RETRIED
    // ========================================================

    originalRequest._retry =
      true;


    // ========================================================
    // IF REFRESH IS ALREADY RUNNING
    // ========================================================

    if (isRefreshing) {

      console.log(
        '[Auth] Refresh already running. Queuing request...'
      );


      return new Promise(
        (resolve, reject) => {

          subscribeTokenRefresh(
            (newToken, refreshError) => {

              // ------------------------------------------------
              // Refresh failed
              // ------------------------------------------------

              if (
                refreshError ||
                !newToken
              ) {

                reject(
                  refreshError ||
                  new Error(
                    'Unable to refresh access token.'
                  )
                );

                return;

              }


              // ------------------------------------------------
              // Ensure headers exist
              // ------------------------------------------------

              originalRequest.headers =
                originalRequest.headers ||
                {};


              // ------------------------------------------------
              // Attach new token
              // ------------------------------------------------

              originalRequest.headers.Authorization =
                `Bearer ${newToken}`;


              // ------------------------------------------------
              // Retry original request
              // ------------------------------------------------

              resolve(
                api(originalRequest)
              );

            }
          );

        }
      );

    }


    // ========================================================
    // START TOKEN REFRESH
    // ========================================================

    isRefreshing = true;


    try {

      console.log(
        '[Auth] Access token expired. Refreshing...'
      );


      const newAccessToken =
        await refreshAccessToken();


      // ======================================================
      // UPDATE ORIGINAL REQUEST
      // ======================================================

      originalRequest.headers =
        originalRequest.headers ||
        {};


      originalRequest.headers.Authorization =
        `Bearer ${newAccessToken}`;


      // ======================================================
      // NOTIFY WAITING REQUESTS
      // ======================================================

      notifyTokenRefresh(
        newAccessToken
      );


      // ======================================================
      // RETRY ORIGINAL REQUEST
      // ======================================================
      //
      // IMPORTANT:
      //
      // This includes:
      //
      // POST /ebooks/admin
      //
      // with FormData / multipart files.
      //
      // ======================================================

      console.log(
        '[Auth] Retrying original request:',
        originalRequest.method?.toUpperCase(),
        originalRequest.url
      );


      return api(
        originalRequest
      );


    } catch (refreshError) {

      // ======================================================
      // REFRESH FAILED
      // ======================================================

      console.error(
        '[Auth] Token refresh failed:',
        refreshError.response?.data ||
        refreshError.message
      );


      // ------------------------------------------------------
      // Reject queued requests
      // ------------------------------------------------------

      rejectTokenRefresh(
        refreshError
      );


      // ------------------------------------------------------
      // Clear access token
      // ------------------------------------------------------

      setAccessToken(
        null
      );


      return Promise.reject(
        refreshError
      );


    } finally {

      // ------------------------------------------------------
      // Allow another refresh in future
      // ------------------------------------------------------

      isRefreshing = false;

    }

  }

);


// ============================================================
// EXPORT
// ============================================================

export default api;