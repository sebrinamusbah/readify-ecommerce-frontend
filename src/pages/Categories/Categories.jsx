import React, { useState, useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { useApi } from "../../hooks/useApi";
import { useAuth } from "../../context/AuthContext";
import "./Categories.css";

const Categories = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const selectedCategory = searchParams.get("category") || "all";
  const searchQuery = searchParams.get("search") || "";

  // Use the single useApi hook for all API calls
  const { get, post, loading, error } = useApi();

  // Use auth context
  const { user, isAuthenticated } = useAuth();

  // State for data
  const [categories, setCategories] = useState([]);
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [cartData, setCartData] = useState({
    items: [],
    totalItems: 0,
    totalPrice: 0,
  });

  // State for filters
  const [priceRange, setPriceRange] = useState([0, 100]);
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState("newest");
  const [selectedCategories, setSelectedCategories] = useState([
    selectedCategory === "all" ? "all" : selectedCategory,
  ]);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [cartBookId, setCartBookId] = useState(null);

  // Fetch all data
  const fetchData = async () => {
    try {
      // Fetch categories
      const categoriesData = await get("/categories");
      if (categoriesData && categoriesData.categories) {
        setCategories(categoriesData.categories);
      }

      // Fetch books
      const booksData = await get("/books");
      if (booksData && booksData.books) {
        setBooks(booksData.books);
        filterBooks(
          booksData.books,
          selectedCategories,
          priceRange,
          minRating,
          sortBy
        );
      }

      // Fetch cart if authenticated
      if (isAuthenticated) {
        await fetchCart();
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  // Fetch cart data
  const fetchCart = async () => {
    if (!isAuthenticated) return;

    try {
      const cartResponse = await get("/cart");
      if (cartResponse) {
        setCartData({
          items: cartResponse.items || [],
          totalItems: cartResponse.totalItems || 0,
          totalPrice: cartResponse.totalPrice || 0,
        });
      }
    } catch (error) {
      console.log("Could not fetch cart:", error.message);
    }
  };

  // Handle search from URL parameter
  useEffect(() => {
    if (searchQuery) {
      handleSearch(searchQuery);
    } else {
      fetchData();
    }
  }, [searchQuery, isAuthenticated]);

  // Filter books function
  const filterBooks = (
    booksArray,
    categories,
    priceRange,
    rating,
    sortType
  ) => {
    let filtered = [...booksArray];

    // Category filter
    if (!categories.includes("all")) {
      filtered = filtered.filter((book) => {
        const bookCategorySlug =
          book.category?.slug ||
          book.category?.name?.toLowerCase().replace(/\s+/g, "-") ||
          "unknown";
        return categories.includes(bookCategorySlug);
      });
    }

    // Price filter
    filtered = filtered.filter(
      (book) => book.price >= priceRange[0] && book.price <= priceRange[1]
    );

    // Rating filter
    filtered = filtered.filter((book) => book.rating >= rating);

    // Sort books
    filtered.sort((a, b) => {
      switch (sortType) {
        case "price-low":
          return a.price - b.price;
        case "price-high":
          return b.price - a.price;
        case "rating":
          return (b.rating || 0) - (a.rating || 0);
        case "popular":
          return (b.popularity || 0) - (a.popularity || 0);
        case "newest":
        default:
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      }
    });

    setFilteredBooks(filtered);
  };

  // Handle search
  const handleSearch = async (query) => {
    try {
      const searchData = await get(`/books/search?q=${query}`);
      if (searchData && searchData.books) {
        setBooks(searchData.books);
        filterBooks(
          searchData.books,
          selectedCategories,
          priceRange,
          minRating,
          sortBy
        );
      }
    } catch (searchError) {
      console.error("Search error:", searchError);
    }
  };

  // Update filters
  useEffect(() => {
    filterBooks(books, selectedCategories, priceRange, minRating, sortBy);
  }, [selectedCategories, priceRange, minRating, sortBy, books]);

  // Handle category selection
  const handleCategoryClick = (categorySlug) => {
    let newCategories;

    if (categorySlug === "all") {
      newCategories = ["all"];
    } else {
      if (selectedCategories.includes("all")) {
        newCategories = [categorySlug];
      } else if (selectedCategories.includes(categorySlug)) {
        newCategories = selectedCategories.filter(
          (cat) => cat !== categorySlug
        );
      } else {
        newCategories = [...selectedCategories, categorySlug];
      }

      // If no categories selected, default to all
      if (newCategories.length === 0) {
        newCategories = ["all"];
      }
    }

    setSelectedCategories(newCategories);
  };

  // Handle add to cart
  const handleAddToCart = async (bookId, bookTitle, event) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    if (!isAuthenticated) {
      setCartBookId(bookId);
      setShowAuthPrompt(true);
      return;
    }

    try {
      const response = await post("/cart/add", {
        bookId,
        quantity: 1,
      });

      if (response.success) {
        alert(`Added "${bookTitle}" to cart!`);
        // Refresh cart data
        await fetchCart();
      } else {
        alert(`Failed: ${response.error || "Unknown error"}`);
      }
    } catch (error) {
      alert(
        `Failed to add to cart: ${error.response?.data?.error || error.message}`
      );
    }
  };

  // Quick checkout function
  const handleQuickCheckout = async (bookId, bookTitle, bookPrice, event) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    if (!isAuthenticated) {
      setCartBookId(bookId);
      setShowAuthPrompt(true);
      return;
    }

    try {
      // First add to cart
      await post("/cart/add", { bookId, quantity: 1 });

      // Refresh cart
      await fetchCart();

      // Navigate to checkout
      navigate("/checkout");
    } catch (error) {
      alert(`Checkout failed: ${error.response?.data?.error || error.message}`);
    }
  };

  // Handle price range change
  const handlePriceChange = (e) => {
    const value = parseInt(e.target.value);
    setPriceRange([0, value]);
  };

  // Clear all filters
  const clearFilters = () => {
    setSelectedCategories(["all"]);
    setPriceRange([0, 100]);
    setMinRating(0);
    setSortBy("newest");
    if (searchQuery) {
      navigate("/categories");
    }
  };

  // Get category book counts
  const getCategoryCounts = () => {
    const allCategory = {
      id: "all",
      name: "All Categories",
      slug: "all",
      count: books.length,
      color: "#3498db",
    };

    const categoryList = categories.map((category, index) => {
      const bookCount = books.filter(
        (book) =>
          book.categoryId === category.id || book.category?.id === category.id
      ).length;

      const colors = ["#2ecc71", "#9b59b6", "#e74c3c", "#f39c12", "#1abc9c"];

      return {
        id: category.id,
        name: category.name,
        slug: category.slug || category.name.toLowerCase().replace(/\s+/g, "-"),
        count: bookCount,
        description: category.description,
        color: colors[index % colors.length],
      };
    });

    return [allCategory, ...categoryList];
  };

  // Helper to get image URL
  const getBookImageUrl = (imagePath) => {
    if (!imagePath) {
      return "https://via.placeholder.com/150x200/cccccc/333333?text=No+Image";
    }

    if (imagePath.startsWith("http")) {
      return imagePath;
    }

    if (imagePath.startsWith("/uploads")) {
      return `${
        process.env.REACT_APP_API_URL || "http://localhost:5000"
      }${imagePath}`;
    }

    return imagePath;
  };

  // Loading state
  if (loading && books.length === 0) {
    return (
      <div className="categories-loading">
        <div className="loading-spinner"></div>
        <p>Loading categories and books...</p>
      </div>
    );
  }

  if (error && books.length === 0) {
    return (
      <div className="categories-error">
        <h2>Error Loading Data</h2>
        <p>{error.message || error}</p>
        <button onClick={fetchData} className="btn btn-primary">
          Retry
        </button>
      </div>
    );
  }

  const categoryList = getCategoryCounts();

  return (
    <div className="categories-page">
      {/* AUTH PROMPT MODAL */}
      {showAuthPrompt && (
        <div className="auth-prompt-modal">
          <div className="auth-prompt-content">
            <h3>Login Required</h3>
            <p>Please login or register to add items to your cart.</p>
            <div className="auth-prompt-buttons">
              <Link
                to="/login"
                state={{
                  redirectTo: `/categories?category=${selectedCategory}`,
                }}
                className="btn btn-primary"
              >
                Login
              </Link>
              <Link
                to="/register"
                state={{
                  redirectTo: `/categories?category=${selectedCategory}`,
                }}
                className="btn btn-secondary"
              >
                Register
              </Link>
              {cartBookId && (
                <button
                  onClick={() => {
                    const book = books.find((b) => b.id === cartBookId);
                    if (book) {
                      // Store book info for later
                      localStorage.setItem(
                        "pendingCartItem",
                        JSON.stringify({
                          bookId: cartBookId,
                          bookTitle: book.title,
                        })
                      );
                    }
                    setShowAuthPrompt(false);
                    setCartBookId(null);
                  }}
                  className="btn btn-outline"
                >
                  Continue Browsing
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Breadcrumb */}
      <div className="breadcrumb">
        <div className="container">
          <Link to="/">Home</Link> &gt; <span>Categories</span>
          {selectedCategory !== "all" && (
            <>
              &gt; <span>{selectedCategory.replace(/-/g, " ")}</span>
            </>
          )}
          {searchQuery && (
            <>
              &gt; <span>Search: "{searchQuery}"</span>
            </>
          )}
        </div>
      </div>

      <div className="container categories-container">
        {/* Page Header */}
        <div className="page-header">
          <h1 className="page-title">
            {searchQuery
              ? `Search Results for "${searchQuery}"`
              : selectedCategory !== "all"
              ? `${selectedCategory.replace(/-/g, " ")} Books`
              : "Browse All Categories"}
          </h1>
          <p className="page-subtitle">
            {filteredBooks.length === books.length
              ? `Found ${books.length} books in our collection`
              : `Showing ${filteredBooks.length} of ${books.length} books`}
            {isAuthenticated && cartData.totalItems > 0 && (
              <span className="cart-info">
                • You have {cartData.totalItems} items ($
                {cartData.totalPrice.toFixed(2)}) in cart
              </span>
            )}
          </p>

          {/* Service Stats */}
          <div className="service-stats">
            <div className="stat-badge">
              <span className="stat-number">{books.length}</span>
              <span className="stat-label">Books</span>
            </div>
            <div className="stat-badge">
              <span className="stat-number">{categories.length}</span>
              <span className="stat-label">Categories</span>
            </div>
            {isAuthenticated && (
              <>
                <div className="stat-badge">
                  <span className="stat-number">{cartData.totalItems}</span>
                  <span className="stat-label">In Cart</span>
                </div>
                <div className="stat-badge">
                  <span className="stat-number">
                    ${cartData.totalPrice.toFixed(2)}
                  </span>
                  <span className="stat-label">Cart Total</span>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="categories-layout">
          {/* Sidebar - Filters */}
          <aside className="filters-sidebar">
            <div className="sidebar-header">
              <h3>Filters</h3>
              <button onClick={clearFilters} className="clear-all-btn">
                Clear All
              </button>
            </div>

            {/* Categories Filter */}
            <div className="filter-section">
              <h4 className="filter-title">Categories</h4>
              <div className="categories-list">
                {categoryList.map((category) => (
                  <button
                    key={category.id}
                    className={`category-btn ${
                      selectedCategories.includes(category.slug) ? "active" : ""
                    }`}
                    onClick={() => handleCategoryClick(category.slug)}
                    style={
                      selectedCategories.includes(category.slug)
                        ? { borderLeftColor: category.color }
                        : {}
                    }
                  >
                    <div className="category-btn-content">
                      <span className="category-name">{category.name}</span>
                      <span className="category-count">{category.count}</span>
                    </div>
                    {selectedCategories.includes(category.slug) && (
                      <div className="category-check">✓</div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Filter */}
            <div className="filter-section">
              <h4 className="filter-title">Price Range</h4>
              <div className="price-filter">
                <div className="price-display">
                  <span className="price-min">$0</span>
                  <span className="price-max">${priceRange[1]}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={priceRange[1]}
                  onChange={handlePriceChange}
                  className="price-slider"
                />
                <div className="price-markers">
                  <span>$0</span>
                  <span>$50</span>
                  <span>$100+</span>
                </div>
              </div>
            </div>

            {/* Rating Filter */}
            <div className="filter-section">
              <h4 className="filter-title">Minimum Rating</h4>
              <div className="rating-filter">
                {[4, 3, 2, 1, 0].map((rating) => (
                  <button
                    key={rating}
                    className={`rating-btn ${
                      minRating === rating ? "active" : ""
                    }`}
                    onClick={() => setMinRating(rating)}
                  >
                    <div className="rating-stars">
                      {"★".repeat(rating)}
                      {rating > 0 && <span>+</span>}
                    </div>
                    <span>{rating === 0 ? "All Ratings" : ""}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            {isAuthenticated && (
              <div className="filter-section">
                <h4 className="filter-title">Quick Actions</h4>
                <div className="quick-actions">
                  <Link to="/cart" className="quick-action-btn">
                    <span className="action-icon">🛒</span>
                    View Cart ({cartData.totalItems})
                  </Link>
                  {cartData.totalItems > 0 && (
                    <Link to="/checkout" className="quick-action-btn checkout">
                      <span className="action-icon">💳</span>
                      Checkout
                    </Link>
                  )}
                </div>
              </div>
            )}
          </aside>

          {/* Main Content - Books Grid */}
          <main className="books-main">
            {/* Sorting and Results Bar */}
            <div className="results-bar">
              <div className="sorting-options">
                <label htmlFor="sort-select">Sort by:</label>
                <select
                  id="sort-select"
                  className="sort-select"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="newest">Newest Arrivals</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                  <option value="popular">Most Popular</option>
                </select>
              </div>

              <div className="results-info">
                <span className="results-count">
                  {filteredBooks.length} books found
                </span>
                {selectedCategories.length > 0 &&
                  selectedCategories[0] !== "all" && (
                    <div className="active-filters">
                      <span>Active filters:</span>
                      {selectedCategories.map((cat) => (
                        <span key={cat} className="filter-tag">
                          {cat.replace(/-/g, " ")}
                          <button
                            onClick={() => handleCategoryClick(cat)}
                            className="remove-filter"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                      {minRating > 0 && (
                        <span className="filter-tag">
                          {minRating}+ Stars
                          <button
                            onClick={() => setMinRating(0)}
                            className="remove-filter"
                          >
                            ×
                          </button>
                        </span>
                      )}
                      {priceRange[1] < 100 && (
                        <span className="filter-tag">
                          Under ${priceRange[1]}
                          <button
                            onClick={() => setPriceRange([0, 100])}
                            className="remove-filter"
                          >
                            ×
                          </button>
                        </span>
                      )}
                    </div>
                  )}
              </div>
            </div>

            {/* Books Grid */}
            {filteredBooks.length === 0 ? (
              <div className="no-results">
                <div className="no-results-icon">📚</div>
                <h3>No books found</h3>
                <p>Try adjusting your filters or browse all categories</p>
                <div className="no-results-actions">
                  <button className="btn btn-primary" onClick={clearFilters}>
                    Clear All Filters
                  </button>
                  <Link to="/categories" className="btn btn-secondary">
                    View All Books
                  </Link>
                </div>
              </div>
            ) : (
              <>
                <div className="books-grid">
                  {filteredBooks.map((book) => {
                    const categoryName = book.category?.name || "Uncategorized";
                    const categorySlug =
                      book.category?.slug ||
                      book.category?.name?.toLowerCase().replace(/\s+/g, "-") ||
                      "uncategorized";

                    return (
                      <div className="book-card" key={book.id}>
                        <Link
                          to={`/book/${book.id}`}
                          className="book-card-link"
                        >
                          <div className="book-image">
                            <img
                              src={getBookImageUrl(
                                book.coverImage || book.imageUrl
                              )}
                              alt={book.title}
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = `https://via.placeholder.com/150x200/4A90E2/FFFFFF?text=${encodeURIComponent(
                                  book.title?.substring(0, 10) || "Book"
                                )}`;
                              }}
                            />
                            <div className="book-overlay">
                              <div className="book-category">
                                <Link
                                  to={`/categories?category=${categorySlug}`}
                                  onClick={(e) => e.stopPropagation()}
                                  className="category-tag"
                                >
                                  {categoryName}
                                </Link>
                              </div>
                              {book.isFeatured && (
                                <div className="book-badge">Featured</div>
                              )}
                              {book.stock < 5 && book.stock > 0 && (
                                <div className="book-badge low-stock">
                                  Only {book.stock} left
                                </div>
                              )}
                              {book.stock === 0 && (
                                <div className="book-badge out-of-stock">
                                  Out of Stock
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="book-info">
                            <h3 className="book-title">{book.title}</h3>
                            <p className="book-author">
                              by {book.author || "Unknown Author"}
                            </p>
                            <div className="book-meta">
                              <div className="book-rating">
                                {"★".repeat(Math.floor(book.rating || 0))}
                                {"☆".repeat(5 - Math.floor(book.rating || 0))}
                                <span className="rating-number">
                                  {(book.rating || 0).toFixed(1)}
                                </span>
                              </div>
                              <div className="book-price">
                                ${(book.price || 0).toFixed(2)}
                              </div>
                            </div>

                            <div className="book-actions">
                              <button
                                className="btn-cart"
                                onClick={(e) =>
                                  handleAddToCart(book.id, book.title, e)
                                }
                                disabled={book.stock === 0}
                              >
                                {book.stock === 0
                                  ? "Out of Stock"
                                  : "Add to Cart"}
                              </button>
                              <button
                                className="btn-buy"
                                onClick={(e) =>
                                  handleQuickCheckout(
                                    book.id,
                                    book.title,
                                    book.price,
                                    e
                                  )
                                }
                                disabled={book.stock === 0 || !isAuthenticated}
                              >
                                Buy Now
                              </button>
                            </div>
                          </div>
                        </Link>
                      </div>
                    );
                  })}
                </div>

                {/* Cart Summary */}
                {isAuthenticated && cartData.totalItems > 0 && (
                  <div className="cart-summary-sticky">
                    <div className="cart-summary-content">
                      <div className="cart-summary-info">
                        <span className="cart-count">
                          {cartData.totalItems} items
                        </span>
                        <span className="cart-total">
                          Total: ${cartData.totalPrice.toFixed(2)}
                        </span>
                      </div>
                      <div className="cart-summary-actions">
                        <Link to="/cart" className="btn btn-outline">
                          View Cart
                        </Link>
                        <Link to="/checkout" className="btn btn-primary">
                          Checkout Now
                        </Link>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Database Connection Info */}
            {books.length > 0 && (
              <div className="database-connection">
                <div className="db-info">
                  <span className="db-icon">📊</span>
                  <div className="db-details">
                    <p>Connected to database:</p>
                    <div className="db-stats">
                      <span>{books.length} books</span>
                      <span>•</span>
                      <span>{categories.length} categories</span>
                      {isAuthenticated && (
                        <>
                          <span>•</span>
                          <span>{cartData.totalItems} in your cart</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Categories;
