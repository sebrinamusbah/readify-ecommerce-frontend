import axios from "axios";

// ✅ CORRECT for Vite - use VITE_ prefix
const API_BASE_URL =
    import.meta.env.VITE_API_URL;

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
    timeout: 10000,
});

// Request interceptor
API.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Request interceptor
API.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Response interceptor
API.interceptors.response.use(
    (response) => {
        return response.data;
    },
    (error) => {
        if (error.response ?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }

        // Return consistent error format
        return Promise.reject({
            error: error.response ?.data ?.error || error.response ?.data ?.message || 'Something went wrong',
            message: error.response ?.data ?.message || error.message,
            status: error.response ?.status
        });
    }
);

// AUTH SERVICES
export const registerUser = (userData) => API.post('/auth/register', userData);
export const loginUser = (credentials) => API.post('/auth/login', credentials);
export const getProfile = () => API.get('/auth/profile');

// BOOK SERVICES
export const getAllBooks = (params = {}) => API.get('/books', { params });
export const getBookById = (id) => API.get(`/books/${id}`);
export const searchBooks = (query) => API.get('/books', { params: { search: query } });
export const getBooksByCategory = (categoryId) => API.get(`/books?category=${categoryId}`);

// CATEGORY SERVICES
export const getAllCategories = () => API.get('/categories');

// CART SERVICES
export const getCart = () => API.get('/cart');
export const addToCart = (bookId, quantity = 1) =>
    API.post('/cart/add', { bookId, quantity });
export const updateCartItem = (cartItemId, quantity) =>
    API.put(`/cart/${cartItemId}`, { quantity });
export const removeFromCart = (cartItemId) => API.delete(`/cart/${cartItemId}`);
export const clearCart = () => API.delete('/cart/clear');

// ORDER SERVICES
export const createOrder = (orderData) => API.post('/orders', orderData);
export const getOrders = () => API.get('/orders');
export const getOrderById = (orderId) => API.get(`/orders/${orderId}`);

// PAYMENT SERVICES
export const createPayment = (orderId, paymentData) =>
    API.post(`/payments/${orderId}`, paymentData);

// REVIEW SERVICES
export const getBookReviews = (bookId) => API.get(`/reviews/book/${bookId}`);
export const addReview = (bookId, reviewData) =>
    API.post(`/reviews/${bookId}`, reviewData);

// TEST CONNECTION
export const testConnection = () => API.get('/health');

export default API;