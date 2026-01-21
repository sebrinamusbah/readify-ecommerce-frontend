import React, { createContext, useState, useContext, useEffect } from "react";

// Initialize mock database in localStorage if not exists
const initializeMockDatabase = () => {
  const storedDB = localStorage.getItem("bookstoreDB");
  if (!storedDB) {
    const initialDB = {
      users: [
        {
          id: 1,
          email: "admin@bookstore.com",
          password: "admin123",
          name: "Admin User",
          role: "admin",
          avatar: "👑",
          createdAt: new Date().toISOString(),
        },
        {
          id: 2,
          email: "test@example.com",
          password: "password123",
          name: "Test User",
          role: "user",
          avatar: "👤",
          createdAt: new Date().toISOString(),
        },
      ],
      categories: [],
      books: [],
      cartItems: [],
      orders: [],
      orderItems: [],
    };
    localStorage.setItem("bookstoreDB", JSON.stringify(initialDB));
    return initialDB;
  }
  return JSON.parse(storedDB);
};

const AuthContext = createContext(null);

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
  const [mockDB, setMockDB] = useState(() => initializeMockDatabase());

  // Update localStorage whenever mockDB changes
  useEffect(() => {
    localStorage.setItem("bookstoreDB", JSON.stringify(mockDB));
  }, [mockDB]);

  // Function to check and set user from localStorage
  const checkUser = () => {
    const storedUser = localStorage.getItem("currentUser");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      setUser(null);
    }
  };

  useEffect(() => {
    // Check if user is logged in from localStorage on initial load
    checkUser();

    // Listen for storage events (login/logout from other tabs/windows)
    const handleStorageChange = (e) => {
      if (e.key === "currentUser") {
        checkUser();
      }
      if (e.key === "bookstoreDB") {
        setMockDB(
          JSON.parse(
            e.newValue ||
              '{"users":[],"categories":[],"books":[],"cartItems":[],"orders":[],"orderItems":[]}',
          ),
        );
      }
    };

    // Custom event for login/logout within same tab
    const handleAuthChange = () => {
      checkUser();
    };

    // Add event listeners
    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("user-auth-change", handleAuthChange);

    setLoading(false);

    // Cleanup event listeners
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("user-auth-change", handleAuthChange);
    };
  }, []);

  // REGISTER FUNCTION: User registers → Users table
  const register = async (userData) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          // Check if user already exists
          const existingUser = mockDB.users.find(
            (u) => u.email === userData.email,
          );
          if (existingUser) {
            reject(new Error("User with this email already exists"));
            return;
          }

          // Create new user
          const newUser = {
            id: Date.now(),
            ...userData,
            role: "user",
            avatar: "👤",
            createdAt: new Date().toISOString(),
          };

          // Update mock database
          const updatedDB = {
            ...mockDB,
            users: [...mockDB.users, newUser],
          };
          setMockDB(updatedDB);

          // Auto-login after registration
          const userToStore = {
            id: newUser.id,
            email: newUser.email,
            name: newUser.name,
            role: newUser.role,
            avatar: newUser.avatar,
          };

          setUser(userToStore);
          localStorage.setItem("currentUser", JSON.stringify(userToStore));
          window.dispatchEvent(new Event("user-auth-change"));

          resolve(userToStore);
        } catch (error) {
          reject(error);
        }
      }, 1000);
    });
  };

  // LOGIN FUNCTION
  const login = async (email, password) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          // Find user in mock database
          const foundUser = mockDB.users.find(
            (u) => u.email === email && u.password === password,
          );

          if (foundUser) {
            const userToStore = {
              id: foundUser.id,
              email: foundUser.email,
              name: foundUser.name,
              role: foundUser.role,
              avatar: foundUser.avatar,
            };

            setUser(userToStore);
            localStorage.setItem("currentUser", JSON.stringify(userToStore));
            window.dispatchEvent(new Event("user-auth-change"));
            resolve(userToStore);
          } else {
            reject(new Error("Invalid email or password"));
          }
        } catch (error) {
          reject(error);
        }
      }, 1000);
    });
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("currentUser");
    // Dispatch custom event for same tab
    window.dispatchEvent(new Event("user-auth-change"));
  };

  const isAdmin = () => {
    return user?.role === "admin";
  };

  // ADMIN FUNCTIONS: Admin adds categories → Categories table
  const addCategory = (categoryData) => {
    const newCategory = {
      id: Date.now(),
      ...categoryData,
      createdAt: new Date().toISOString(),
      createdBy: user?.id,
    };

    const updatedDB = {
      ...mockDB,
      categories: [...mockDB.categories, newCategory],
    };
    setMockDB(updatedDB);

    return newCategory;
  };

  // Admin adds books → Books table (with categoryId)
  const addBook = (bookData) => {
    // Check if category exists
    const categoryExists = mockDB.categories.find(
      (c) => c.id === bookData.categoryId,
    );
    if (!categoryExists) {
      throw new Error("Category does not exist. Please add category first.");
    }

    const newBook = {
      id: Date.now(),
      ...bookData,
      createdAt: new Date().toISOString(),
      createdBy: user?.id,
    };

    const updatedDB = {
      ...mockDB,
      books: [...mockDB.books, newBook],
    };
    setMockDB(updatedDB);

    return newBook;
  };

  // USER FUNCTIONS: User adds to cart → CartItems table
  const addToCart = (bookId, quantity = 1) => {
    const existingItem = mockDB.cartItems.find(
      (item) => item.userId === user?.id && item.bookId === bookId,
    );

    let updatedCartItems;
    if (existingItem) {
      updatedCartItems = mockDB.cartItems.map((item) =>
        item.id === existingItem.id
          ? { ...item, quantity: item.quantity + quantity }
          : item,
      );
    } else {
      const newCartItem = {
        id: Date.now(),
        userId: user?.id,
        bookId,
        quantity,
        addedAt: new Date().toISOString(),
      };
      updatedCartItems = [...mockDB.cartItems, newCartItem];
    }

    const updatedDB = {
      ...mockDB,
      cartItems: updatedCartItems,
    };
    setMockDB(updatedDB);

    return mockDB.cartItems.find(
      (item) => item.userId === user?.id && item.bookId === bookId,
    );
  };

  // User checks out → Orders table + OrderItems table
  const checkout = () => {
    if (!user) throw new Error("User must be logged in to checkout");

    const userCartItems = mockDB.cartItems.filter(
      (item) => item.userId === user.id,
    );
    if (userCartItems.length === 0) throw new Error("Cart is empty");

    // Create order
    const newOrder = {
      id: Date.now(),
      userId: user.id,
      status: "completed",
      totalAmount: userCartItems.reduce((total, item) => {
        const book = mockDB.books.find((b) => b.id === item.bookId);
        return total + (book?.price || 0) * item.quantity;
      }, 0),
      createdAt: new Date().toISOString(),
    };

    // Create order items
    const newOrderItems = userCartItems.map((item) => ({
      id: Date.now() + Math.random(),
      orderId: newOrder.id,
      bookId: item.bookId,
      quantity: item.quantity,
      price: mockDB.books.find((b) => b.id === item.bookId)?.price || 0,
    }));

    // Update database
    const updatedDB = {
      ...mockDB,
      orders: [...mockDB.orders, newOrder],
      orderItems: [...mockDB.orderItems, ...newOrderItems],
      cartItems: mockDB.cartItems.filter((item) => item.userId !== user.id),
    };
    setMockDB(updatedDB);

    return newOrder;
  };

  const updateUser = (updatedUserData) => {
    const updatedUser = { ...user, ...updatedUserData };
    setUser(updatedUser);
    localStorage.setItem("currentUser", JSON.stringify(updatedUser));
    window.dispatchEvent(new Event("user-auth-change"));
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAdmin,
    updateUser,
    // Mock database functions
    mockDB,
    addCategory,
    addBook,
    addToCart,
    checkout,
    // Helper getters
    getUserCart: () =>
      mockDB.cartItems.filter((item) => item.userId === user?.id),
    getUserOrders: () =>
      mockDB.orders.filter((order) => order.userId === user?.id),
    getCategories: () => mockDB.categories,
    getBooks: () => mockDB.books,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
