import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAppContext } from "../../context/AppContext";
import "./Home.css";

const Home = () => {
  const navigate = useNavigate();
  const {
    user,
    cart,
    books,
    categories,
    loading,
    error,
    fetchBooks,
    fetchCategories,
    addToCart,
    login,
    register,
    logout,
  } = useAppContext();

  const [featuredCategories, setFeaturedCategories] = useState([]);
  const [popularBooks, setPopularBooks] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Fetch real data from backend
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Fetch books and categories from backend
      const [booksData, categoriesData] = await Promise.all([
        fetchBooks(),
        fetchCategories(),
      ]);

      // Set featured categories (first 6 categories)
      if (categoriesData && categoriesData.length > 0) {
        const featured = categoriesData.slice(0, 6).map((cat, index) => ({
          id: cat.id,
          name: cat.name,
          count: cat.bookCount || Math.floor(Math.random() * 100) + 50, // Fallback if no count
          color: getCategoryColor(index),
          slug: cat.slug,
        }));
        setFeaturedCategories(featured);
      } else {
        // Fallback to sample data if no categories
        setFeaturedCategories([
          {
            id: 1,
            name: "Fiction",
            count: 150,
            color: "#3498db",
            slug: "fiction",
          },
          {
            id: 2,
            name: "Non-Fiction",
            count: 120,
            color: "#2ecc71",
            slug: "non-fiction",
          },
          {
            id: 3,
            name: "Science",
            count: 85,
            color: "#9b59b6",
            slug: "science",
          },
          {
            id: 4,
            name: "Biography",
            count: 65,
            color: "#e74c3c",
            slug: "biography",
          },
          {
            id: 5,
            name: "Technology",
            count: 90,
            color: "#f39c12",
            slug: "technology",
          },
          {
            id: 6,
            name: "Children",
            count: 110,
            color: "#1abc9c",
            slug: "children",
          },
        ]);
      }

      // Set popular books (first 6 books from API)
      if (books && books.length > 0) {
        const popular = books.slice(0, 6).map((book) => ({
          id: book.id,
          title: book.title,
          author: book.author,
          price: book.price,
          rating: book.averageRating || 4.5, // Use actual rating if available
          image:
            book.imageUrl ||
            `https://via.placeholder.com/150x200/3498db/ffffff?text=${book.title.substring(
              0,
              10
            )}`,
          description: book.description,
          categoryId: book.categoryId,
        }));
        setPopularBooks(popular);
      }
    } catch (error) {
      console.error("Failed to load homepage data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getCategoryColor = (index) => {
    const colors = [
      "#3498db",
      "#2ecc71",
      "#9b59b6",
      "#e74c3c",
      "#f39c12",
      "#1abc9c",
      "#34495e",
      "#16a085",
      "#8e44ad",
    ];
    return colors[index % colors.length];
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/books?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleAddToCart = async (e, bookId, bookTitle) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      alert("Please login to add items to cart");
      navigate("/login");
      return;
    }

    try {
      const result = await addToCart(bookId, 1);
      if (result.success) {
        alert(`Added "${bookTitle}" to cart!`);
      } else {
        alert(result.error || "Failed to add to cart");
      }
    } catch (error) {
      alert("Failed to add to cart. Please try again.");
    }
  };

  const handleQuickView = (e, bookId) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/book/${bookId}`);
  };

  if (isLoading) {
    return (
      <div className="home-page loading">
        <div className="loading-spinner"></div>
        <p>Loading books and categories...</p>
      </div>
    );
  }

  return (
    <div className="home-page">
      {/* HERO BANNER SECTION */}
      <section className="hero-banner">
        <div className="hero-content">
          <h1 className="hero-title">Welcome to Readify Bookstore</h1>
          <p className="hero-subtitle">
            {user
              ? `Hello, ${user.name}! Discover your next read`
              : "Discover Your Next Favorite Book"}
          </p>
          <div className="hero-cta">
            <Link to="/books" className="btn btn-primary">
              Browse All Books
            </Link>
            {user ? (
              <Link to="/cart" className="btn btn-secondary">
                View Cart ({cart.length || 0})
              </Link>
            ) : (
              <Link to="/register" className="btn btn-secondary">
                Create Free Account
              </Link>
            )}
          </div>
        </div>
        <div className="hero-image">
          <div className="promo-badge">
            {books.length > 0
              ? `${books.length}+ Books Available`
              : "Thousands of Books"}
          </div>
        </div>
      </section>

      {/* SEARCH BAR SECTION */}
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
            <span>Popular searches:</span>
            {featuredCategories.slice(0, 4).map((category) => (
              <button
                key={category.id}
                className="tag"
                onClick={() => navigate(`/books?category=${category.slug}`)}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED CATEGORIES SECTION */}
      <section className="featured-categories">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Featured Categories</h2>
            <Link to="/categories" className="view-all">
              View All Categories →
            </Link>
          </div>
          <div className="categories-grid">
            {featuredCategories.map((category) => (
              <Link
                to={`/books?category=${category.slug}`}
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
                <div className="category-arrow">→</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* POPULAR BOOKS SECTION */}
      <section className="popular-books">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Popular Books</h2>
            <Link to="/books" className="view-all">
              View All Books →
            </Link>
          </div>
          {popularBooks.length === 0 ? (
            <div className="no-books-message">
              <p>No books available. Check back soon!</p>
              <Link to="/books" className="btn btn-primary">
                Browse All Books
              </Link>
            </div>
          ) : (
            <div className="books-grid">
              {popularBooks.map((book) => (
                <div key={book.id} className="book-card-wrapper">
                  <Link to={`/book/${book.id}`} className="book-card">
                    <div className="book-image">
                      <img src={book.image} alt={book.title} />
                      <div className="book-badge">Available</div>
                    </div>
                    <div className="book-info">
                      <h3 className="book-title">{book.title}</h3>
                      <p className="book-author">by {book.author}</p>
                      <div className="book-rating">
                        {"★".repeat(Math.floor(book.rating))}
                        {"☆".repeat(5 - Math.floor(book.rating))}
                        <span className="rating-number">
                          ({book.rating.toFixed(1)})
                        </span>
                      </div>
                      <div className="book-price">
                        ${parseFloat(book.price).toFixed(2)}
                      </div>
                    </div>
                  </Link>
                  <div className="book-actions">
                    <button
                      className="add-to-cart-btn"
                      onClick={(e) => handleAddToCart(e, book.id, book.title)}
                    >
                      Add to Cart
                    </button>
                    <button
                      className="quick-view-btn"
                      onClick={(e) => handleQuickView(e, book.id)}
                    >
                      Quick View
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* STATS SECTION */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-number">{books.length || "1000+"}</div>
              <div className="stat-label">Books Available</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{categories.length || "50+"}</div>
              <div className="stat-label">Categories</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">
                {user ? "⭐ Member" : "Join Free"}
              </div>
              <div className="stat-label">
                {user ? "Premium Reader" : "Create Account"}
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-number">Free Shipping</div>
              <div className="stat-label">On orders over $25</div>
            </div>
          </div>
        </div>
      </section>

      {/* CALL TO ACTION SECTION */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2 className="cta-title">Start Your Reading Journey Today</h2>
            <p className="cta-text">
              {user
                ? `Welcome back, ${user.name}! Continue exploring our collection.`
                : "Join thousands of readers who discovered their next favorite book with us."}
            </p>
            <div className="cta-buttons">
              <Link to="/books" className="btn btn-primary btn-large">
                Browse All Books
              </Link>
              {user ? (
                <Link to="/profile" className="btn btn-secondary btn-large">
                  My Profile
                </Link>
              ) : (
                <Link to="/register" className="btn btn-secondary btn-large">
                  Create Free Account
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ERROR MESSAGE (if any) */}
      {error && (
        <div className="error-message">
          <p>{error}</p>
          <button onClick={loadData}>Retry</button>
        </div>
      )}
    </div>
  );
};

export default Home;
