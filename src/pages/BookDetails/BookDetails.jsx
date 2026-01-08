import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useApi } from "../../hooks/useApi";
import { useAuth } from "../../context/AuthContext";
import "./BookDetails.css";

const BookDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { get, post, loading: apiLoading, error: apiError } = useApi();

  // State for book data and related data
  const [book, setBook] = useState(null);
  const [relatedBooks, setRelatedBooks] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [activeTab, setActiveTab] = useState("description");
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [cartData, setCartData] = useState(null);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);

  // Fetch book details and related data
  const fetchBookDetails = async () => {
    setIsLoading(true);
    try {
      // Fetch book details
      const bookResponse = await get(`/books/${id}`);
      if (bookResponse && bookResponse.book) {
        setBook(bookResponse.book);

        // Fetch related books by category
        if (bookResponse.book.categoryId) {
          const relatedResponse = await get(
            `/books/category/${bookResponse.book.categoryId}`
          );
          if (relatedResponse && relatedResponse.books) {
            // Filter out current book and limit to 4
            setRelatedBooks(
              relatedResponse.books
                .filter((b) => b.id !== bookResponse.book.id)
                .slice(0, 4)
            );
          }
        }

        // Fetch reviews for this book
        const reviewsResponse = await get(`/reviews/book/${id}`);
        if (reviewsResponse && reviewsResponse.reviews) {
          setReviews(reviewsResponse.reviews);
        }
      }
    } catch (error) {
      console.error("Error fetching book details:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch cart data if authenticated
  const fetchCartData = async () => {
    if (!isAuthenticated) return;

    try {
      const cartResponse = await get("/cart");
      if (cartResponse) {
        setCartData(cartResponse);

        // Check if book is in cart
        if (cartResponse.items) {
          const cartItem = cartResponse.items.find(
            (item) =>
              item.book?.id === parseInt(id) || item.bookId === parseInt(id)
          );
          if (cartItem) {
            setQuantity(cartItem.quantity);
          }
        }
      }
    } catch (error) {
      console.log("Could not fetch cart:", error.message);
    }
  };

  // Initialize on component mount
  useEffect(() => {
    fetchBookDetails();
    if (isAuthenticated) {
      fetchCartData();
    }
  }, [id, isAuthenticated]);

  // Helper to get image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) {
      return "https://via.placeholder.com/400x500/cccccc/333333?text=No+Image";
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

  // Quantity handlers
  const increaseQuantity = () => {
    if (quantity < (book?.stock || 10)) {
      setQuantity(quantity + 1);
    }
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value) || 1;
    const maxStock = book?.stock || 10;
    if (value >= 1 && value <= maxStock) {
      setQuantity(value);
    }
  };

  // Add to cart handler
  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      setShowAuthPrompt(true);
      return;
    }

    if (!book || book.stock === 0) {
      alert("This book is out of stock");
      return;
    }

    setIsAddingToCart(true);

    try {
      const response = await post("/cart/add", {
        bookId: book.id,
        quantity: quantity,
      });

      if (response.success) {
        alert(`Added ${quantity} copy(ies) of "${book.title}" to cart`);
        // Refresh cart data
        await fetchCartData();
      } else {
        alert(`Failed to add to cart: ${response.error || "Unknown error"}`);
      }
    } catch (error) {
      alert(
        `Failed to add to cart: ${error.response?.data?.error || error.message}`
      );
    } finally {
      setIsAddingToCart(false);
    }
  };

  // Buy Now handler
  const handleBuyNow = async () => {
    if (!isAuthenticated) {
      setShowAuthPrompt(true);
      return;
    }

    if (!book || book.stock === 0) {
      alert("This book is out of stock");
      return;
    }

    setIsAddingToCart(true);

    try {
      // First add to cart
      const cartResponse = await post("/cart/add", {
        bookId: book.id,
        quantity: quantity,
      });

      if (cartResponse.success) {
        // Refresh cart data
        await fetchCartData();
        // Navigate to checkout
        navigate("/checkout");
      } else {
        alert(
          `Failed to add to cart: ${cartResponse.error || "Unknown error"}`
        );
      }
    } catch (error) {
      alert(
        `Failed to add to cart: ${error.response?.data?.error || error.message}`
      );
    } finally {
      setIsAddingToCart(false);
    }
  };

  // Add to wishlist handler
  const handleAddToWishlist = () => {
    if (!isAuthenticated) {
      setShowAuthPrompt(true);
      return;
    }

    setIsInWishlist(!isInWishlist);
    alert(
      isInWishlist
        ? `Removed "${book?.title}" from wishlist`
        : `Added "${book?.title}" to wishlist (coming soon)`
    );
  };

  // Write review handler
  const handleWriteReview = () => {
    if (!isAuthenticated) {
      setShowAuthPrompt(true);
      return;
    }

    navigate(`/reviews/new`, { state: { bookId: id, bookTitle: book?.title } });
  };

  // Share book
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: book?.title,
        text: `Check out "${book?.title}" by ${book?.author}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };

  // Render stars for rating
  const renderStars = (rating) => {
    const numericRating = parseFloat(rating) || 0;
    const fullStars = Math.floor(numericRating);
    const hasHalfStar = numericRating % 1 >= 0.5;

    return (
      <>
        {"★".repeat(fullStars)}
        {hasHalfStar && "½"}
        {"☆".repeat(5 - fullStars - (hasHalfStar ? 1 : 0))}
      </>
    );
  };

  // Calculate average rating from reviews
  const calculateAverageRating = () => {
    if (!reviews || reviews.length === 0) return 0;

    const total = reviews.reduce(
      (sum, review) => sum + (review.rating || 0),
      0
    );
    return (total / reviews.length).toFixed(1);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="book-details-page">
        <div className="container">
          <div className="book-loading">
            <div className="loading-spinner"></div>
            <p>Loading book details...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (apiError || !book) {
    return (
      <div className="book-details-page">
        <div className="container">
          <div className="book-error">
            <h2>Book Not Found</h2>
            <p>
              The book you're looking for doesn't exist or couldn't be loaded.
            </p>
            <div className="error-actions">
              <Link to="/categories" className="btn btn-primary">
                Browse Books
              </Link>
              <button onClick={fetchBookDetails} className="btn btn-secondary">
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const averageRating = calculateAverageRating();
  const discountPercentage = book.originalPrice
    ? Math.round((1 - book.price / book.originalPrice) * 100)
    : 0;

  return (
    <div className="book-details-page">
      {/* Auth Prompt Modal */}
      {showAuthPrompt && (
        <div className="auth-prompt-modal">
          <div className="auth-prompt-content">
            <h3>Login Required</h3>
            <p>Please login to add items to your cart or wishlist</p>
            <div className="auth-prompt-buttons">
              <Link
                to="/login"
                state={{ redirectTo: `/book/${id}` }}
                className="btn btn-primary"
              >
                Login
              </Link>
              <Link
                to="/register"
                state={{ redirectTo: `/book/${id}` }}
                className="btn btn-secondary"
              >
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

      {/* Breadcrumb */}
      <div className="breadcrumb">
        <div className="container">
          <Link to="/">Home</Link> &gt;
          <Link to="/categories">Categories</Link> &gt;
          {book.category && (
            <Link
              to={`/categories?category=${
                book.category.slug || book.category.name?.toLowerCase()
              }`}
            >
              {book.category.name}
            </Link>
          )}{" "}
          &gt;
          <span>{book.title}</span>
        </div>
      </div>

      <div className="container book-details-container">
        {/* Main Book Details */}
        <div className="book-details-main">
          {/* Book Image */}
          <div className="book-image-section">
            <div className="book-image-container">
              <img
                src={getImageUrl(book.coverImage || book.imageUrl)}
                alt={book.title}
                className="book-main-image"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = `https://via.placeholder.com/400x500/3498db/ffffff?text=${encodeURIComponent(
                    book.title?.substring(0, 20) || "Book"
                  )}`;
                }}
              />
              {book.isFeatured && (
                <div className="book-badge featured">Featured</div>
              )}
              {book.stock < 5 && book.stock > 0 && (
                <div className="book-badge low-stock">Low Stock</div>
              )}
              {book.stock === 0 && (
                <div className="book-badge out-of-stock">Out of Stock</div>
              )}
              {discountPercentage > 0 && (
                <div className="book-badge discount">
                  -{discountPercentage}%
                </div>
              )}
            </div>

            {/* Share and Wishlist Buttons */}
            <div className="book-actions">
              <button
                className={`action-btn wishlist-btn ${
                  isInWishlist ? "active" : ""
                }`}
                onClick={handleAddToWishlist}
                disabled={isAddingToCart}
              >
                {isInWishlist ? "❤️ In Wishlist" : "🤍 Add to Wishlist"}
              </button>
              <button
                className="action-btn review-btn"
                onClick={handleWriteReview}
                disabled={!isAuthenticated}
              >
                ⭐ Write Review
              </button>
              <button className="action-btn share-btn" onClick={handleShare}>
                🔗 Share
              </button>
            </div>

            {/* Service Info */}
            <div className="service-info-card">
              <h4>Connected Services</h4>
              <div className="service-status">
                <div className="status-item">
                  <span className="status-icon">📚</span>
                  <span className="status-text">Books API</span>
                  <span className="status-indicator active"></span>
                </div>
                <div className="status-item">
                  <span className="status-icon">🛒</span>
                  <span className="status-text">Cart API</span>
                  <span className="status-indicator active"></span>
                </div>
                <div className="status-item">
                  <span className="status-icon">⭐</span>
                  <span className="status-text">Reviews API</span>
                  <span className="status-indicator active"></span>
                </div>
              </div>
            </div>
          </div>

          {/* Book Info */}
          <div className="book-info-section">
            <div className="book-header">
              <h1 className="book-title">{book.title}</h1>
              <h2 className="book-author">
                by {book.author || "Unknown Author"}
              </h2>

              <div className="book-rating-review">
                <div className="stars">
                  {renderStars(book.rating || averageRating)}
                  <span className="rating-number">
                    {book.rating || averageRating}
                  </span>
                </div>
                <span className="review-count">
                  ({reviews.length} review{reviews.length !== 1 ? "s" : ""})
                </span>
                {reviews.length > 0 && (
                  <Link to="#reviews" className="view-reviews">
                    View all reviews
                  </Link>
                )}
              </div>
            </div>

            {/* Book Metadata */}
            <div className="book-metadata">
              {book.category && (
                <div className="metadata-item">
                  <span className="metadata-label">Category:</span>
                  <Link
                    to={`/categories?category=${
                      book.category.slug || book.category.name?.toLowerCase()
                    }`}
                    className="metadata-value"
                  >
                    {book.category.name}
                  </Link>
                </div>
              )}
              {book.publisher && (
                <div className="metadata-item">
                  <span className="metadata-label">Publisher:</span>
                  <span className="metadata-value">{book.publisher}</span>
                </div>
              )}
              {book.publishedYear && (
                <div className="metadata-item">
                  <span className="metadata-label">Published:</span>
                  <span className="metadata-value">{book.publishedYear}</span>
                </div>
              )}
              {book.pages && (
                <div className="metadata-item">
                  <span className="metadata-label">Pages:</span>
                  <span className="metadata-value">{book.pages}</span>
                </div>
              )}
              {book.isbn && (
                <div className="metadata-item">
                  <span className="metadata-label">ISBN:</span>
                  <span className="metadata-value">{book.isbn}</span>
                </div>
              )}
              {book.language && (
                <div className="metadata-item">
                  <span className="metadata-label">Language:</span>
                  <span className="metadata-value">{book.language}</span>
                </div>
              )}
            </div>

            {/* Price Section */}
            <div className="book-price-section">
              <div className="price-current">${book.price.toFixed(2)}</div>
              {book.originalPrice && book.originalPrice > book.price && (
                <>
                  <div className="price-original">
                    ${book.originalPrice.toFixed(2)}
                  </div>
                  <div className="discount-badge">
                    Save {discountPercentage}%
                  </div>
                </>
              )}
            </div>

            {/* Short Description */}
            <div className="book-short-description">
              <p>{book.description || "No description available."}</p>
            </div>

            {/* Stock Status */}
            <div className="stock-status">
              {book.stock > 10 ? (
                <span className="in-stock">
                  🟢 In Stock ({book.stock} available)
                </span>
              ) : book.stock > 0 ? (
                <span className="low-stock">
                  🟡 Only {book.stock} left in stock
                </span>
              ) : (
                <span className="out-of-stock">🔴 Out of Stock</span>
              )}
            </div>

            {/* Cart Preview */}
            {isAuthenticated && cartData && cartData.totalItems > 0 && (
              <div className="cart-preview">
                <div className="cart-preview-content">
                  <span className="cart-preview-text">
                    You have {cartData.totalItems} item
                    {cartData.totalItems !== 1 ? "s" : ""} in cart
                  </span>
                  <Link to="/cart" className="cart-preview-link">
                    View Cart →
                  </Link>
                </div>
              </div>
            )}

            {/* Quantity and Add to Cart */}
            <div className="purchase-section">
              <div className="quantity-selector">
                <label htmlFor="quantity">Quantity:</label>
                <div className="quantity-controls">
                  <button
                    className="quantity-btn minus"
                    onClick={decreaseQuantity}
                    disabled={
                      quantity <= 1 || isAddingToCart || book.stock === 0
                    }
                  >
                    −
                  </button>
                  <input
                    type="number"
                    id="quantity"
                    min="1"
                    max={book.stock || 10}
                    value={quantity}
                    onChange={handleQuantityChange}
                    className="quantity-input"
                    disabled={isAddingToCart || book.stock === 0}
                  />
                  <button
                    className="quantity-btn plus"
                    onClick={increaseQuantity}
                    disabled={
                      quantity >= (book.stock || 10) ||
                      isAddingToCart ||
                      book.stock === 0
                    }
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="cart-actions">
                <button
                  className="btn add-to-cart-btn"
                  onClick={handleAddToCart}
                  disabled={book.stock === 0 || isAddingToCart}
                >
                  {isAddingToCart ? (
                    <>
                      <span className="spinner"></span>
                      Adding...
                    </>
                  ) : (
                    <>🛒 Add to Cart (${(book.price * quantity).toFixed(2)})</>
                  )}
                </button>
                <button
                  className="btn buy-now-btn"
                  onClick={handleBuyNow}
                  disabled={book.stock === 0 || isAddingToCart}
                >
                  {isAddingToCart ? "Processing..." : "⚡ Buy Now"}
                </button>
              </div>
            </div>

            {/* Additional Info */}
            <div className="additional-info">
              <div className="info-item">
                <span>📦 Free shipping on orders over $30</span>
              </div>
              <div className="info-item">
                <span>↩️ 30-day return policy</span>
              </div>
              <div className="info-item">
                <span>🛡️ Secure checkout</span>
              </div>
              <div className="info-item">
                <span>💳 Multiple payment methods</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs for Description/Details/Reviews */}
        <div className="book-tabs-section">
          <div className="tabs-header">
            <button
              className={`tab-btn ${
                activeTab === "description" ? "active" : ""
              }`}
              onClick={() => setActiveTab("description")}
            >
              Description
            </button>
            <button
              className={`tab-btn ${activeTab === "details" ? "active" : ""}`}
              onClick={() => setActiveTab("details")}
            >
              Details
            </button>
            <button
              className={`tab-btn ${activeTab === "reviews" ? "active" : ""}`}
              onClick={() => setActiveTab("reviews")}
            >
              Reviews ({reviews.length})
            </button>
          </div>

          <div className="tabs-content">
            {activeTab === "description" && (
              <div className="tab-panel description-panel">
                <h3>About This Book</h3>
                <div className="description-content">
                  {book.description ? (
                    <p>{book.description}</p>
                  ) : (
                    <p className="no-description">
                      No description available for this book.
                    </p>
                  )}
                </div>
              </div>
            )}

            {activeTab === "details" && (
              <div className="tab-panel details-panel">
                <h3>Product Details</h3>
                <table className="details-table">
                  <tbody>
                    <tr>
                      <th>Title</th>
                      <td>{book.title}</td>
                    </tr>
                    <tr>
                      <th>Author</th>
                      <td>{book.author || "Unknown"}</td>
                    </tr>
                    {book.publisher && (
                      <tr>
                        <th>Publisher</th>
                        <td>{book.publisher}</td>
                      </tr>
                    )}
                    {book.publishedYear && (
                      <tr>
                        <th>Publication Year</th>
                        <td>{book.publishedYear}</td>
                      </tr>
                    )}
                    {book.pages && (
                      <tr>
                        <th>Pages</th>
                        <td>{book.pages}</td>
                      </tr>
                    )}
                    {book.isbn && (
                      <tr>
                        <th>ISBN</th>
                        <td>{book.isbn}</td>
                      </tr>
                    )}
                    {book.language && (
                      <tr>
                        <th>Language</th>
                        <td>{book.language}</td>
                      </tr>
                    )}
                    <tr>
                      <th>Category</th>
                      <td>{book.category?.name || "Uncategorized"}</td>
                    </tr>
                    <tr>
                      <th>Stock</th>
                      <td>{book.stock || 0} available</td>
                    </tr>
                    <tr>
                      <th>Price</th>
                      <td>${book.price.toFixed(2)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === "reviews" && (
              <div className="tab-panel reviews-panel">
                <h3>Customer Reviews</h3>

                {reviews.length === 0 ? (
                  <div className="no-reviews">
                    <div className="no-reviews-icon">⭐</div>
                    <h4>No reviews yet</h4>
                    <p>Be the first to review this book!</p>
                    <button
                      className="btn btn-primary"
                      onClick={handleWriteReview}
                      disabled={!isAuthenticated}
                    >
                      Write First Review
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="review-summary">
                      <div className="average-rating">
                        <div className="average-number">{averageRating}</div>
                        <div className="average-stars">
                          {renderStars(averageRating)}
                        </div>
                        <div className="average-count">
                          {reviews.length} review
                          {reviews.length !== 1 ? "s" : ""}
                        </div>
                      </div>
                    </div>

                    {/* Reviews List */}
                    <div className="reviews-list">
                      {reviews.map((review) => (
                        <div key={review.id} className="review-card">
                          <div className="review-header">
                            <div className="reviewer-info">
                              <div className="reviewer">
                                {review.user?.name || "Anonymous"}
                              </div>
                              {review.user?.role === "admin" && (
                                <span className="reviewer-badge admin">
                                  Admin
                                </span>
                              )}
                            </div>
                            <div className="review-rating">
                              {renderStars(review.rating)}
                            </div>
                            <div className="review-date">
                              {new Date(review.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                          {review.title && (
                            <div className="review-title">{review.title}</div>
                          )}
                          <div className="review-content">
                            {review.comment || "No comment provided."}
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Related Books Section */}
        {relatedBooks.length > 0 && (
          <div className="related-books-section">
            <h2 className="section-title">You May Also Like</h2>
            <div className="related-books-grid">
              {relatedBooks.map((relatedBook) => (
                <Link
                  to={`/book/${relatedBook.id}`}
                  key={relatedBook.id}
                  className="related-book-card"
                >
                  <div className="related-book-image">
                    <img
                      src={getImageUrl(
                        relatedBook.coverImage || relatedBook.imageUrl
                      )}
                      alt={relatedBook.title}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = `https://via.placeholder.com/150x200/3498db/ffffff?text=${encodeURIComponent(
                          relatedBook.title?.substring(0, 10) || "Book"
                        )}`;
                      }}
                    />
                    {relatedBook.isFeatured && (
                      <div className="related-book-badge">Featured</div>
                    )}
                  </div>
                  <div className="related-book-info">
                    <h3 className="related-book-title">{relatedBook.title}</h3>
                    <p className="related-book-author">
                      {relatedBook.author || "Unknown Author"}
                    </p>
                    <div className="related-book-rating">
                      {renderStars(relatedBook.rating || 0)} (
                      {relatedBook.rating || "0.0"})
                    </div>
                    <div className="related-book-price">
                      ${relatedBook.price.toFixed(2)}
                    </div>
                    <button
                      className="related-book-cart-btn"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (!isAuthenticated) {
                          setShowAuthPrompt(true);
                        } else {
                          // Quick add to cart
                          post("/cart/add", {
                            bookId: relatedBook.id,
                            quantity: 1,
                          })
                            .then(() => {
                              alert(`Added "${relatedBook.title}" to cart`);
                              fetchCartData();
                            })
                            .catch((error) => {
                              alert("Failed to add to cart");
                            });
                        }
                      }}
                    >
                      + Add to Cart
                    </button>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Database Connection Info */}
        <div className="database-info">
          <div className="db-info-card">
            <div className="db-header">
              <span className="db-icon">📊</span>
              <h4>Database Connected</h4>
            </div>
            <div className="db-details">
              <div className="db-detail">
                <span className="db-label">Book ID:</span>
                <span className="db-value">{book.id}</span>
              </div>
              <div className="db-detail">
                <span className="db-label">Stock:</span>
                <span className="db-value">{book.stock || 0} units</span>
              </div>
              <div className="db-detail">
                <span className="db-label">Price:</span>
                <span className="db-value">${book.price.toFixed(2)}</span>
              </div>
              <div className="db-detail">
                <span className="db-label">Reviews:</span>
                <span className="db-value">{reviews.length} total</span>
              </div>
            </div>
            <div className="db-services">
              <span>Connected Services:</span>
              <div className="service-tags">
                <span className="service-tag">Books API</span>
                <span className="service-tag">Cart API</span>
                <span className="service-tag">Reviews API</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookDetails;
