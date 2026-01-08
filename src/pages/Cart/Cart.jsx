import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../../hooks/useCart";
import { useAuth } from "../../context/AuthContext";
import "./Cart.css";

const Cart = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    cartItems,
    loading,
    error,
    updateQuantity,
    removeItem,
    clearCart,
    moveToWishlist,
    calculateTotals,
    itemCount,
  } = useCart();

  const { subtotal, tax, shipping, total } = calculateTotals();

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
        process.env.REACT_APP_API_URL || "http://localhost:5001"
      }${imagePath}`;
    }

    return imagePath;
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

  // Remove item from cart
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

  // Clear entire cart
  const handleClearCart = async () => {
    if (window.confirm("Are you sure you want to clear your entire cart?")) {
      const result = await clearCart();
      if (result.success) {
        alert("Cart cleared successfully");
      }
    }
  };

  // Move item to wishlist
  const handleMoveToWishlist = async (itemId, itemTitle) => {
    const result = await moveToWishlist(itemId);
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

    if (!user) {
      alert("Please login to proceed to checkout");
      navigate("/login");
      return;
    }

    navigate("/checkout");
  };

  // Continue shopping
  const continueShopping = () => {
    navigate("/categories");
  };

  // Save cart for later (placeholder - implement later)
  const saveForLater = (itemId, itemTitle) => {
    alert(`Saved "${itemTitle}" for later (Feature coming soon)`);
  };

  // Show login required state
  if (!user) {
    return (
      <div className="cart-page">
        <div className="container">
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
            <p>{error}</p>
            <button onClick={() => window.location.reload()}>
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
        {/* Page Header */}
        <div className="cart-header">
          <h1 className="cart-title">Your Shopping Cart</h1>
          <p className="cart-subtitle">
            {itemCount} {itemCount === 1 ? "item" : "items"} in your cart
          </p>
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
                Total: <span className="highlight">{itemCount} items</span>
              </div>
            </div>

            {/* Empty Cart State */}
            {cartItems.length === 0 ? (
              <div className="empty-cart">
                <div className="empty-cart-icon">🛒</div>
                <h2 className="empty-cart-title">Your cart is empty</h2>
                <p className="empty-cart-message">
                  Looks like you haven't added any books to your cart yet.
                </p>
                <button
                  className="btn btn-primary btn-large"
                  onClick={continueShopping}
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              <>
                {/* Cart Items List */}
                <div className="cart-items-list">
                  {cartItems.map((item) => {
                    const book = item.book || {};
                    const stock = book.stock || 10;
                    const itemTotal = (book.price || 0) * (item.quantity || 1);

                    return (
                      <div key={item.id} className="cart-item">
                        <div className="cart-item-image">
                          <Link to={`/book/${book.id}`}>
                            <img
                              src={getImageUrl(
                                book.imageUrl || book.coverImage
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
                              disabled={loading}
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
                              disabled={loading}
                            >
                              💾 Save for later
                            </button>
                            <button
                              className="action-btn"
                              onClick={() =>
                                handleMoveToWishlist(item.id, book.title)
                              }
                              disabled={loading}
                            >
                              ❤️ Move to wishlist
                            </button>
                          </div>
                        </div>

                        <div className="cart-item-quantity">
                          <div className="quantity-control">
                            <button
                              className="quantity-btn minus"
                              onClick={() =>
                                handleDecreaseQuantity(item.id, item.quantity)
                              }
                              disabled={item.quantity <= 1 || loading}
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
                              disabled={loading}
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
                              disabled={item.quantity >= stock || loading}
                            >
                              +
                            </button>
                          </div>
                          <div className="quantity-limit">Max: {stock}</div>
                        </div>

                        <div className="cart-item-price">
                          <div className="price-current">
                            ${itemTotal.toFixed(2)}
                          </div>
                          <div className="price-per-unit">
                            ${(book.price || 0).toFixed(2)} each
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Cart Summary */}
                <div className="cart-summary">
                  <div className="summary-row">
                    <span className="summary-label">
                      Subtotal ({itemCount} items):
                    </span>
                    <span className="summary-value">
                      ${subtotal.toFixed(2)}
                    </span>
                  </div>
                  <div className="summary-row">
                    <span className="summary-label">Estimated Tax (8%):</span>
                    <span className="summary-value">${tax.toFixed(2)}</span>
                  </div>
                  <div className="summary-row">
                    <span className="summary-label">Shipping:</span>
                    <span
                      className={`summary-value ${
                        shipping === 0 ? "free-shipping" : ""
                      }`}
                    >
                      {shipping === 0 ? "FREE" : `$${shipping.toFixed(2)}`}
                    </span>
                  </div>
                  <div className="summary-row shipping-note">
                    {shipping === 0 ? (
                      <span>🎉 You've qualified for free shipping!</span>
                    ) : (
                      <span>
                        Add ${(30 - subtotal).toFixed(2)} more to get FREE
                        shipping
                      </span>
                    )}
                  </div>
                  <div className="summary-divider"></div>
                  <div className="summary-row total">
                    <span className="summary-label">Total:</span>
                    <span className="summary-value total-amount">
                      ${total.toFixed(2)}
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
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="detail-row">
                    <span>Tax:</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                  <div className="detail-row">
                    <span>Shipping:</span>
                    <span className={shipping === 0 ? "free" : ""}>
                      {shipping === 0 ? "FREE" : `$${shipping.toFixed(2)}`}
                    </span>
                  </div>
                  <div className="detail-divider"></div>
                  <div className="detail-row total">
                    <span>Total:</span>
                    <span className="total-amount">${total.toFixed(2)}</span>
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

                {/* Payment Methods */}
                <div className="payment-methods">
                  <p className="payment-title">We accept:</p>
                  <div className="payment-icons">
                    <span className="payment-icon">💳</span>
                    <span className="payment-icon">📱</span>
                    <span className="payment-icon">🏦</span>
                    <span className="payment-icon">🔗</span>
                  </div>
                </div>

                {/* Security Info */}
                <div className="security-info">
                  <div className="security-item">
                    <span className="security-icon">🔒</span>
                    <span>Secure SSL Encryption</span>
                  </div>
                  <div className="security-item">
                    <span className="security-icon">🛡️</span>
                    <span>30-Day Return Policy</span>
                  </div>
                </div>
              </div>

              {/* Promo Code Section */}
              <div className="promo-card">
                <h4 className="promo-title">Have a promo code?</h4>
                <div className="promo-input-group">
                  <input
                    type="text"
                    placeholder="Enter promo code"
                    className="promo-input"
                    disabled={loading}
                  />
                  <button className="promo-btn" disabled={loading}>
                    Apply
                  </button>
                </div>
                <p className="promo-note">Free shipping on orders over $30</p>
              </div>

              {/* Need Help Section */}
              <div className="help-card">
                <h4 className="help-title">Need help?</h4>
                <p className="help-text">
                  Our customer support team is here to help!
                </p>
                <div className="help-contacts">
                  <button className="help-btn" disabled={loading}>
                    📞 Call Us
                  </button>
                  <button className="help-btn" disabled={loading}>
                    💬 Live Chat
                  </button>
                  <button className="help-btn" disabled={loading}>
                    ✉️ Email
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Recently Viewed (Placeholder) */}
        {cartItems.length > 0 && (
          <div className="recently-viewed">
            <h3 className="recently-title">Recently Viewed</h3>
            <p className="recently-note">
              You might be interested in these books you recently viewed...
            </p>
            {/* In real app, this would show actual recently viewed items */}
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
