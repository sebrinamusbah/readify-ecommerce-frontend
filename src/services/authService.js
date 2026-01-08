import api from "./api";

export const authService = {
  // Register user
  register: (userData) => api.post("/auth/register", userData),

  // Login user
  login: (credentials) => api.post("/auth/login", credentials),

  // Get current user
  getCurrentUser: () => api.get("/auth/me"),

  // Logout
  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },

  // Save auth data
  setAuthData: (token, user) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
  },

  // Check if authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem("token");
  },

  // Get stored user
  getStoredUser: () => {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  },
};
