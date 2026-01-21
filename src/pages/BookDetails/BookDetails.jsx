import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext"; // Import AuthContext
import "./BookDetails.css";

const BookDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, mockDB, getBooks, getCategories, addToCart } = useAuth();

  // Real book data from mock database
  const [bookData, setBookData] = useState(null);
  const [relatedBooks, setRelatedBooks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isInWishlist, setIsInWishlist] = useState(false);

  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("description");

  // Load book data from mock database
  useEffect(() => {
    setIsLoading(true);

    const books = getBooks();
    const categories = getCategories();

    // Find the book by ID
    const book = books.find((b) => b.id === parseInt(id));

    if (book) {
      const category = categories.find((c) => c.id === book.categoryId);

      // Format book data for display
      const formattedBook = {
        id: book.id,
        title: book.title,
        author: book.author,
        description: book.description,
        price: book.price,
        originalPrice: book.price * 1.3, // Simulate discount
        rating: 4.5, // Default rating
        reviewCount: Math.floor(Math.random() * 1000) + 100, // Random reviews
        category: category ? category.name : "Uncategorized",
        categoryId: book.categoryId,
        pages: Math.floor(Math.random() * 400) + 100, // Random pages
        publishedYear: 2000 + Math.floor(Math.random() * 24), // Random year
        publisher: "Sample Publisher",
        isbn: `978${Math.floor(Math.random() * 1000000000)
          .toString()
          .padStart(9, "0")}`,
        image:
          book.imageUrl ||
          `https://via.placeholder.com/400x500/3498db/ffffff?text=${book.title.substring(0, 20)}`,
        stock: book.stock,
        isBestseller: Math.random() > 0.7,
        isNewRelease: Math.random() > 0.5,
        createdAt: book.createdAt,
      };

      setBookData(formattedBook);

      // Get related books (same category)
      const related = books
        .filter((b) => b.id !== book.id && b.categoryId === book.categoryId)
        .slice(0, 4)
        .map((b) => {
          const cat = categories.find((c) => c.id === b.categoryId);
          return {
            id: b.id,
            title: b.title,
            author: b.author,
            price: b.price,
            rating: 4.5,
            image:
              b.imageUrl ||
              `https://via.placeholder.com/150x200/3498db/ffffff?text=${b.title.substring(0, 5)}`,
            category: cat?.name || "Uncategorized",
          };
        });

      // If not enough related books, add some samples
      if (related.length < 4) {
        const sampleBooks = getSampleRelatedBooks();
        setRelatedBooks([
          ...related,
          ...sampleBooks.slice(0, 4 - related.length),
        ]);
      } else {
        setRelatedBooks(related);
      }
    } else {
      // If book not found, use sample data
      setBookData(getSampleBookData());
      setRelatedBooks(getSampleRelatedBooks());
    }

    setIsLoading(false);

    // Check if book is in wishlist (simulated)
    const storedWishlist = localStorage.getItem("wishlist") || "[]";
    const wishlist = JSON.parse(storedWishlist);
    setIsInWishlist(wishlist.includes(parseInt(id)));
  }, [id, mockDB, getBooks, getCategories]);

  // Sample data fallbacks
  const getSampleBookData = () => {
    return {
      id: parseInt(id),
      title: "Sample Book",
      author: "Sample Author",
      price: 12.99,
      originalPrice: 19.99,
      rating: 4.5,
      reviewCount: 1284,
      category: "Fiction",
      pages: 218,
      publishedYear: 1925,
      publisher: "Sample Publisher",
      isbn: "9780743273565",
      image:
        "https://via.placeholder.com/400x500/3498db/ffffff?text=Sample+Book",
      shortDescription: "A sample book description for testing purposes.",
      longDescription: `This is a sample book description. In a real application, this would be fetched from the database. The description would provide detailed information about the book's content, themes, and author's style.\n\nSample text continues here to show how multiple paragraphs would be displayed. This helps users understand what the book is about before making a purchase decision.`,
      stock: 15,
      isBestseller: true,
      isNewRelease: false,
    };
  };

  const getSampleRelatedBooks = () => {
    return [
      {
        id: 2,
        title: "Sample Related Book 1",
        author: "Author One",
        price: 14.99,
        rating: 4.8,
        image:
          "https://via.placeholder.com/150x200/2ecc71/ffffff?text=Related1",
        category: "Fiction",
      },
      {
        id: 3,
        title: "Sample Related Book 2",
        author: "Author Two",
        price: 10.99,
        rating: 4.7,
        image:
          "https://via.placeholder.com/150x200/9b59b6/ffffff?text=Related2",
        category: "Fiction",
      },
      {
        id: 4,
        title: "Sample Related Book 3",
        author: "Author Three",
        price: 9.99,
        rating: 4.6,
        image:
          "https://via.placeholder.com/150x200/e74c3c/ffffff?text=Related3",
        category: "Fiction",
      },
      {
        id: 5,
        title: "Sample Related Book 4",
        author: "Author Four",
        price: 11.99,
        rating: 4.4,
        image:
          "https://via.placeholder.com/150x200/f39c12/ffffff?text=Related4",
        category: "Fiction",
      },
    ];
  };

  // Quantity handlers
  const increaseQuantity = () => {
    if (bookData && quantity < bookData.stock) {
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
    if (bookData && value >= 1 && value <= bookData.stock) {
      setQuantity(value);
    }
  };

  // Add to cart handler - REAL IMPLEMENTATION
  const handleAddToCart = async () => {
    if (!user) {
      if (
        window.confirm(
          "You need to login to add items to cart. Go to login page?",
        )
      ) {
        navigate("/login", { state: { from: `/book/${id}` } });
      }
      return;
    }

    if (!bookData || bookData.stock === 0) {
      alert("This book is out of stock!");
      return;
    }

    setIsAddingToCart(true);

    try {
      await addToCart(bookData.id, quantity);
      alert(`Added ${quantity} copy(ies) of "${bookData.title}" to cart!`);
    } catch (error) {
      console.error("Error adding to cart:", error);
      alert(`Failed to add to cart: ${error.message}`);
    } finally {
      setIsAddingToCart(false);
    }
  };

  // Add to wishlist handler
  const handleAddToWishlist = () => {
    const storedWishlist = localStorage.getItem("wishlist") || "[]";
    const wishlist = JSON.parse(storedWishlist);

    if (isInWishlist) {
      const updatedWishlist = wishlist.filter(
        (bookId) => bookId !== parseInt(id),
      );
      localStorage.setItem("wishlist", JSON.stringify(updatedWishlist));
      setIsInWishlist(false);
      alert(`Removed "${bookData?.title}" from wishlist`);
    } else {
      wishlist.push(parseInt(id));
      localStorage.setItem("wishlist", JSON.stringify(wishlist));
      setIsInWishlist(true);
      alert(`Added "${bookData?.title}" to wishlist`);
    }
  };

  // Share book
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: bookData?.title || "Book",
        text: `Check out "${bookData?.title}" by ${bookData?.author}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Share link copied to clipboard!");
    }
  };

  // Buy Now handler
  const handleBuyNow = async () => {
    if (!user) {
      if (
        window.confirm("You need to login to purchase items. Go to login page?")
      ) {
        navigate("/login", { state: { from: `/book/${id}` } });
      }
      return;
    }

    if (!bookData || bookData.stock === 0) {
      alert("This book is out of stock!");
      return;
    }

    setIsAddingToCart(true);

    try {
      await addToCart(bookData.id, quantity);
      navigate("/cart");
    } catch (error) {
      console.error("Error adding to cart:", error);
      alert(`Failed to add to cart: ${error.message}`);
    } finally {
      setIsAddingToCart(false);
    }
  };

  // Render stars for rating
  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    return (
      <>
        {"★".repeat(fullStars)}
        {hasHalfStar && "½"}
        {"☆".repeat(5 - fullStars - (hasHalfStar ? 1 : 0))}
      </>
    );
  };

  if (isLoading) {
    return (
      <div className="book-details-page">
        <div className="container">
          <div className="loading-book">
            <div className="spinner-large"></div>
            <p>Loading book details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!bookData) {
    return (
      <div className="book-details-page">
        <div className="container">
          <div className="book-not-found">
            <h2>Book Not Found</h2>
            <p>The book you're looking for doesn't exist.</p>
            <Link to="/categories" className="btn btn-primary">
              Browse Books
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="book-details-page">
      {/* Breadcrumb */}
      <div className="breadcrumb">
        <div className="container">
          <Link to="/">Home</Link> &gt;
          <Link to="/categories">Categories</Link> &gt;
          <Link to={`/categories?category=${bookData.category.toLowerCase()}`}>
            {bookData.category}
          </Link>{" "}
          &gt;
          <span>{bookData.title}</span>
        </div>
      </div>

      <div className="container book-details-container">
        {/* Main Book Details */}
        <div className="book-details-main">
          {/* Book Image */}
          <div className="book-image-section">
            <div className="book-image-container">
              <img
                src={bookData.image}
                alt={bookData.title}
                className="book-main-image"
              />
              {bookData.isBestseller && (
                <div className="book-badge bestseller">Bestseller</div>
              )}
              {bookData.isNewRelease && (
                <div className="book-badge new-release">New Release</div>
              )}
            </div>

            {/* Share and Wishlist Buttons */}
            <div className="book-actions">
              <button
                className={`action-btn wishlist-btn ${isInWishlist ? "active" : ""}`}
                onClick={handleAddToWishlist}
                disabled={!user}
              >
                {isInWishlist ? "❤️ In Wishlist" : "🤍 Add to Wishlist"}
              </button>
              <button className="action-btn share-btn" onClick={handleShare}>
                🔗 Share
              </button>
            </div>
          </div>

          {/* Book Info */}
          <div className="book-info-section">
            <div className="book-header">
              <h1 className="book-title">{bookData.title}</h1>
              <h2 className="book-author">by {bookData.author}</h2>

              <div className="book-rating-review">
                <div className="stars">
                  {renderStars(bookData.rating)}
                  <span className="rating-number">{bookData.rating}</span>
                </div>
                <span className="review-count">
                  ({bookData.reviewCount} reviews)
                </span>
                <button
                  className="view-reviews"
                  onClick={() => setActiveTab("reviews")}
                >
                  View all reviews
                </button>
              </div>
            </div>

            {/* Book Metadata */}
            <div className="book-metadata">
              <div className="metadata-item">
                <span className="metadata-label">Category:</span>
                <Link
                  to={`/categories?category=${bookData.category.toLowerCase()}`}
                  className="metadata-value"
                >
                  {bookData.category}
                </Link>
              </div>
              <div className="metadata-item">
                <span className="metadata-label">Publisher:</span>
                <span className="metadata-value">{bookData.publisher}</span>
              </div>
              <div className="metadata-item">
                <span className="metadata-label">Published:</span>
                <span className="metadata-value">{bookData.publishedYear}</span>
              </div>
              <div className="metadata-item">
                <span className="metadata-label">Pages:</span>
                <span className="metadata-value">{bookData.pages}</span>
              </div>
              <div className="metadata-item">
                <span className="metadata-label">ISBN:</span>
                <span className="metadata-value">{bookData.isbn}</span>
              </div>
              {bookData.createdAt && (
                <div className="metadata-item">
                  <span className="metadata-label">Added to Store:</span>
                  <span className="metadata-value">
                    {new Date(bookData.createdAt).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>

            {/* Price Section */}
            <div className="book-price-section">
              <div className="price-current">${bookData.price.toFixed(2)}</div>
              {bookData.originalPrice && (
                <div className="price-original">
                  ${bookData.originalPrice.toFixed(2)}
                </div>
              )}
              {bookData.originalPrice && (
                <div className="discount-badge">
                  Save{" "}
                  {Math.round(
                    (1 - bookData.price / bookData.originalPrice) * 100,
                  )}
                  %
                </div>
              )}
            </div>

            {/* Short Description */}
            <div className="book-short-description">
              <p>{bookData.description || bookData.shortDescription}</p>
            </div>

            {/* Stock Status */}
            <div className="stock-status">
              {bookData.stock > 10 ? (
                <span className="in-stock">
                  🟢 In Stock ({bookData.stock} available)
                </span>
              ) : bookData.stock > 0 ? (
                <span className="low-stock">
                  🟡 Only {bookData.stock} left in stock
                </span>
              ) : (
                <span className="out-of-stock">🔴 Out of Stock</span>
              )}
              {!user && <span className="login-note">(Login to purchase)</span>}
            </div>

            {/* Quantity and Add to Cart */}
            <div className="purchase-section">
              <div className="quantity-selector">
                <label htmlFor="quantity">Quantity:</label>
                <div className="quantity-controls">
                  <button
                    className="quantity-btn minus"
                    onClick={decreaseQuantity}
                    disabled={quantity <= 1 || bookData.stock === 0}
                  >
                    −
                  </button>
                  <input
                    type="number"
                    id="quantity"
                    min="1"
                    max={bookData.stock}
                    value={quantity}
                    onChange={handleQuantityChange}
                    className="quantity-input"
                    disabled={bookData.stock === 0}
                  />
                  <button
                    className="quantity-btn plus"
                    onClick={increaseQuantity}
                    disabled={
                      quantity >= bookData.stock || bookData.stock === 0
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
                  disabled={bookData.stock === 0 || isAddingToCart || !user}
                >
                  {isAddingToCart ? (
                    <>
                      <span className="spinner-small"></span>
                      Adding...
                    </>
                  ) : (
                    `🛒 Add to Cart ($${(bookData.price * quantity).toFixed(2)})`
                  )}
                </button>
                <button
                  className="btn buy-now-btn"
                  onClick={handleBuyNow}
                  disabled={bookData.stock === 0 || isAddingToCart || !user}
                >
                  ⚡ Buy Now
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
            </div>
          </div>
        </div>

        {/* Tabs for Description/Details/Reviews */}
        <div className="book-tabs-section">
          <div className="tabs-header">
            <button
              className={`tab-btn ${activeTab === "description" ? "active" : ""}`}
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
              Reviews ({bookData.reviewCount})
            </button>
          </div>

          <div className="tabs-content">
            {activeTab === "description" && (
              <div className="tab-panel description-panel">
                <h3>About This Book</h3>
                <div className="description-content">
                  {bookData.longDescription ? (
                    bookData.longDescription
                      .split("\n\n")
                      .map((paragraph, index) => <p key={index}>{paragraph}</p>)
                  ) : (
                    <p>{bookData.description}</p>
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
                      <td>{bookData.title}</td>
                    </tr>
                    <tr>
                      <th>Author</th>
                      <td>{bookData.author}</td>
                    </tr>
                    <tr>
                      <th>Publisher</th>
                      <td>{bookData.publisher}</td>
                    </tr>
                    <tr>
                      <th>Publication Year</th>
                      <td>{bookData.publishedYear}</td>
                    </tr>
                    <tr>
                      <th>Pages</th>
                      <td>{bookData.pages}</td>
                    </tr>
                    <tr>
                      <th>ISBN</th>
                      <td>{bookData.isbn}</td>
                    </tr>
                    <tr>
                      <th>Category</th>
                      <td>{bookData.category}</td>
                    </tr>
                    <tr>
                      <th>Stock Available</th>
                      <td>{bookData.stock} units</td>
                    </tr>
                    <tr>
                      <th>Price</th>
                      <td>${bookData.price.toFixed(2)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === "reviews" && (
              <div className="tab-panel reviews-panel">
                <h3>Customer Reviews</h3>
                <div className="review-summary">
                  <div className="average-rating">
                    <div className="average-number">{bookData.rating}</div>
                    <div className="average-stars">
                      {renderStars(bookData.rating)}
                    </div>
                    <div className="average-count">
                      {bookData.reviewCount} reviews
                    </div>
                  </div>
                  <div className="rating-breakdown">
                    <div className="rating-bar">
                      <span>5 stars</span>
                      <div className="bar-container">
                        <div className="bar" style={{ width: "65%" }}></div>
                      </div>
                      <span>65%</span>
                    </div>
                    <div className="rating-bar">
                      <span>4 stars</span>
                      <div className="bar-container">
                        <div className="bar" style={{ width: "25%" }}></div>
                      </div>
                      <span>25%</span>
                    </div>
                    <div className="rating-bar">
                      <span>3 stars</span>
                      <div className="bar-container">
                        <div className="bar" style={{ width: "7%" }}></div>
                      </div>
                      <span>7%</span>
                    </div>
                    <div className="rating-bar">
                      <span>2 stars</span>
                      <div className="bar-container">
                        <div className="bar" style={{ width: "2%" }}></div>
                      </div>
                      <span>2%</span>
                    </div>
                    <div className="rating-bar">
                      <span>1 star</span>
                      <div className="bar-container">
                        <div className="bar" style={{ width: "1%" }}></div>
                      </div>
                      <span>1%</span>
                    </div>
                  </div>
                </div>

                {/* Sample Reviews */}
                <div className="sample-reviews">
                  <h4>Top Reviews</h4>
                  <div className="review-card">
                    <div className="review-header">
                      <div className="reviewer">John D.</div>
                      <div className="review-rating">★★★★★</div>
                      <div className="review-date">January 15, 2024</div>
                    </div>
                    <div className="review-title">Excellent read!</div>
                    <div className="review-content">
                      This book is a wonderful addition to our collection.
                      Highly recommended for all readers!
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Related Books Section */}
        <div className="related-books-section">
          <h2 className="section-title">You May Also Like</h2>
          <div className="related-books-grid">
            {relatedBooks.map((book) => (
              <Link
                to={`/book/${book.id}`}
                key={book.id}
                className="related-book-card"
              >
                <div className="related-book-image">
                  <img src={book.image} alt={book.title} />
                </div>
                <div className="related-book-info">
                  <h3 className="related-book-title">{book.title}</h3>
                  <p className="related-book-author">{book.author}</p>
                  <div className="related-book-rating">
                    {renderStars(book.rating)} ({book.rating})
                  </div>
                  <div className="related-book-price">
                    ${book.price.toFixed(2)}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookDetails;
