import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useApi } from "../../hooks/useApi";
import { useAuth } from "../../context/AuthContext";
import "./Home.css";

const Home = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [userStats, setUserStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [cartData, setCartData] = useState({
    items: [],
    totalItems: 0,
    totalPrice: 0,
  });
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);

  const navigate = useNavigate();

  // Use the single useApi hook for all API calls
  const { get, post, put, del, loading, error } = useApi();

  // Use auth context
  const { user, isAuthenticated } = useAuth();

  // State for data
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [featuredBooks, setFeaturedBooks] = useState([]);

  const getCategoryColor = (index) => {
    const colors = [
      "#3498db", // Blue for Fiction
      "#2ecc71", // Green for Technology
      "#9b59b6", // Purple for Science
      "#e74c3c", // Red for Business
      "#f39c12", // Orange for Biography
      "#1abc9c", // Teal for Self-Help
    ];
    return colors[index % colors.length];
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

  // Fetch all data
  const fetchData = async () => {
    try {
      // Fetch books
      const booksData = await get("/books");
      if (booksData && booksData.books) {
        setBooks(booksData.books);
        // Get featured books
        const featured = booksData.books
          .filter((book) => book.isFeatured)
          .slice(0, 4);
        setFeaturedBooks(
          featured.length > 0 ? featured : booksData.books.slice(0, 4)
        );
      }

      // Fetch categories
      const categoriesData = await get("/categories");
      if (categoriesData && categoriesData.categories) {
        setCategories(categoriesData.categories);
      }

      // Fetch cart if authenticated
      if (isAuthenticated) {
        await fetchCart();
      }

      // Fetch user orders if authenticated
      if (isAuthenticated && user) {
        try {
          const ordersData = await get("/orders");
          if (ordersData && ordersData.orders) {
            setRecentOrders(ordersData.orders.slice(0, 3));
          }

          // Calculate user stats
          const userStatsData = {
            totalOrders: ordersData?.orders?.length || 0,
            totalSpent:
              ordersData?.orders?.reduce(
                (sum, order) => sum + (order.totalAmount || 0),
                0
              ) || 0,
            favoriteCategory: getFavoriteCategory(booksData?.books || []),
          };
          setUserStats(userStatsData);
        } catch (orderError) {
          console.log("Could not fetch orders:", orderError.message);
        }
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const getFavoriteCategory = (userBooks) => {
    if (!userBooks || userBooks.length === 0) return "None";

    const categoryCount = {};
    userBooks.forEach((book) => {
      const category = book.category?.name || "Unknown";
      categoryCount[category] = (categoryCount[category] || 0) + 1;
    });

    const favorite = Object.entries(categoryCount).sort(
      (a, b) => b[1] - a[1]
    )[0];

    return favorite ? favorite[0] : "None";
  };

  // Handle search
  const handleSearch = async (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      try {
        const searchData = await get(`/books/search?q=${searchQuery}`);
        if (searchData && searchData.books) {
          setBooks(searchData.books);
        }
      } catch (searchError) {
        console.error("Search error:", searchError);
      }
    } else {
      fetchData(); // Reset to all books
    }
  };

  // Handle add to cart
  const handleAddToCart = async (bookId, bookTitle) => {
    if (!isAuthenticated) {
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
  const handleQuickCheckout = async (bookId, bookTitle, bookPrice) => {
    if (!isAuthenticated) {
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

  // Get user's reading stats
  const getUserReadingStats = () => {
    if (!isAuthenticated || !recentOrders.length) {
      return {
        booksBought: 0,
        totalSpent: 0,
        lastOrder: null,
      };
    }

    const totalBooks = recentOrders.reduce(
      (sum, order) => sum + (order.items?.length || 0),
      0
    );

    const totalSpent = recentOrders.reduce(
      (sum, order) => sum + (order.totalAmount || 0),
      0
    );

    return {
      booksBought: totalBooks,
      totalSpent: totalSpent.toFixed(2),
      lastOrder: recentOrders[0]?.createdAt
        ? new Date(recentOrders[0].createdAt).toLocaleDateString()
        : "Never",
    };
  };

  // Process featured categories
  const featuredCategories =
    categories.length > 0
      ? categories.slice(0, 6).map((category, index) => {
          const bookCount = books.filter(
            (book) =>
              book.categoryId === category.id ||
              book.category?.id === category.id
          ).length;

          return {
            id: category.id,
            name: category.name,
            slug:
              category.slug ||
              category.name?.toLowerCase().replace(/\s+/g, "-"),
            count: bookCount,
            color: getCategoryColor(index),
          };
        })
      : [];

  // Process popular books
  const popularBooks = (
    featuredBooks.length > 0 ? featuredBooks : books.slice(0, 6)
  ).map((book) => {
    const categoryName =
      book.category?.name ||
      categories.find((cat) => cat.id === book.categoryId)?.name ||
      "Unknown Category";

    return {
      id: book.id,
      title: book.title || "Untitled Book",
      author: book.author || "Unknown Author",
      price: book.price || 0,
      rating: book.rating || 4.0,
      isFeatured: book.isFeatured || false,
      image:
        book.coverImage ||
        book.imageUrl ||
        `https://via.placeholder.com/150x200/4A90E2/FFFFFF?text=${encodeURIComponent(
          book.title?.substring(0, 20) || "Book"
        )}`,
      category: categoryName,
      description: book.description || "",
      stock: book.stock || 0,
    };
  });

  // Initialize on mount
  useEffect(() => {
    fetchData();
  }, [isAuthenticated]);

  // Loading and error states
  if (loading && books.length === 0) {
    return (
      <div className="home-loading">
        <div className="loading-spinner"></div>
        <p>Loading bookstore data...</p>
        <p className="loading-subtext">Fetching books and categories</p>
      </div>
    );
  }

  if (error && books.length === 0) {
    return (
      <div className="home-error">
        <h2>⚠️ Connection Error</h2>
        <p>Could not connect to backend: {error.message || error}</p>
        <button onClick={fetchData} className="btn btn-primary">
          Retry Connection
        </button>
      </div>
    );
  }

  const readingStats = getUserReadingStats();

  return (
    <div className="home-page">
      {/* AUTH PROMPT MODAL */}
      {showAuthPrompt && (
        <div className="auth-prompt-modal">
          <div className="auth-prompt-content">
            <h3>Login Required</h3>
            <p>
              Please login or register to add items to your cart and make
              purchases.
            </p>
            <div className="auth-prompt-buttons">
              <Link to="/login" className="btn btn-primary">
                Login
              </Link>
              <Link to="/register" className="btn btn-secondary">
                Register
              </Link>
              <button
                onClick={() => setShowAuthPrompt(false)}
                className="btn btn-outline"
              >
                Continue Browsing
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HERO SECTION */}
      <section className="hero-banner">
        <div className="hero-content">
          <h1 className="hero-title">
            {isAuthenticated
              ? `Welcome back, ${user.name}!`
              : "Discover Your Next Favorite Book"}
          </h1>
          <p className="hero-subtitle">
            {books.length > 0
              ? `Browse ${books.length} books across ${categories.length} categories`
              : "New arrivals & exclusive promotions"}
          </p>

          {/* Stats from backend */}
          <div className="hero-stats">
            <div className="stat">
              <span className="stat-number">{books.length}</span>
              <span className="stat-label">Books Available</span>
            </div>
            <div className="stat">
              <span className="stat-number">{categories.length}</span>
              <span className="stat-label">Categories</span>
            </div>
            <div className="stat">
              <span className="stat-number">
                {books.filter((b) => b.isFeatured).length}
              </span>
              <span className="stat-label">Featured</span>
            </div>
            {isAuthenticated && (
              <div className="stat">
                <span className="stat-number">{cartData.totalItems}</span>
                <span className="stat-label">In Cart</span>
              </div>
            )}
          </div>

          {/* USER/GUEST SPECIFIC CTA */}
          <div className="hero-cta">
            {isAuthenticated ? (
              <>
                <Link to="/shop" className="btn btn-primary">
                  Continue Shopping
                </Link>
                {cartData.totalItems > 0 && (
                  <Link to="/cart" className="btn btn-secondary">
                    View Cart ({cartData.totalItems})
                  </Link>
                )}
                {recentOrders.length > 0 && (
                  <Link to="/orders" className="btn btn-outline">
                    View Orders
                  </Link>
                )}
              </>
            ) : (
              <>
                <Link to="/shop" className="btn btn-primary">
                  Shop Now
                </Link>
                <Link to="/register" className="btn btn-secondary">
                  Join Free
                </Link>
              </>
            )}
          </div>

          {/* USER STATS */}
          {isAuthenticated && userStats && (
            <div className="user-stats-preview">
              <div className="stat-card">
                <span className="stat-number">{userStats.totalOrders}</span>
                <span className="stat-label">Orders</span>
              </div>
              <div className="stat-card">
                <span className="stat-number">
                  ${userStats.totalSpent.toFixed(2)}
                </span>
                <span className="stat-label">Total Spent</span>
              </div>
              <div className="stat-card">
                <span className="stat-number">{readingStats.booksBought}</span>
                <span className="stat-label">Books Bought</span>
              </div>
              <div className="stat-card">
                <span className="stat-number">
                  ${cartData.totalPrice.toFixed(2)}
                </span>
                <span className="stat-label">Cart Total</span>
              </div>
            </div>
          )}
        </div>

        <div className="hero-image">
          <div className="promo-badge">50% OFF Selected Titles</div>
          {popularBooks.length > 0 && (
            <div className="hero-book-showcase">
              <img
                src={popularBooks[0].image}
                alt={popularBooks[0].title}
                className="showcase-book"
              />
              <div className="showcase-book-info">
                <h4>{popularBooks[0].title}</h4>
                <p>by {popularBooks[0].author}</p>
                <div className="showcase-price">
                  ${popularBooks[0].price.toFixed(2)}
                </div>
                <button
                  onClick={() =>
                    handleAddToCart(popularBooks[0].id, popularBooks[0].title)
                  }
                  className="btn btn-small"
                >
                  Add to Cart
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* SEARCH BAR */}
      <section className="search-section">
        <div className="container">
          <form className="search-form" onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="Search for books, authors, categories..."
              className="search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" className="search-btn">
              🔍 Search
            </button>
          </form>
          <div className="search-tags">
            <span>Popular Categories:</span>
            {featuredCategories.slice(0, 4).map((category) => (
              <Link
                to={`/shop?category=${category.slug}`}
                key={category.id}
                className="tag"
              >
                {category.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* SERVICE OVERVIEW */}
      <section className="services-overview">
        <div className="container">
          <h2 className="section-title">Our Services</h2>
          <div className="services-grid">
            <div className="service-card">
              <div className="service-icon">📚</div>
              <h3>Book Catalog</h3>
              <p>Browse {books.length} books across all categories</p>
              <Link to="/shop" className="service-link">
                Browse Books →
              </Link>
            </div>

            <div className="service-card">
              <div className="service-icon">🛒</div>
              <h3>Shopping Cart</h3>
              <p>
                {isAuthenticated
                  ? `${
                      cartData.totalItems
                    } items - $${cartData.totalPrice.toFixed(2)} total`
                  : "Add books to your cart"}
              </p>
              <Link
                to={isAuthenticated ? "/cart" : "/login"}
                className="service-link"
              >
                {isAuthenticated ? "View Cart →" : "Login to View →"}
              </Link>
            </div>

            <div className="service-card">
              <div className="service-icon">📦</div>
              <h3>Order Management</h3>
              <p>
                {isAuthenticated
                  ? `${recentOrders.length} recent orders`
                  : "Track your orders"}
              </p>
              <Link
                to={isAuthenticated ? "/orders" : "/login"}
                className="service-link"
              >
                {isAuthenticated ? "View Orders →" : "Login to View →"}
              </Link>
            </div>

            <div className="service-card">
              <div className="service-icon">🔐</div>
              <h3>Secure Auth</h3>
              <p>
                {isAuthenticated
                  ? `Logged in as ${user.name}`
                  : "Register for free account"}
              </p>
              <Link
                to={isAuthenticated ? "/profile" : "/register"}
                className="service-link"
              >
                {isAuthenticated ? "My Profile →" : "Register Now →"}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="featured-categories">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Browse by Category</h2>
            <Link to="/categories" className="view-all">
              View All {categories.length} Categories →
            </Link>
          </div>
          <div className="categories-grid">
            {featuredCategories.map((category) => (
              <Link
                to={`/shop?category=${category.slug}`}
                key={category.id}
                className="category-card"
                style={{ "--category-color": category.color }}
              >
                <div
                  className="category-icon"
                  style={{ backgroundColor: category.color }}
                >
                  {category.name.charAt(0)}
                </div>
                <div className="category-info">
                  <h3 className="category-name">{category.name}</h3>
                  <p className="category-count">{category.count} books</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED BOOKS */}
      <section className="popular-books">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">
              {featuredBooks.length > 0 ? "Featured Books" : "Popular Books"}
            </h2>
            <Link to="/shop" className="view-all">
              View All Books →
            </Link>
          </div>

          {popularBooks.length === 0 ? (
            <div className="no-books-message">
              <p>No books available yet.</p>
              {isAuthenticated && (
                <Link to="/admin/books/add" className="btn btn-primary">
                  Add Books (Admin)
                </Link>
              )}
            </div>
          ) : (
            <>
              <div className="books-grid">
                {popularBooks.map((book) => (
                  <div className="book-card-wrapper" key={book.id}>
                    <Link to={`/book/${book.id}`} className="book-card">
                      <div className="book-image">
                        <img src={book.image} alt={book.title} />
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
                      <div className="book-info">
                        <div className="book-category-tag">{book.category}</div>
                        <h3 className="book-title">{book.title}</h3>
                        <p className="book-author">by {book.author}</p>
                        <div className="book-price">
                          ${book.price.toFixed(2)}
                        </div>

                        <div className="book-actions">
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleAddToCart(book.id, book.title);
                            }}
                            className="btn-cart"
                            disabled={book.stock === 0}
                          >
                            {book.stock === 0 ? "Out of Stock" : "Add to Cart"}
                          </button>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleQuickCheckout(
                                book.id,
                                book.title,
                                book.price
                              );
                            }}
                            className="btn-buy"
                            disabled={book.stock === 0 || !isAuthenticated}
                          >
                            Buy Now
                          </button>
                        </div>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>

              {/* CART PREVIEW */}
              {isAuthenticated && cartData.totalItems > 0 && (
                <div className="cart-preview">
                  <h3>Your Cart ({cartData.totalItems} items)</h3>
                  <div className="cart-summary">
                    <span>Total: ${cartData.totalPrice.toFixed(2)}</span>
                    <Link to="/checkout" className="btn btn-primary">
                      Proceed to Checkout
                    </Link>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* RECENT ORDERS FOR LOGGED-IN USERS */}
      {isAuthenticated && recentOrders.length > 0 && (
        <section className="recent-orders-section">
          <div className="container">
            <div className="section-header">
              <h2 className="section-title">Your Recent Orders</h2>
              <Link to="/orders" className="view-all">
                View All Orders →
              </Link>
            </div>
            <div className="orders-grid">
              {recentOrders.slice(0, 3).map((order) => (
                <div key={order.id} className="order-card">
                  <div className="order-header">
                    <h4>Order #{order.id}</h4>
                    <span className={`order-status ${order.status}`}>
                      {order.status}
                    </span>
                  </div>
                  <div className="order-details">
                    <p>
                      Date: {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                    <p>Items: {order.items?.length || 0}</p>
                    <p className="order-total">
                      Total: ${order.totalAmount?.toFixed(2)}
                    </p>
                  </div>
                  <div className="order-actions">
                    <Link to={`/orders/${order.id}`} className="btn btn-small">
                      View Details
                    </Link>
                    {order.status === "delivered" && (
                      <button
                        className="btn btn-small btn-outline"
                        onClick={async () => {
                          try {
                            // Create review prompt for each book in order
                            navigate("/reviews/new", {
                              state: { orderId: order.id },
                            });
                          } catch (error) {
                            console.error("Error creating review:", error);
                          }
                        }}
                      >
                        Write Review
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* DATABASE INFO SECTION */}
      {books.length > 0 && (
        <section className="database-info">
          <div className="container">
            <div className="database-content">
              <h3>📊 Database Connected Successfully</h3>
              <div className="database-stats">
                <div className="db-stat">
                  <strong>Books:</strong> {books.length} records
                </div>
                <div className="db-stat">
                  <strong>Categories:</strong> {categories.length} categories
                </div>
                <div className="db-stat">
                  <strong>Active Users:</strong>{" "}
                  {isAuthenticated ? "You're logged in" : "Please login"}
                </div>
                <div className="db-stat">
                  <strong>Your Cart:</strong> {cartData.totalItems} items
                </div>
              </div>
              <p className="db-note">
                Backend services: Auth, Books, Cart, and Orders are all
                connected.
                {isAuthenticated
                  ? ` You have ${cartData.totalItems} items in cart and ${recentOrders.length} orders.`
                  : " Login to access cart and order features."}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* CALL TO ACTION */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2 className="cta-title">
              {isAuthenticated
                ? "Continue Your Reading Journey"
                : "Start Your Reading Journey Today"}
            </h2>
            <p className="cta-text">
              {isAuthenticated
                ? `Complete your purchase of ${cartData.totalItems} items or browse more books.`
                : `Join our community of readers. ${books.length} books await!`}
            </p>
            <div className="cta-buttons">
              <Link to="/shop" className="btn btn-primary btn-large">
                {isAuthenticated ? "Continue Shopping" : "Browse Books"}
              </Link>
              {!isAuthenticated ? (
                <Link to="/register" className="btn btn-secondary btn-large">
                  Sign Up Free
                </Link>
              ) : (
                cartData.totalItems > 0 && (
                  <Link to="/checkout" className="btn btn-secondary btn-large">
                    Checkout Now
                  </Link>
                )
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
