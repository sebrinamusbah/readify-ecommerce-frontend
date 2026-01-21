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
      categories: [
        {
          id: 1,
          name: "Fiction",
          description: "Imaginative stories and novels",
          createdAt: new Date().toISOString(),
          createdBy: 1,
        },
        {
          id: 2,
          name: "Science",
          description: "Scientific books and discoveries",
          createdAt: new Date().toISOString(),
          createdBy: 1,
        },
        {
          id: 3,
          name: "Technology",
          description: "Computers, programming, and tech",
          createdAt: new Date().toISOString(),
          createdBy: 1,
        },
        {
          id: 4,
          name: "Biography",
          description: "Life stories of real people",
          createdAt: new Date().toISOString(),
          createdBy: 1,
        },
        {
          id: 5,
          name: "Business",
          description: "Entrepreneurship and management",
          createdAt: new Date().toISOString(),
          createdBy: 1,
        },
      ],
      books: [
        {
          id: 1,
          title: "The Great Gatsby",
          author: "F. Scott Fitzgerald",
          description:
            "A classic novel of the Jazz Age, exploring themes of idealism and excess.",
          price: 12.99,
          categoryId: 1,
          stock: 25,
          imageUrl:
            "https://via.placeholder.com/400x500/3498db/ffffff?text=The+Great+Gatsby",
          createdAt: new Date().toISOString(),
          createdBy: 1,
        },
        {
          id: 2,
          title: "A Brief History of Time",
          author: "Stephen Hawking",
          description:
            "Explores fundamental questions about the universe and our existence.",
          price: 18.99,
          categoryId: 2,
          stock: 15,
          imageUrl:
            "https://via.placeholder.com/400x500/2ecc71/ffffff?text=History+of+Time",
          createdAt: new Date().toISOString(),
          createdBy: 1,
        },
        {
          id: 3,
          title: "Clean Code",
          author: "Robert C. Martin",
          description:
            "A handbook of agile software craftsmanship with practical advice.",
          price: 34.99,
          categoryId: 3,
          stock: 30,
          imageUrl:
            "https://via.placeholder.com/400x500/9b59b6/ffffff?text=Clean+Code",
          createdAt: new Date().toISOString(),
          createdBy: 1,
        },
        {
          id: 4,
          title: "Steve Jobs",
          author: "Walter Isaacson",
          description:
            "The exclusive biography of Apple co-founder Steve Jobs.",
          price: 16.99,
          categoryId: 4,
          stock: 20,
          imageUrl:
            "https://via.placeholder.com/400x500/e74c3c/ffffff?text=Steve+Jobs",
          createdAt: new Date().toISOString(),
          createdBy: 1,
        },
        {
          id: 5,
          title: "The Lean Startup",
          author: "Eric Ries",
          description:
            "How today's entrepreneurs use continuous innovation to create successful businesses.",
          price: 19.99,
          categoryId: 5,
          stock: 35,
          imageUrl:
            "https://via.placeholder.com/400x500/f39c12/ffffff?text=Lean+Startup",
          createdAt: new Date().toISOString(),
          createdBy: 1,
        },
        {
          id: 6,
          title: "1984",
          author: "George Orwell",
          description:
            "A dystopian social science fiction novel about totalitarian regime.",
          price: 10.99,
          categoryId: 1,
          stock: 40,
          imageUrl:
            "https://via.placeholder.com/400x500/1abc9c/ffffff?text=1984",
          createdAt: new Date().toISOString(),
          createdBy: 1,
        },
        {
          id: 7,
          title: "Cosmos",
          author: "Carl Sagan",
          description:
            "One of the best-selling science books of all time about cosmic evolution.",
          price: 15.99,
          categoryId: 2,
          stock: 18,
          imageUrl:
            "https://via.placeholder.com/400x500/3498db/ffffff?text=Cosmos",
          createdAt: new Date().toISOString(),
          createdBy: 1,
        },
        {
          id: 8,
          title: "The Pragmatic Programmer",
          author: "David Thomas & Andrew Hunt",
          description: "Your journey to mastery in software development.",
          price: 29.99,
          categoryId: 3,
          stock: 22,
          imageUrl:
            "https://via.placeholder.com/400x500/2ecc71/ffffff?text=Pragmatic+Programmer",
          createdAt: new Date().toISOString(),
          createdBy: 1,
        },
        {
          id: 9,
          title: "Elon Musk",
          author: "Ashlee Vance",
          description:
            "The thrilling story of Silicon Valley's most daring entrepreneur.",
          price: 14.99,
          categoryId: 4,
          stock: 28,
          imageUrl:
            "https://via.placeholder.com/400x500/9b59b6/ffffff?text=Elon+Musk",
          createdAt: new Date().toISOString(),
          createdBy: 1,
        },
        {
          id: 10,
          title: "Zero to One",
          author: "Peter Thiel",
          description: "Notes on startups, or how to build the future.",
          price: 17.99,
          categoryId: 5,
          stock: 32,
          imageUrl:
            "https://via.placeholder.com/400x500/e74c3c/ffffff?text=Zero+to+One",
          createdAt: new Date().toISOString(),
          createdBy: 1,
        },
      ],
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

    // Listen for storage events
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

  // REGISTER FUNCTION
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
    window.dispatchEvent(new Event("user-auth-change"));
  };

  const isAdmin = () => {
    return user?.role === "admin";
  };

  // ADMIN FUNCTIONS
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

  // FIXED: ADD TO CART FUNCTION - SIMPLIFIED VERSION
  const addToCart = (bookId, quantity = 1) => {
    if (!user) {
      throw new Error("User must be logged in to add to cart");
    }

    // Convert to number
    const numericBookId = parseInt(bookId);

    // Find book
    const book = mockDB.books.find((b) => b.id === numericBookId);

    if (!book) {
      // Try string comparison if numeric fails
      const bookStr = mockDB.books.find(
        (b) => b.id.toString() === bookId.toString(),
      );
      if (!bookStr) {
        throw new Error(`Book not found. ID: ${bookId}`);
      }
    }

    const targetBook =
      book || mockDB.books.find((b) => b.id.toString() === bookId.toString());

    if (!targetBook) {
      throw new Error(`Book with ID ${bookId} not found in database.`);
    }

    // Check stock
    if (targetBook.stock < quantity) {
      throw new Error(`Only ${targetBook.stock} items in stock`);
    }

    // Find existing cart item
    const existingItemIndex = mockDB.cartItems.findIndex(
      (item) => item.userId === user.id && item.bookId === targetBook.id,
    );

    let updatedCartItems;

    if (existingItemIndex !== -1) {
      // Update existing item
      updatedCartItems = [...mockDB.cartItems];
      updatedCartItems[existingItemIndex] = {
        ...updatedCartItems[existingItemIndex],
        quantity: updatedCartItems[existingItemIndex].quantity + quantity,
        updatedAt: new Date().toISOString(),
      };
    } else {
      // Add new item
      const newCartItem = {
        id: Date.now(),
        userId: user.id,
        bookId: targetBook.id,
        quantity,
        addedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      updatedCartItems = [...mockDB.cartItems, newCartItem];
    }

    // Update database
    const updatedDB = {
      ...mockDB,
      cartItems: updatedCartItems,
    };

    setMockDB(updatedDB);
    localStorage.setItem("bookstoreDB", JSON.stringify(updatedDB));

    return updatedCartItems.find(
      (item) => item.userId === user.id && item.bookId === targetBook.id,
    );
  };

  // CHECKOUT FUNCTION
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

  // HELPER FUNCTIONS FOR PAGES
  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAdmin,
    updateUser,

    // Mock database
    mockDB,

    // Admin functions
    addCategory,
    addBook,

    // User functions
    addToCart,
    checkout,

    // Helper getters - THESE ARE CORRECT FOR YOUR PAGES
    getUserCart: () => {
      if (!user) return [];
      return mockDB.cartItems
        .filter((item) => item.userId === user.id)
        .map((cartItem) => {
          const book = mockDB.books.find((b) => b.id === cartItem.bookId);
          const category = mockDB.categories.find(
            (c) => c.id === book?.categoryId,
          );

          if (!book) return null;

          return {
            ...cartItem,
            bookDetails: {
              id: book.id,
              title: book.title,
              author: book.author,
              price: book.price,
              image:
                book.imageUrl ||
                `https://via.placeholder.com/150x200/3498db/ffffff?text=${book.title.substring(0, 5)}`,
              category: category?.name || "Uncategorized",
              stock: book.stock,
              description: book.description,
            },
          };
        })
        .filter((item) => item !== null);
    },

    getUserOrders: () =>
      mockDB.orders.filter((order) => order.userId === user?.id),

    getCategories: () => mockDB.categories,

    getBooks: () => mockDB.books,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
