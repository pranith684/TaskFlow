// frontend/src/utils/auth.js

export const isAuthenticated = () => {
  // You might want to add token expiration check here in the future
  return !!localStorage.getItem("token");
};

// ✅ ENHANCEMENT: Pass the navigate function for redirection
export const logout = (navigate) => {
  localStorage.removeItem("token");
  // No need to remove userId if it's not being stored separately
  navigate('/');
};
