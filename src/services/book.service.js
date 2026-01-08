import api from "./api";

const bookService = {
    getAllBooks: async(params = {}) => {
        try {
            const response = await api.get("/books", { params });
            return response.data;
        } catch (error) {
            console.error("Books fetch error:", error);
            throw (
                error.response ?.data || {
                    success: false,
                    error: "Failed to fetch books",
                    details: error.message,
                }
            );
        }
    },

    getBookById: async(id) => {
        try {
            const response = await api.get(`/books/${id}`);
            return response.data;
        } catch (error) {
            throw (
                error.response ?.data || {
                    success: false,
                    error: "Failed to fetch book details",
                }
            );
        }
    },

    getBooksByCategory: async(categorySlug) => {
        try {
            const response = await api.get("/books", {
                params: { category: categorySlug },
            });
            return response.data;
        } catch (error) {
            throw (
                error.response ?.data || {
                    success: false,
                    error: "Failed to fetch books by category",
                }
            );
        }
    },

    searchBooks: async(query) => {
        try {
            const response = await api.get("/books/search", {
                params: { q: query },
            });
            return response.data;
        } catch (error) {
            throw (
                error.response ?.data || {
                    success: false,
                    error: "Failed to search books",
                }
            );
        }
    },
};

export default bookService;