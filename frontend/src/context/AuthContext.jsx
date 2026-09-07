/**
 * ============================================================================
 * AUTHENTICATION CONTEXT PROVIDER (AuthContext.jsx)
 * ============================================================================
 * Purpose: Manages global authentication state across the frontend application.
 * Tracks user login status, user profile object, admin credentials state,
 * local storage token persistence, and provides login/logout helper methods.
 * ============================================================================
 */

// 1. Core React Imports
import React, { createContext, useContext, useEffect, useState } from 'react';

// 2. API Service Function Imports
import { getUserProfile } from '../services/getUserProfile'; // Service to fetch current profile details
import { logout as apiLogout } from '../services/auth';       // Service to call backend logout endpoint

// Create React Context object for Auth
const AuthContext = createContext(null);

/**
 * AuthProvider Wrapper Component
 * Serves user & admin authentication state and actions to child components.
 */
export const AuthProvider = ({ children }) => {
  // State variables for tracking authentication
  const [user, setUser] = useState(null);       // Current logged-in user profile object
  const [isAdmin, setIsAdmin] = useState(false); // Flag indicating if user has active admin session
  const [loading, setLoading] = useState(true);  // Loading flag while verifying existing session on mount

  // On component mount, check for saved localStorage tokens and initialize session
  useEffect(() => {
    const init = async () => {
      // Check if admin credentials exist in local storage
      const adminData = localStorage.getItem('adminData');
      if (adminData) {
        setIsAdmin(true);
      }

      // Check if user auth token exists in local storage
      const token = localStorage.getItem('token');
      if (token) {
        try {
          // Fetch authenticated user profile details from backend API
          const res = await getUserProfile();
          if (res && res.user) {
            setUser(res.user);
          }
        } catch (err) {
          console.error('Session initialization error:', err);
        }
      }
      // Session verification complete
      setLoading(false);
    };
    init();
  }, []);

  /**
   * Helper function to perform User login state update
   * @param {string} token - JWT Authentication Token
   * @param {Object} userObj - User details payload object
   */
  const loginUser = (token, userObj) => {
    if (token) localStorage.setItem('token', token);
    if (userObj) setUser(userObj);
  };

  /**
   * Helper function to perform Admin login state update
   * @param {string} token - Admin JWT Token
   * @param {Object} adminObj - Admin payload object
   */
  const loginAdmin = (token, adminObj) => {
    if (token) localStorage.setItem('adminToken', token);
    if (adminObj) localStorage.setItem('adminData', JSON.stringify(adminObj));
    setIsAdmin(true);
  };

  /**
   * Helper function to clear session and perform Logout
   */
  const logout = async () => {
    try {
      // Call backend logout endpoint to clear HTTP-Only cookie
      await apiLogout();
    } catch (e) {
      // Ignore logout request errors and proceed to clear local state
    }
    // Purge local storage authentication tokens
    localStorage.removeItem('token');
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminData');
    localStorage.removeItem('user');
    
    // Reset React state variables
    setUser(null);
    setIsAdmin(false);
  };

  return (
    // Provide state and action methods through Context value
    <AuthContext.Provider value={{ user, isAdmin, loading, loginUser, loginAdmin, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Custom Hook to consume AuthContext easily in components
 */
export const useAuth = () => useContext(AuthContext);

export default AuthContext;
