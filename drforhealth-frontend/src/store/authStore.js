import { create } from 'zustand';

import { authApi } from '@/api/authApi';
import { setAccessToken } from '@/api/axios';


export const useAuthStore = create((set) => ({

  // ==========================================================
  // STATE
  // ==========================================================

  user: null,

  isLoading: true,

  isAuthenticated: false,


  // ==========================================================
  // INITIALIZE AUTH
  // ==========================================================

  init: async () => {

    try {

      console.log(
        '[Auth] Initializing session...'
      );


      // ------------------------------------------------------
      // REFRESH ACCESS TOKEN
      // ------------------------------------------------------

      const refreshResponse =
        await authApi.refresh();


      // ------------------------------------------------------
      // GET ACCESS TOKEN
      // ------------------------------------------------------

      const newAccessToken =
        refreshResponse?.data?.accessToken ||
        refreshResponse?.data?.data?.accessToken;


      if (!newAccessToken) {

        throw new Error(
          'No access token received from refresh.'
        );

      }


      // ------------------------------------------------------
      // STORE ACCESS TOKEN IN MEMORY
      // ------------------------------------------------------

      setAccessToken(
        newAccessToken
      );


      // ------------------------------------------------------
      // GET CURRENT USER
      // ------------------------------------------------------

      const meResponse =
        await authApi.getMe();


      const user =
        meResponse?.data?.user ||
        meResponse?.data?.data?.user;


      if (!user) {

        throw new Error(
          'User information not received.'
        );

      }


      // ------------------------------------------------------
      // UPDATE AUTH STATE
      // ------------------------------------------------------

      set({

        user,

        isAuthenticated: true,

        isLoading: false,

      });


      console.log(
        '[Auth] Session initialized successfully.',
        user
      );


      return user;


    } catch (error) {

      console.log(
        '[Auth] No active session.'
      );


      // ------------------------------------------------------
      // CLEAR ACCESS TOKEN
      // ------------------------------------------------------

      setAccessToken(
        null
      );


      // ------------------------------------------------------
      // CLEAR AUTH STATE
      // ------------------------------------------------------

      set({

        user: null,

        isAuthenticated: false,

        isLoading: false,

      });


      return null;

    }

  },


  // ==========================================================
  // LOGIN
  // ==========================================================

  login: async (credentials) => {

    try {

      console.log(
        '[Auth] Login request started.'
      );


      // ------------------------------------------------------
      // LOGIN API
      // ------------------------------------------------------

      const response =
        await authApi.login(
          credentials
        );


      // ------------------------------------------------------
      // GET ACCESS TOKEN
      // ------------------------------------------------------

      const accessToken =
        response?.data?.accessToken ||
        response?.data?.data?.accessToken;


      // ------------------------------------------------------
      // GET USER
      // ------------------------------------------------------

      const user =
        response?.data?.user ||
        response?.data?.data?.user;


      // ------------------------------------------------------
      // ACCESS TOKEN VALIDATION
      // ------------------------------------------------------

      if (!accessToken) {

        throw new Error(
          'Access token was not received.'
        );

      }


      // ------------------------------------------------------
      // USER VALIDATION
      // ------------------------------------------------------

      if (!user) {

        throw new Error(
          'User information was not received.'
        );

      }


      // ------------------------------------------------------
      // STORE ACCESS TOKEN IN MEMORY
      // ------------------------------------------------------

      setAccessToken(
        accessToken
      );


      // ------------------------------------------------------
      // UPDATE AUTH STATE IMMEDIATELY
      // ------------------------------------------------------

      set({

        user,

        isAuthenticated: true,

        isLoading: false,

      });


      console.log(
        '[Auth] Login successful.',
        user
      );


      // ------------------------------------------------------
      // RETURN ORIGINAL RESPONSE DATA
      // ------------------------------------------------------

      return response.data;


    } catch (error) {

      console.error(
        '[Auth] Login failed:',
        error
      );


      // ------------------------------------------------------
      // CLEAR POSSIBLY INVALID TOKEN
      // ------------------------------------------------------

      setAccessToken(
        null
      );


      // ------------------------------------------------------
      // CLEAR AUTH STATE
      // ------------------------------------------------------

      set({

        user: null,

        isAuthenticated: false,

        isLoading: false,

      });


      throw error;

    }

  },


  // ==========================================================
  // LOGOUT
  // ==========================================================

  logout: async () => {

    try {

      await authApi.logout();


    } catch (error) {

      console.log(
        '[Auth] Logout API error:',
        error?.message
      );


    } finally {

      // ------------------------------------------------------
      // REMOVE ACCESS TOKEN
      // ------------------------------------------------------

      setAccessToken(
        null
      );


      // ------------------------------------------------------
      // CLEAR AUTH STATE
      // ------------------------------------------------------

      set({

        user: null,

        isAuthenticated: false,

        isLoading: false,

      });


      console.log(
        '[Auth] Logged out successfully.'
      );

    }

  },

}));