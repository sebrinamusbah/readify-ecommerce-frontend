import api from "./api";

export const cartService = {
  // Get cart items
  getCart: () => api.get("/cart"),

  // Add to cart
  addToCart: (bookId, quantity = 1) =>
    api.post("/cart/add", { bookId, quantity }),

  // Update cart item quantity
  updateCartItem: (cartItemId, quantity) =>
    api.put(`/cart/${cartItemId}`, { quantity }),

  // Remove from cart
  removeFromCart: (cartItemId) => api.delete(`/cart/${cartItemId}`),

  // Clear cart
  clearCart: () => api.delete("/cart/clear"),
};
