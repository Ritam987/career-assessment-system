/**
 * ============================================================================
 * PROTECTED ROUTE GUARD COMPONENT (ProtectedRoute.jsx)
 * ============================================================================
 * Purpose: Route guard component enforcing client-side authorization rules.
 * Redirects unauthenticated users to `/login`, non-admin users attempting
 * admin routes to `/admin`, and prevents admin users from taking user tests.
 * ============================================================================
 */

// 1. Core React & Router Imports
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Auth state context hook

/**
 * Protected Route Wrapper Component
 * @param {Object} props
 * @param {React.ReactNode} props.children - Target protected page component
 * @param {boolean} props.adminOnly - Flag requiring Admin credentials
 * @param {boolean} props.blockAdmin - Flag blocking Admins from user-only pages
 */
const ProtectedRoute = ({ children, adminOnly = false, blockAdmin = false }) => {
  const { user, isAdmin, loading } = useAuth();

  // A. Return null while session check is loading on initial render
  if (loading) return null;

  // Derive effective auth status checking both React state and localStorage to prevent navigation race condition
  const hasAdminToken = Boolean(localStorage.getItem('adminToken') || localStorage.getItem('adminData'));
  const hasUserToken = Boolean(localStorage.getItem('token') || localStorage.getItem('user'));

  const effectiveIsAdmin = isAdmin || hasAdminToken;
  const effectiveUser = user || hasUserToken;

  // B. Redirect non-admins attempting to access admin-only routes
  if (adminOnly && !effectiveIsAdmin) return <Navigate to="/admin" replace />;

  // C. Redirect unauthenticated guests attempting to access protected user routes
  if (!effectiveUser && !effectiveIsAdmin && !adminOnly) return <Navigate to="/login" replace />;

  // D. Redirect admins attempting to take user assessment tests back to homepage
  if (blockAdmin && effectiveIsAdmin) return <Navigate to="/" replace />;

  // E. Render target protected page component if all security checks pass
  return children;
};

export default ProtectedRoute;
