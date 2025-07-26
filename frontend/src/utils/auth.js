// frontend/src/utils/auth.js

import { jwtDecode } from 'jwt-decode';

export const isAuthenticated = () => {
  const token = localStorage.getItem("token");
  if (!token) {
    return false;
  }
  try {
    const { exp } = jwtDecode(token);
    // Check if the token has expired
    if (Date.now() >= exp * 1000) {
      localStorage.removeItem("token"); // Clean up expired token
      return false;
    }
  } catch (err) {
    // If there's an error decoding, the token is invalid
    localStorage.removeItem("token"); // Clean up invalid token
    return false;
  }
  return true;
};

// ENHANCEMENT: Pass the navigate function for redirection
export const logout = (navigate) => {
  localStorage.removeItem("token");
  // No need to remove userId if it's not being stored separately
  navigate('/');
};
