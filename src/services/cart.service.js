import api from "./api";

const cartService = {
    // Get user's cart items
    getCart: async() => {
        try {
            const response = await api.get("/cart");
            return response.data;
        } catch (error) {
            throw error.response ?.data || { error: "Failed to fetch cart" };
        }
    },

    // Add item to cart
    addToCart: async(bookId, quantity = 1) => {
        try {
            const response = await api.post("/cart", { bookId, quantity });
            return response.data;
        } catch (error) {
            throw error.response ?.data || { error: "Failed to add to cart" };
        }
    },

    // Update cart item quantity
    updateCartItem: async(itemId, quantity) => {
        try {
            const response = await api.put(`/cart/${itemId}`, { quantity });
            return response.data;
        } catch (error) {
            throw error.response ?.data || { error: "Failed to update cart item" };
        }
    },

    // Remove item from cart
    removeFromCart: async(itemId) => {
        try {
            const response = await api.delete(`/cart/${itemId}`);
            return response.data;
        } catch (error) {
            throw error.response ?.data || { error: "Failed to remove from cart" };
        }
    },

    // Clear entire cart
    clearCart: async() => {
        try {
            const response = await api.delete("/cart");
            return response.data;
        } catch (error) {
            throw error.response ?.data || { error: "Failed to clear cart" };
        }
    },

    // Move item to wishlist
    moveToWishlist: async(itemId) => {
        try {
            const response = await api.post(`/cart/${itemId}/move-to-wishlist`);
            return response.data;
        } catch (error) {
            throw error.response ?.data || { error: "Failed to move to wishlist" };
        }
    },

    // Get cart count
    getCartCount: async() => {
        try {
            const response = await api.get("/cart/count");
            return response.data;
        } catch (error) {
            throw error.response ?.data || { error: "Failed to get cart count" };
        }
    },
};

export default cartService;