import React, { createContext, useState, useContext, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext(null);

// Create axios instance with base URL
const api = axios.create({
  baseURL: "http://localhost:5000", // Your backend base URL
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor to include token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle token expiration and errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.dispatchEvent(new Event("user-auth-change"));
    }
    return Promise.reject(error);
  }
);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Function to check and set user from localStorage and verify with backend
  const checkUser = async () => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (token && storedUser) {
      try {
        // Since you might not have a verify endpoint, we can check by fetching user profile
        const response = await api.get("/api/user/profile"); // Adjust based on your user routes

        if (response.data) {
          setUser(JSON.parse(storedUser));
        } else {
          // Token is invalid, clear storage
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          setUser(null);
        }
      } catch (error) {
        console.error("Token verification failed:", error);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
      }
    } else {
      setUser(null);
    }
  };

  useEffect(() => {
    // Check if user is logged in on initial load
    const initAuth = async () => {
      await checkUser();
      setLoading(false);
    };

    initAuth();

    // Listen for storage events (login/logout from other tabs/windows)
    const handleStorageChange = (e) => {
      if (e.key === "token" || e.key === "user") {
        checkUser();
      }
    };

    // Custom event for login/logout within same tab
    const handleAuthChange = () => {
      checkUser();
    };

    // Add event listeners
    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("user-auth-change", handleAuthChange);

    // Cleanup event listeners
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("user-auth-change", handleAuthChange);
    };
  }, []);

  // AUTH ENDPOINTS
  const login = async (email, password) => {
    setError(null);
    try {
      const response = await api.post("/api/auth/login", {
        email,
        password,
      });

      const { token, user: userData } = response.data;

      // Store token and user data
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(userData));

      // Set user in state
      setUser(userData);

      // Dispatch custom event for same tab
      window.dispatchEvent(new Event("user-auth-change"));

      return userData;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Login failed. Please check your credentials.";
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const register = async (userData) => {
    setError(null);
    try {
      const response = await api.post("/api/auth/register", userData);

      const { token, user: registeredUser } = response.data;

      // Store token and user data
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(registeredUser));

      // Set user in state
      setUser(registeredUser);

      // Dispatch custom event
      window.dispatchEvent(new Event("user-auth-change"));

      return registeredUser;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Registration failed. Please try again.";
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // USER ENDPOINTS
  const getProfile = async () => {
    try {
      const response = await api.get("/api/user/profile");
      return response.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to fetch profile.";
      throw new Error(errorMessage);
    }
  };

  const updateProfile = async (userData) => {
    try {
      const response = await api.put("/api/user/profile", userData);
      const updatedUser = response.data;

      // Update local storage
      localStorage.setItem("user", JSON.stringify(updatedUser));

      // Update state
      setUser(updatedUser);

      return updatedUser;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Profile update failed.";
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      const response = await api.put("/api/user/change-password", {
        currentPassword,
        newPassword,
      });
      return response.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Password change failed.";
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // BOOK ENDPOINTS (if user needs to interact with books)
  const getBooks = async () => {
    try {
      const response = await api.get("/api/book");
      return response.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to fetch books.";
      throw new Error(errorMessage);
    }
  };

  const getBookById = async (id) => {
    try {
      const response = await api.get(`/api/book/${id}`);
      return response.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to fetch book.";
      throw new Error(errorMessage);
    }
  };

  // CART ENDPOINTS
  const getCart = async () => {
    try {
      const response = await api.get("/api/cart");
      return response.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to fetch cart.";
      throw new Error(errorMessage);
    }
  };

  const addToCart = async (bookId, quantity = 1) => {
    try {
      const response = await api.post("/api/cart/add", {
        bookId,
        quantity,
      });
      return response.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to add to cart.";
      throw new Error(errorMessage);
    }
  };

  const removeFromCart = async (cartItemId) => {
    try {
      const response = await api.delete(`/api/cart/${cartItemId}`);
      return response.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to remove from cart.";
      throw new Error(errorMessage);
    }
  };

  const updateCartItem = async (cartItemId, quantity) => {
    try {
      const response = await api.put(`/api/cart/${cartItemId}`, {
        quantity,
      });
      return response.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to update cart.";
      throw new Error(errorMessage);
    }
  };

  const clearCart = async () => {
    try {
      const response = await api.delete("/api/cart/clear");
      return response.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to clear cart.";
      throw new Error(errorMessage);
    }
  };

  // ORDER ENDPOINTS
  const createOrder = async (orderData) => {
    try {
      const response = await api.post("/api/order", orderData);
      return response.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to create order.";
      throw new Error(errorMessage);
    }
  };

  const getOrders = async () => {
    try {
      const response = await api.get("/api/order");
      return response.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to fetch orders.";
      throw new Error(errorMessage);
    }
  };

  const getOrderById = async (orderId) => {
    try {
      const response = await api.get(`/api/order/${orderId}`);
      return response.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to fetch order.";
      throw new Error(errorMessage);
    }
  };

  // CATEGORY ENDPOINTS
  const getCategories = async () => {
    try {
      const response = await api.get("/api/category");
      return response.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to fetch categories.";
      throw new Error(errorMessage);
    }
  };

  // ADMIN ENDPOINTS (only accessible to admins)
  const getAdminStats = async () => {
    try {
      const response = await api.get("/api/admin/stats");
      return response.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to fetch admin stats.";
      throw new Error(errorMessage);
    }
  };

  const getAllUsers = async () => {
    try {
      const response = await api.get("/api/admin/users");
      return response.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to fetch users.";
      throw new Error(errorMessage);
    }
  };

  const adminUpdateUser = async (userId, userData) => {
    try {
      const response = await api.put(`/api/admin/users/${userId}`, userData);
      return response.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to update user.";
      throw new Error(errorMessage);
    }
  };

  const adminCreateBook = async (bookData) => {
    try {
      const response = await api.post("/api/admin/books", bookData);
      return response.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to create book.";
      throw new Error(errorMessage);
    }
  };

  const adminUpdateBook = async (bookId, bookData) => {
    try {
      const response = await api.put(`/api/admin/books/${bookId}`, bookData);
      return response.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to update book.";
      throw new Error(errorMessage);
    }
  };

  const adminDeleteBook = async (bookId) => {
    try {
      const response = await api.delete(`/api/admin/books/${bookId}`);
      return response.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to delete book.";
      throw new Error(errorMessage);
    }
  };

  // Helper functions
  const logout = () => {
    // Optional: Call logout endpoint on backend if you have one
    // api.post("/api/auth/logout").catch(console.error);

    // Clear local storage
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    // Clear state
    setUser(null);
    setError(null);

    // Dispatch custom event for same tab
    window.dispatchEvent(new Event("user-auth-change"));
  };

  const isAdmin = () => {
    return user?.role === "admin";
  };

  const updateUser = (updatedUserData) => {
    const updatedUser = { ...user, ...updatedUserData };
    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
    window.dispatchEvent(new Event("user-auth-change"));
  };

  const clearError = () => setError(null);

  const value = {
    // Auth state
    user,
    loading,
    error,

    // Auth methods
    login,
    register,
    logout,
    isAdmin,
    updateUser,
    clearError,

    // User methods
    getProfile,
    updateProfile,
    changePassword,

    // Book methods
    getBooks,
    getBookById,

    // Cart methods
    getCart,
    addToCart,
    removeFromCart,
    updateCartItem,
    clearCart,

    // Order methods
    createOrder,
    getOrders,
    getOrderById,

    // Category methods
    getCategories,

    // Admin methods (only work if user is admin)
    getAdminStats,
    getAllUsers,
    adminUpdateUser,
    adminCreateBook,
    adminUpdateBook,
    adminDeleteBook,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Export axios instance for use in other components
export { api };
