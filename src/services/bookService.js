import api from "./api";

export const bookService = {
  // Get all books
  getAllBooks: (params = {}) => api.get("/books", { params }),

  // Get single book
  getBookById: (id) => api.get(`/books/${id}`),

  // Get books by category
  getBooksByCategory: (categoryId) => api.get(`/books/category/${categoryId}`),

  // Search books
  searchBooks: (query) => api.get(`/books/search?q=${query}`),

  // Admin: Create book
  createBook: (bookData) => api.post("/admin/books", bookData),

  // Admin: Update book
  updateBook: (id, bookData) => api.put(`/admin/books/${id}`, bookData),

  // Admin: Delete book
  deleteBook: (id) => api.delete(`/admin/books/${id}`),
};
