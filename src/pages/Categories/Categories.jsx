import React, { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useCategories } from "../../hooks/useCategories";
import { useBooks } from "../../hooks/useBooks";
import "./Categories.css";

const Categories = () => {
  const [searchParams] = useSearchParams();
  const selectedCategory = searchParams.get("category") || "all";

  // Use custom hooks
  const {
    categories: backendCategories,
    loading: categoriesLoading,
    error: categoriesError,
    fetchCategories,
  } = useCategories();

  const {
    books,
    loading: booksLoading,
    error: booksError,
    fetchBooks,
  } = useBooks();

  // State for filters
  const [priceRange, setPriceRange] = useState([0, 100]);
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState("newest");
  const [selectedCategories, setSelectedCategories] = useState([
    selectedCategory === "all" ? "all" : selectedCategory,
  ]);

  // Fetch data on component mount
  useEffect(() => {
    fetchCategories();
    fetchBooks();
  }, [fetchCategories, fetchBooks]);

  // Transform backend categories for UI
  const categories = [
    {
      id: "all",
      name: "All",
      slug: "all",
      count: books.length || 0,
    },
    ...backendCategories.map((category) => {
      // Count books in this category
      const bookCount = books.filter(
        (book) =>
          book.category?.id === category.id || book.categoryId === category.id
      ).length;

      return {
        id: category.id,
        name: category.name,
        slug: category.slug || category.name.toLowerCase().replace(/\s+/g, "-"),
        count: bookCount,
        description: category.description,
      };
    }),
  ];

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
        process.env.REACT_APP_API_URL || "http://localhost:5001"
      }${imagePath}`;
    }

    return imagePath;
  };

  // Filter books based on selected category and filters
  const filteredBooks = books.filter((book) => {
    // Category filter
    if (!selectedCategories.includes("all")) {
      const bookCategorySlug =
        book.category?.slug ||
        book.category?.name?.toLowerCase().replace(/\s+/g, "-") ||
        "unknown";

      if (!selectedCategories.includes(bookCategorySlug)) {
        return false;
      }
    }

    // Price filter
    if (book.price < priceRange[0] || book.price > priceRange[1]) {
      return false;
    }

    // Rating filter (if book has rating)
    if (book.rating < minRating) {
      return false;
    }

    return true;
  });

  // Sort books
  const sortedBooks = [...filteredBooks].sort((a, b) => {
    switch (sortBy) {
      case "price-low":
        return (a.price || 0) - (b.price || 0);
      case "price-high":
        return (b.price || 0) - (a.price || 0);
      case "rating":
        return (b.rating || 0) - (a.rating || 0);
      case "newest":
      default:
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    }
  });

  // Handle category selection
  const handleCategoryClick = (categorySlug) => {
    if (categorySlug === "all") {
      setSelectedCategories(["all"]);
    } else {
      if (selectedCategories.includes("all")) {
        setSelectedCategories([categorySlug]);
      } else if (selectedCategories.includes(categorySlug)) {
        setSelectedCategories(
          selectedCategories.filter((cat) => cat !== categorySlug)
        );
      } else {
        setSelectedCategories([...selectedCategories, categorySlug]);
      }
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
  };

  // Loading state
  const isLoading = categoriesLoading || booksLoading;
  const error = categoriesError || booksError;

  if (isLoading && books.length === 0) {
    return (
      <div className="categories-loading">
        <div className="loading-spinner"></div>
        <p>Loading categories and books...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="categories-error">
        <h2>Error Loading Data</h2>
        <p>{error}</p>
        <button
          onClick={() => {
            fetchCategories();
            fetchBooks();
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="categories-page">
      {/* Breadcrumb */}
      <div className="breadcrumb">
        <div className="container">
          <Link to="/">Home</Link> &gt; <span>Categories</span>
        </div>
      </div>

      <div className="container categories-container">
        {/* Page Header */}
        <div className="page-header">
          <h1 className="page-title">Browse Books by Category</h1>
          <p className="page-subtitle">
            Discover {filteredBooks.length} books in our collection
            {backendCategories.length > 0 &&
              ` across ${backendCategories.length} categories`}
          </p>

          {/* Database Info */}
          {books.length > 0 && (
            <div className="database-info">
              <small>
                📊 Connected to database: {books.length} books,{" "}
                {backendCategories.length} categories
              </small>
            </div>
          )}
        </div>

        <div className="categories-layout">
          {/* Sidebar - Filters */}
          <aside className="filters-sidebar">
            {/* Categories Filter */}
            <div className="filter-section">
              <h3 className="filter-title">Categories</h3>
              <div className="categories-list">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    className={`category-btn ${
                      selectedCategories.includes(category.slug) ? "active" : ""
                    }`}
                    onClick={() => handleCategoryClick(category.slug)}
                  >
                    <span className="category-name">{category.name}</span>
                    <span className="category-count">({category.count})</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Price Filter */}
            <div className="filter-section">
              <h3 className="filter-title">Price Range</h3>
              <div className="price-filter">
                <div className="price-range-display">
                  <span>$0 - ${priceRange[1]}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={priceRange[1]}
                  onChange={handlePriceChange}
                  className="price-slider"
                />
                <div className="price-labels">
                  <span>$0</span>
                  <span>$50</span>
                  <span>$100+</span>
                </div>
              </div>
            </div>

            {/* Rating Filter */}
            <div className="filter-section">
              <h3 className="filter-title">Minimum Rating</h3>
              <div className="rating-filter">
                {[4, 3, 2, 1, 0].map((rating) => (
                  <button
                    key={rating}
                    className={`rating-btn ${
                      minRating === rating ? "active" : ""
                    }`}
                    onClick={() => setMinRating(rating)}
                  >
                    {rating === 0 ? "Any Rating" : `${rating}+ Stars`}
                  </button>
                ))}
              </div>
            </div>

            {/* Clear Filters Button */}
            <button className="clear-filters-btn" onClick={clearFilters}>
              Clear All Filters
            </button>
          </aside>

          {/* Main Content - Books Grid */}
          <main className="books-main">
            {/* Sorting Options */}
            <div className="sorting-bar">
              <div className="sorting-options">
                <span className="sort-label">Sort by:</span>
                <select
                  className="sort-select"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="newest">Newest Arrivals</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                </select>
              </div>
              <div className="results-count">
                Showing {sortedBooks.length} of {books.length} books
              </div>
            </div>

            {/* Books Grid */}
            {sortedBooks.length === 0 ? (
              <div className="no-results">
                <h3>No books found</h3>
                <p>Try adjusting your filters or select different categories</p>
                <button className="btn btn-primary" onClick={clearFilters}>
                  Clear All Filters
                </button>
              </div>
            ) : (
              <div className="books-grid">
                {sortedBooks.map((book) => {
                  // Get category name
                  const categoryName = book.category?.name || "Unknown";
                  const categorySlug =
                    book.category?.slug ||
                    book.category?.name?.toLowerCase().replace(/\s+/g, "-") ||
                    "unknown";

                  return (
                    <Link
                      to={`/book/${book.id}`}
                      key={book.id}
                      className="book-card"
                    >
                      <div className="book-image">
                        <img
                          src={getBookImageUrl(
                            book.imageUrl || book.coverImage
                          )}
                          alt={book.title}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = `https://via.placeholder.com/150x200/3498db/ffffff?text=${encodeURIComponent(
                              book.title?.substring(0, 10) || "Book"
                            )}`;
                          }}
                        />
                        <div className="book-category">
                          <Link
                            to={`/categories?category=${categorySlug}`}
                            onClick={(e) => e.stopPropagation()}
                            className="category-link"
                          >
                            {categoryName}
                          </Link>
                        </div>
                        {book.isFeatured && (
                          <div className="book-badge">Featured</div>
                        )}
                      </div>
                      <div className="book-info">
                        <h3 className="book-title">{book.title}</h3>
                        <p className="book-author">
                          by {book.author || "Unknown Author"}
                        </p>
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
                        {book.stock > 0 ? (
                          <button
                            className="add-to-cart-btn"
                            onClick={(e) => {
                              e.preventDefault();
                              // You'll implement actual add to cart functionality later
                              alert(`Added "${book.title}" to cart`);
                            }}
                          >
                            Add to Cart
                          </button>
                        ) : (
                          <button className="out-of-stock-btn" disabled>
                            Out of Stock
                          </button>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}

            {/* Pagination - You can implement actual pagination when your API supports it */}
            {sortedBooks.length > 0 && (
              <div className="pagination">
                <button className="pagination-btn disabled">← Previous</button>
                <div className="pagination-pages">
                  <button className="page-btn active">1</button>
                  {books.length > 12 && <button className="page-btn">2</button>}
                  {books.length > 24 && <button className="page-btn">3</button>}
                  {books.length > 36 && <span>...</span>}
                  {books.length > 48 && (
                    <button className="page-btn">
                      {Math.ceil(books.length / 12)}
                    </button>
                  )}
                </div>
                <button className="pagination-btn">Next →</button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Categories;
