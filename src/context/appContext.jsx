// src/context/AppContext.js
import React, { createContext, useState, useContext, useEffect } from "react";
import * as api from "../services/api";

const AppContext = createContext();

export const useAppContext = () => useContext(AppContext);

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [cart, setCart] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [totalBooks, setTotalBooks] = useState(0);

  // Initialize from localStorage
  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (token && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        fetchCart();
        fetchCategories();
      } catch (err) {
        console.error("Failed to parse user data:", err);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      }
    }
  }, []);

  // 1. REGISTRATION
  const register = async (userData) => {
    setLoading(true);
    try {
      const data = await api.registerUser(userData);
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setUser(data.user);
      setError("");
      return { success: true, user: data.user };
    } catch (err) {
      const errorMsg = err.error || err.message || "Registration failed";
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  // 2. LOGIN
  const login = async (credentials) => {
    setLoading(true);
    try {
      const data = await api.loginUser(credentials);
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setUser(data.user);
      await fetchCart();
      setError("");
      return { success: true, user: data.user };
    } catch (err) {
      const errorMsg = err.error || err.message || "Login failed";
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  // 3. FETCH BOOKS
  const fetchBooks = async (params = {}) => {
    setLoading(true);
    try {
      const data = await api.getAllBooks(params);
      setBooks(data.data || data.books || data);
      return data; // ← THIS MUST RETURN DATA
    } catch (err) {
      const errorMsg = err.error || err.message || "Failed to fetch books";
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 4. FETCH SINGLE BOOK
  const fetchBookById = async (id) => {
    setLoading(true);
    try {
      const data = await api.getBookById(id);
      return data;
    } catch (err) {
      const errorMsg = err.error || err.message || "Failed to fetch book";
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 5. FETCH CATEGORIES
  const fetchCategories = async () => {
    setLoading(true);
    try {
      const data = await api.getAllCategories();
      setCategories(data.data || data.categories || data);
      return data; // ← THIS MUST RETURN DATA
    } catch (err) {
      console.error("Failed to fetch categories:", err);
      return [];
    }
  };

  // 6. FETCH CART
  const fetchCart = async () => {
    if (!user) return;

    try {
      const data = await api.getCart();
      setCart(data.items || data.cart || []);
      setCartCount(
        data.totalItems || data.count || (data.items ? data.items.length : 0)
      );
      return data;
    } catch (err) {
      console.error("Failed to fetch cart:", err);
      return { items: [] };
    }
  };

  // 7. ADD TO CART
  const addToCart = async (bookId, quantity = 1) => {
    if (!user) {
      return { success: false, error: "Please login first" };
    }

    try {
      const data = await api.addToCart(bookId, quantity);
      await fetchCart();
      return { success: true, data };
    } catch (err) {
      const errorMsg = err.error || err.message || "Failed to add to cart";
      return { success: false, error: errorMsg };
    }
  };

  // 8. UPDATE CART ITEM
  const updateCartItem = async (cartItemId, quantity) => {
    try {
      await api.updateCartItem(cartItemId, quantity);
      await fetchCart();
      return { success: true };
    } catch (err) {
      const errorMsg = err.error || err.message || "Failed to update cart";
      return { success: false, error: errorMsg };
    }
  };

  // 9. REMOVE FROM CART
  const removeFromCart = async (cartItemId) => {
    try {
      await api.removeFromCart(cartItemId);
      await fetchCart();
      return { success: true };
    } catch (err) {
      const errorMsg = err.error || err.message || "Failed to remove item";
      return { success: false, error: errorMsg };
    }
  };

  // 10. CLEAR CART
  const clearCart = async () => {
    try {
      await api.clearCart();
      setCart([]);
      setCartCount(0);
      return { success: true };
    } catch (err) {
      const errorMsg = err.error || err.message || "Failed to clear cart";
      return { success: false, error: errorMsg };
    }
  };

  // 11. LOGOUT
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setCart([]);
    setCartCount(0);
    setError("");
  };

  // 12. GET USER PROFILE
  const getUserProfile = async () => {
    try {
      const data = await api.getProfile();
      setUser(data.user || data);
      localStorage.setItem("user", JSON.stringify(data.user || data));
      return data;
    } catch (err) {
      console.error("Failed to get profile:", err);
      return null;
    }
  };

  const value = {
    user,
    cart,
    cartCount,
    books,
    categories,
    loading,
    error,
    totalBooks,
    register,
    login,
    logout,
    fetchBooks,
    fetchBookById,
    fetchCategories,
    fetchCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    getUserProfile,
    setError: (msg) => setError(msg),
  };

  return <AppContext.Provider value={value}> {children} </AppContext.Provider>;
};
