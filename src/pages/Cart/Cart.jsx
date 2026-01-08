import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useApi } from "../../hooks/useApi";
import { useAuth } from "../../context/AuthContext";
import "./Cart.css";

const Cart = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { get, post, put, del, loading, error } = useApi();

  const [cartItems, setCartItems] = useState([]);
  const [cartData, setCartData] = useState({
    items: [],
    totalItems: 0,
    totalPrice: 0,
    shipping: 0,
    tax: 0,
    subtotal: 0,
  });

  const [updatingItem, setUpdatingItem] = useState(null);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);

  // Tax rate (8%)
  const TAX_RATE = 0.08;
  // Free shipping threshold
  const FREE_SHIPPING_THRESHOLD = 30;
  // Shipping cost
  const SHIPPING_COST = 5.99;

  // Fetch cart data
  const fetchCart = async () => {
    if (!isAuthenticated) return;

    try {
      const response = await get("/cart");
      if (response) {
        const items = response.items || [];
        const subtotal = items.reduce((sum, item) => {
          const price = item.book?.price || 0;
          const quantity = item.quantity || 1;
          return sum + price * quantity;
        }, 0);

        const tax = subtotal * TAX_RATE;
        const shipping =
          subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
        const total = subtotal + tax + shipping;

        setCartItems(items);
        setCartData({
          items: items,
          totalItems: response.totalItems || items.length,
          totalPrice: total,
          shipping: shipping,
          tax: tax,
          subtotal: subtotal,
        });
      }
    } catch (error) {
      console.log("Could not fetch cart:", error.message);
    }
  };

  // Load cart on component mount
  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    }
  }, [isAuthenticated]);

  // Helper to get image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) {
      return "https://via.placeholder.com/100x130/cccccc/333333?text=No+Image";
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

  // Update item quantity
  const updateQuantity = async (itemId, quantity) => {
    if (!isAuthenticated) {
      setShowAuthPrompt(true);
      return;
    }

    setUpdatingItem(itemId);
    try {
      await put(`/cart/update/${itemId}`, { quantity });
      await fetchCart();
    } catch (error) {
      alert(
        `Failed to update quantity: ${
          error.response?.data?.error || error.message
        }`
      );
    } finally {
      setUpdatingItem(null);
    }
  };

  // Remove item from cart
  const removeItem = async (itemId) => {
    if (!isAuthenticated) {
      setShowAuthPrompt(true);
      return;
    }

    try {
      await del(`/cart/remove/${itemId}`);
      await fetchCart();
      return { success: true };
    } catch (error) {
      alert(
        `Failed to remove item: ${error.response?.data?.error || error.message}`
      );
      return { success: false };
    }
  };

  // Clear entire cart
  const clearCart = async () => {
    if (!isAuthenticated) {
      setShowAuthPrompt(true);
      return;
    }

    try {
      await del("/cart/clear");
      setCartItems([]);
      setCartData({
        items: [],
        totalItems: 0,
        totalPrice: 0,
        shipping: 0,
        tax: 0,
        subtotal: 0,
      });
      return { success: true };
    } catch (error) {
      alert(
        `Failed to clear cart: ${error.response?.data?.error || error.message}`
      );
      return { success: false };
    }
  };

  // Move item to wishlist (placeholder - implement if you have wishlist)
  const moveToWishlist = async (itemId, bookTitle) => {
    if (!isAuthenticated) {
      setShowAuthPrompt(true);
      return;
    }

    try {
      // Save for later - you can implement wishlist API later
      const book = cartItems.find((item) => item.id === itemId)?.book;
      if (book) {
        // Remove from cart first
        await removeItem(itemId);
        alert(`"${bookTitle}" saved for wishlist (coming soon!)`);
      }
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Quantity handlers
  const handleIncreaseQuantity = async (itemId, currentQuantity, stock) => {
    if (currentQuantity < stock) {
      await updateQuantity(itemId, currentQuantity + 1);
    }
  };

  const handleDecreaseQuantity = async (itemId, currentQuantity) => {
    if (currentQuantity > 1) {
      await updateQuantity(itemId, currentQuantity - 1);
    }
  };

  const handleUpdateQuantity = async (itemId, newQuantity, stock) => {
    const quantity = Math.max(1, Math.min(newQuantity, stock));
    await updateQuantity(itemId, quantity);
  };

  // Handle remove item
  const handleRemoveItem = async (itemId, itemTitle) => {
    if (
      window.confirm(
        `Are you sure you want to remove "${itemTitle}" from your cart?`
      )
    ) {
      const result = await removeItem(itemId);
      if (result.success) {
        alert(`Removed "${itemTitle}" from cart`);
      }
    }
  };

  // Handle clear cart
  const handleClearCart = async () => {
    if (window.confirm("Are you sure you want to clear your entire cart?")) {
      const result = await clearCart();
      if (result.success) {
        alert("Cart cleared successfully");
      }
    }
  };

  // Handle move to wishlist
  const handleMoveToWishlist = async (itemId, itemTitle) => {
    const result = await moveToWishlist(itemId, itemTitle);
    if (result.success) {
      alert(`Moved "${itemTitle}" to your wishlist`);
    }
  };

  // Proceed to checkout
  const proceedToCheckout = () => {
    if (cartItems.length === 0) {
      alert("Your cart is empty. Add some books first!");
      return;
    }

    if (!isAuthenticated) {
      setShowAuthPrompt(true);
      return;
    }

    navigate("/checkout");
  };

  // Continue shopping
  const continueShopping = () => {
    navigate("/categories");
  };

  // Save cart for later
  const saveForLater = (itemId, itemTitle) => {
    alert(`Saved "${itemTitle}" for later (Feature coming soon)`);
  };

  // Show login required state
  if (!isAuthenticated) {
    return (
      <div className="cart-page">
        <div className="container">
          {/* Auth Prompt Modal */}
          {showAuthPrompt && (
            <div className="auth-prompt-modal">
              <div className="auth-prompt-content">
                <h3>Login Required</h3>
                <p>Please login to manage your cart</p>
                <div className="auth-prompt-buttons">
                  <Link
                    to="/login"
                    state={{ redirectTo: "/cart" }}
                    className="btn btn-primary"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    state={{ redirectTo: "/cart" }}
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

          <div className="login-required">
            <div className="login-icon">🔒</div>
            <h2>Login Required</h2>
            <p>Please login to view your cart and checkout</p>
            <div className="login-actions">
              <Link to="/login" className="btn btn-primary">
                Login to Your Account
              </Link>
              <Link to="/register" className="btn btn-secondary">
                Create New Account
              </Link>
            </div>
            <p className="login-note">
              Don't have an account? Sign up to save your cart and access order
              history.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Loading state
  if (loading && cartItems.length === 0) {
    return (
      <div className="cart-page">
        <div className="container">
          <div className="cart-loading">
            <div className="loading-spinner"></div>
            <p>Loading your cart...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error && cartItems.length === 0) {
    return (
      <div className="cart-page">
        <div className="container">
          <div className="cart-error">
            <h2>Error Loading Cart</h2>
            <p>{error.message || error}</p>
            <button onClick={fetchCart} className="btn btn-primary">
              Retry Loading Cart
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="container">
        {/* Auth Prompt Modal */}
        {showAuthPrompt && (
          <div className="auth-prompt-modal">
            <div className="auth-prompt-content">
              <h3>Login Required</h3>
              <p>Please login to manage your cart</p>
              <div className="auth-prompt-buttons">
                <Link
                  to="/login"
                  state={{ redirectTo: "/cart" }}
                  className="btn btn-primary"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  state={{ redirectTo: "/cart" }}
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

        {/* Page Header */}
        <div className="cart-header">
          <h1 className="cart-title">Your Shopping Cart</h1>
          <p className="cart-subtitle">
            {cartData.totalItems} {cartData.totalItems === 1 ? "item" : "items"}{" "}
            in your cart
          </p>

          {/* Cart Stats */}
          <div className="cart-stats">
            <div className="cart-stat">
              <span className="stat-label">Items:</span>
              <span className="stat-value">{cartData.totalItems}</span>
            </div>
            <div className="cart-stat">
              <span className="stat-label">Subtotal:</span>
              <span className="stat-value">
                ${cartData.subtotal.toFixed(2)}
              </span>
            </div>
            <div className="cart-stat">
              <span className="stat-label">Shipping:</span>
              <span
                className={`stat-value ${
                  cartData.shipping === 0 ? "free" : ""
                }`}
              >
                {cartData.shipping === 0
                  ? "FREE"
                  : `$${cartData.shipping.toFixed(2)}`}
              </span>
            </div>
            <div className="cart-stat total">
              <span className="stat-label">Total:</span>
              <span className="stat-value">
                ${cartData.totalPrice.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        <div className="cart-layout">
          {/* Cart Items Section */}
          <div className="cart-items-section">
            {/* Cart Actions Bar */}
            <div className="cart-actions-bar">
              <button
                className="clear-cart-btn"
                onClick={handleClearCart}
                disabled={cartItems.length === 0 || loading}
              >
                {loading ? "Clearing..." : "🗑️ Clear Cart"}
              </button>
              <div className="cart-total-items">
                Total:{" "}
                <span className="highlight">{cartData.totalItems} items</span>
              </div>
              {cartData.subtotal < FREE_SHIPPING_THRESHOLD && (
                <div className="free-shipping-notice">
                  Add $
                  {(FREE_SHIPPING_THRESHOLD - cartData.subtotal).toFixed(2)}{" "}
                  more for FREE shipping!
                </div>
              )}
            </div>

            {/* Empty Cart State */}
            {cartItems.length === 0 ? (
              <div className="empty-cart">
                <div className="empty-cart-icon">🛒</div>
                <h2 className="empty-cart-title">Your cart is empty</h2>
                <p className="empty-cart-message">
                  Looks like you haven't added any books to your cart yet.
                </p>
                <div className="empty-cart-actions">
                  <button
                    className="btn btn-primary btn-large"
                    onClick={continueShopping}
                  >
                    Browse Books
                  </button>
                  <Link to="/orders" className="btn btn-secondary btn-large">
                    View Your Orders
                  </Link>
                </div>
              </div>
            ) : (
              <>
                {/* Cart Items List */}
                <div className="cart-items-list">
                  {cartItems.map((item) => {
                    const book = item.book || {};
                    const stock = book.stock || 10;
                    const itemTotal = (book.price || 0) * (item.quantity || 1);
                    const isUpdating = updatingItem === item.id;

                    return (
                      <div
                        key={item.id}
                        className={`cart-item ${isUpdating ? "updating" : ""}`}
                      >
                        <div className="cart-item-image">
                          <Link to={`/book/${book.id}`}>
                            <img
                              src={getImageUrl(
                                book.coverImage || book.imageUrl
                              )}
                              alt={book.title}
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = `https://via.placeholder.com/100x130/3498db/ffffff?text=${encodeURIComponent(
                                  book.title?.substring(0, 10) || "Book"
                                )}`;
                              }}
                            />
                          </Link>
                        </div>

                        <div className="cart-item-details">
                          <div className="item-header">
                            <Link
                              to={`/book/${book.id}`}
                              className="item-title"
                            >
                              {book.title || "Unknown Book"}
                            </Link>
                            <button
                              className="remove-item-btn"
                              onClick={() =>
                                handleRemoveItem(item.id, book.title)
                              }
                              title="Remove item"
                              disabled={loading || isUpdating}
                            >
                              ✕
                            </button>
                          </div>

                          <p className="item-author">
                            by {book.author || "Unknown Author"}
                          </p>

                          {book.category && (
                            <div className="item-category">
                              Category:
                              <Link
                                to={`/categories?category=${
                                  book.category.slug ||
                                  book.category.name?.toLowerCase()
                                }`}
                              >
                                {book.category.name}
                              </Link>
                            </div>
                          )}

                          <div className="item-stock">
                            {item.quantity >= stock ? (
                              <span className="stock-warning">
                                Only {stock} left in stock!
                              </span>
                            ) : (
                              <span className="stock-ok">In Stock</span>
                            )}
                          </div>

                          <div className="item-actions">
                            <button
                              className="action-btn"
                              onClick={() => saveForLater(item.id, book.title)}
                              disabled={loading || isUpdating}
                            >
                              💾 Save for later
                            </button>
                            <button
                              className="action-btn"
                              onClick={() =>
                                handleMoveToWishlist(item.id, book.title)
                              }
                              disabled={loading || isUpdating}
                            >
                              ❤️ Move to wishlist
                            </button>
                          </div>
                        </div>

                        <div className="cart-item-quantity">
                          {isUpdating ? (
                            <div className="updating-spinner"></div>
                          ) : (
                            <>
                              <div className="quantity-control">
                                <button
                                  className="quantity-btn minus"
                                  onClick={() =>
                                    handleDecreaseQuantity(
                                      item.id,
                                      item.quantity
                                    )
                                  }
                                  disabled={
                                    item.quantity <= 1 || loading || isUpdating
                                  }
                                >
                                  −
                                </button>
                                <input
                                  type="number"
                                  min="1"
                                  max={stock}
                                  value={item.quantity}
                                  onChange={(e) =>
                                    handleUpdateQuantity(
                                      item.id,
                                      parseInt(e.target.value) || 1,
                                      stock
                                    )
                                  }
                                  className="quantity-input"
                                  disabled={loading || isUpdating}
                                />
                                <button
                                  className="quantity-btn plus"
                                  onClick={() =>
                                    handleIncreaseQuantity(
                                      item.id,
                                      item.quantity,
                                      stock
                                    )
                                  }
                                  disabled={
                                    item.quantity >= stock ||
                                    loading ||
                                    isUpdating
                                  }
                                >
                                  +
                                </button>
                              </div>
                              <div className="quantity-limit">Max: {stock}</div>
                            </>
                          )}
                        </div>

                        <div className="cart-item-price">
                          <div className="price-current">
                            ${itemTotal.toFixed(2)}
                          </div>
                          <div className="price-per-unit">
                            ${(book.price || 0).toFixed(2)} each
                          </div>
                          {isUpdating && (
                            <div className="updating-indicator">
                              Updating...
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Cart Summary */}
                <div className="cart-summary">
                  <div className="summary-row">
                    <span className="summary-label">
                      Subtotal ({cartData.totalItems} items):
                    </span>
                    <span className="summary-value">
                      ${cartData.subtotal.toFixed(2)}
                    </span>
                  </div>
                  <div className="summary-row">
                    <span className="summary-label">
                      Estimated Tax ({TAX_RATE * 100}%):
                    </span>
                    <span className="summary-value">
                      ${cartData.tax.toFixed(2)}
                    </span>
                  </div>
                  <div className="summary-row">
                    <span className="summary-label">Shipping:</span>
                    <span
                      className={`summary-value ${
                        cartData.shipping === 0 ? "free-shipping" : ""
                      }`}
                    >
                      {cartData.shipping === 0
                        ? "FREE"
                        : `$${cartData.shipping.toFixed(2)}`}
                    </span>
                  </div>
                  <div className="summary-row shipping-note">
                    {cartData.shipping === 0 ? (
                      <span>🎉 You've qualified for free shipping!</span>
                    ) : (
                      <span>
                        Add $
                        {(FREE_SHIPPING_THRESHOLD - cartData.subtotal).toFixed(
                          2
                        )}{" "}
                        more to get FREE shipping
                      </span>
                    )}
                  </div>
                  <div className="summary-divider"></div>
                  <div className="summary-row total">
                    <span className="summary-label">Total:</span>
                    <span className="summary-value total-amount">
                      ${cartData.totalPrice.toFixed(2)}
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Order Summary Sidebar */}
          {cartItems.length > 0 && (
            <div className="order-summary-sidebar">
              <div className="summary-card">
                <h3 className="summary-title">Order Summary</h3>

                <div className="summary-details">
                  <div className="detail-row">
                    <span>Subtotal:</span>
                    <span>${cartData.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="detail-row">
                    <span>Tax:</span>
                    <span>${cartData.tax.toFixed(2)}</span>
                  </div>
                  <div className="detail-row">
                    <span>Shipping:</span>
                    <span className={cartData.shipping === 0 ? "free" : ""}>
                      {cartData.shipping === 0
                        ? "FREE"
                        : `$${cartData.shipping.toFixed(2)}`}
                    </span>
                  </div>
                  <div className="detail-divider"></div>
                  <div className="detail-row total">
                    <span>Total:</span>
                    <span className="total-amount">
                      ${cartData.totalPrice.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="checkout-actions">
                  <button
                    className="btn btn-primary checkout-btn"
                    onClick={proceedToCheckout}
                    disabled={loading}
                  >
                    {loading ? "Processing..." : "🛒 Proceed to Checkout"}
                  </button>

                  <button
                    className="btn btn-secondary continue-btn"
                    onClick={continueShopping}
                    disabled={loading}
                  >
                    ← Continue Shopping
                  </button>
                </div>

                {/* Order Features */}
                <div className="order-features">
                  <div className="feature">
                    <span className="feature-icon">🚚</span>
                    <span className="feature-text">
                      Free shipping on orders over $30
                    </span>
                  </div>
                  <div className="feature">
                    <span className="feature-icon">↩️</span>
                    <span className="feature-text">30-Day Return Policy</span>
                  </div>
                  <div className="feature">
                    <span className="feature-icon">🔒</span>
                    <span className="feature-text">Secure Payment</span>
                  </div>
                </div>
              </div>

              {/* Quick Order Actions */}
              <div className="quick-actions-card">
                <h4 className="quick-actions-title">Quick Actions</h4>
                <div className="quick-actions-buttons">
                  <Link to="/orders" className="quick-action-btn">
                    <span className="action-icon">📦</span>
                    View Orders
                  </Link>
                  <Link to="/profile" className="quick-action-btn">
                    <span className="action-icon">👤</span>
                    My Profile
                  </Link>
                  <button
                    onClick={async () => {
                      try {
                        // Create a quick order with current cart
                        const orderData = {
                          items: cartItems.map((item) => ({
                            bookId: item.book.id,
                            quantity: item.quantity,
                          })),
                          shippingAddress: user.address || "Default address",
                          paymentMethod: "card",
                        };

                        const orderResult = await post("/orders", orderData);
                        if (orderResult.success) {
                          await clearCart();
                          navigate(`/orders/${orderResult.order?.id}`);
                        }
                      } catch (error) {
                        alert("Failed to create quick order");
                      }
                    }}
                    className="quick-action-btn quick-order"
                    disabled={loading}
                  >
                    <span className="action-icon">⚡</span>
                    Quick Order
                  </button>
                </div>
              </div>

              {/* Need Help Section */}
              <div className="help-card">
                <h4 className="help-title">Need help?</h4>
                <p className="help-text">
                  Questions about your order or need assistance?
                </p>
                <div className="help-contacts">
                  <Link to="/contact" className="help-link">
                    📧 Contact Support
                  </Link>
                  <Link to="/faq" className="help-link">
                    ❓ FAQ
                  </Link>
                  <Link to="/shipping" className="help-link">
                    🚚 Shipping Info
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Cart Tips */}
        {cartItems.length > 0 && (
          <div className="cart-tips">
            <h3 className="tips-title">Shopping Tips</h3>
            <div className="tips-grid">
              <div className="tip-card">
                <div className="tip-icon">🎁</div>
                <h4 className="tip-title">Free Shipping</h4>
                <p className="tip-text">
                  Orders over $30 qualify for free shipping
                </p>
              </div>
              <div className="tip-card">
                <div className="tip-icon">🔒</div>
                <h4 className="tip-title">Secure Checkout</h4>
                <p className="tip-text">
                  Your payment information is protected
                </p>
              </div>
              <div className="tip-card">
                <div className="tip-icon">↩️</div>
                <h4 className="tip-title">Easy Returns</h4>
                <p className="tip-text">30-day return policy on all items</p>
              </div>
              <div className="tip-card">
                <div className="tip-icon">📦</div>
                <h4 className="tip-title">Fast Delivery</h4>
                <p className="tip-text">Most orders ship within 24 hours</p>
              </div>
            </div>
          </div>
        )}

        {/* Database Info */}
        {cartItems.length > 0 && (
          <div className="cart-database-info">
            <div className="db-info">
              <span className="db-icon">📊</span>
              <div className="db-details">
                <p>Connected to backend services:</p>
                <div className="db-stats">
                  <span>🛒 Cart API</span>
                  <span>•</span>
                  <span>📦 Orders API</span>
                  <span>•</span>
                  <span>🔐 Auth API</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
