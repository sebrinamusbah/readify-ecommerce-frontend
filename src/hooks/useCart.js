import { useState, useCallback, useEffect } from "react";
import { cartService } from "../services";
import { useAuth } from "../context/AuthContext";

export const useCart = () => {
    const { user } = useAuth();
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Fetch cart items
    const fetchCart = useCallback(async() => {
        if (!user) {
            setCartItems([]);
            return;
        }

        try {
            setLoading(true);
            setError(null);
            const result = await cartService.getCart();
            if (result.success) {
                setCartItems(result.data || []);
            }
        } catch (err) {
            setError(err.error || "Failed to fetch cart");
        } finally {
            setLoading(false);
        }
    }, [user]);

    // Add item to cart
    const addToCart = useCallback(
        async(bookId, quantity = 1) => {
            try {
                setLoading(true);
                const result = await cartService.addToCart(bookId, quantity);
                if (result.success) {
                    await fetchCart(); // Refresh cart
                }
                return result;
            } catch (err) {
                return { success: false, error: err.error };
            } finally {
                setLoading(false);
            }
        }, [fetchCart]
    );

    // Update quantity
    const updateQuantity = useCallback(
        async(itemId, quantity) => {
            try {
                setLoading(true);
                const result = await cartService.updateCartItem(itemId, quantity);
                if (result.success) {
                    await fetchCart(); // Refresh cart
                }
                return result;
            } catch (err) {
                return { success: false, error: err.error };
            } finally {
                setLoading(false);
            }
        }, [fetchCart]
    );

    // Remove item
    const removeItem = useCallback(
        async(itemId) => {
            try {
                setLoading(true);
                const result = await cartService.removeFromCart(itemId);
                if (result.success) {
                    await fetchCart(); // Refresh cart
                }
                return result;
            } catch (err) {
                return { success: false, error: err.error };
            } finally {
                setLoading(false);
            }
        }, [fetchCart]
    );

    // Clear cart
    const clearCart = useCallback(async() => {
        try {
            setLoading(true);
            const result = await cartService.clearCart();
            if (result.success) {
                setCartItems([]);
            }
            return result;
        } catch (err) {
            return { success: false, error: err.error };
        } finally {
            setLoading(false);
        }
    }, []);

    // Move to wishlist
    const moveToWishlist = useCallback(
        async(itemId) => {
            try {
                setLoading(true);
                const result = await cartService.moveToWishlist(itemId);
                if (result.success) {
                    await fetchCart(); // Refresh cart
                }
                return result;
            } catch (err) {
                return { success: false, error: err.error };
            } finally {
                setLoading(false);
            }
        }, [fetchCart]
    );

    // Calculate totals
    const calculateTotals = useCallback(() => {
        const subtotal = cartItems.reduce(
            (total, item) => total + (item.book ? .price || 0) * (item.quantity || 1),
            0
        );
        const tax = subtotal * 0.08; // 8% tax
        const shipping = subtotal > 30 ? 0 : 5.99;
        const total = subtotal + tax + shipping;

        return { subtotal, tax, shipping, total };
    }, [cartItems]);

    // Fetch cart on mount and when user changes
    useEffect(() => {
        fetchCart();
    }, [fetchCart]);

    return {
        cartItems,
        loading,
        error,
        fetchCart,
        addToCart,
        updateQuantity,
        removeItem,
        clearCart,
        moveToWishlist,
        calculateTotals,
        itemCount: cartItems.reduce(
            (count, item) => count + (item.quantity || 1),
            0
        ),
    };
};