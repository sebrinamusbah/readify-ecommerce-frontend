import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import AdminNavbar from "../../components/Admin/AdminNavbar";
import "./Admin.css";

const ManageBooks = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    user,
    isAdmin,
    mockDB,
    addCategory,
    addBook,
    getCategories,
    getBooks,
  } = useAuth();

  // Get active tab from URL query params
  const queryParams = new URLSearchParams(location.search);
  const activeTab = queryParams.get("tab") || "books";

  const [categories, setCategories] = useState([]);
  const [books, setBooks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Category form state
  const [categoryForm, setCategoryForm] = useState({
    name: "",
    description: "",
  });

  // Book form state
  const [bookForm, setBookForm] = useState({
    title: "",
    author: "",
    description: "",
    price: "",
    categoryId: "",
    stock: "",
    imageUrl: "",
  });

  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");

  // Check if user is admin
  useEffect(() => {
    if (!isAdmin()) {
      navigate("/");
      return;
    }
  }, [isAdmin, navigate]);

  // Load categories and books
  useEffect(() => {
    if (user && isAdmin()) {
      setCategories(getCategories());
      setBooks(getBooks());
    }
  }, [user, mockDB, getCategories, getBooks]);

  // Handle tab change
  const handleTabChange = (tab) => {
    navigate(`/admin/manage-books?tab=${tab}`);
    setErrors({});
    setSuccessMessage("");
  };

  // Validate category form
  const validateCategory = () => {
    const newErrors = {};

    if (!categoryForm.name.trim()) {
      newErrors.categoryName = "Category name is required";
    }

    if (!categoryForm.description.trim()) {
      newErrors.categoryDescription = "Description is required";
    }

    return newErrors;
  };

  // Validate book form
  const validateBook = () => {
    const newErrors = {};

    if (!bookForm.title.trim()) {
      newErrors.title = "Book title is required";
    }

    if (!bookForm.author.trim()) {
      newErrors.author = "Author is required";
    }

    if (!bookForm.description.trim()) {
      newErrors.description = "Description is required";
    }

    if (!bookForm.price || parseFloat(bookForm.price) <= 0) {
      newErrors.price = "Valid price is required";
    }

    if (!bookForm.categoryId) {
      newErrors.categoryId = "Category is required";
    }

    if (!bookForm.stock || parseInt(bookForm.stock) < 0) {
      newErrors.stock = "Valid stock quantity is required";
    }

    return newErrors;
  };

  // Handle category form submission
  const handleAddCategory = (e) => {
    e.preventDefault();

    const validationErrors = validateCategory();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);

    try {
      // Add category using AuthContext function
      const newCategory = addCategory({
        name: categoryForm.name,
        description: categoryForm.description,
      });

      setSuccessMessage(`Category "${newCategory.name}" added successfully!`);

      // Reset form
      setCategoryForm({
        name: "",
        description: "",
      });

      // Update categories list
      setCategories(getCategories());

      // Clear errors
      setErrors({});
    } catch (error) {
      setErrors({ categoryGeneral: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle book form submission
  const handleAddBook = (e) => {
    e.preventDefault();

    // Check if there are any categories first
    if (categories.length === 0) {
      setErrors({
        bookGeneral: "Please add at least one category before adding books.",
      });
      return;
    }

    const validationErrors = validateBook();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);

    try {
      // Add book using AuthContext function
      const newBook = addBook({
        title: bookForm.title,
        author: bookForm.author,
        description: bookForm.description,
        price: parseFloat(bookForm.price),
        categoryId: parseInt(bookForm.categoryId),
        stock: parseInt(bookForm.stock),
        imageUrl:
          bookForm.imageUrl ||
          `https://picsum.photos/200/300?random=${Date.now()}`,
      });

      setSuccessMessage(`Book "${newBook.title}" added successfully!`);

      // Reset form
      setBookForm({
        title: "",
        author: "",
        description: "",
        price: "",
        categoryId: "",
        stock: "",
        imageUrl: "",
      });

      // Update books list
      setBooks(getBooks());

      // Clear errors
      setErrors({});
    } catch (error) {
      setErrors({ bookGeneral: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle form input changes
  const handleCategoryChange = (e) => {
    const { name, value } = e.target;
    setCategoryForm({
      ...categoryForm,
      [name]: value,
    });
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
    if (errors.categoryGeneral) {
      setErrors({ ...errors, categoryGeneral: "" });
    }
  };

  const handleBookChange = (e) => {
    const { name, value } = e.target;
    setBookForm({
      ...bookForm,
      [name]: value,
    });
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
    if (errors.bookGeneral) {
      setErrors({ ...errors, bookGeneral: "" });
    }
  };

  return (
    <div className="admin-page">
      <AdminNavbar />

      <div className="admin-content">
        <div className="manage-books-header">
          <h1 className="page-title">Manage Books & Categories</h1>
          <p className="page-subtitle">
            Add new categories and books to your store
          </p>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="success-message">
            <span className="success-icon">✅</span>
            {successMessage}
            <button
              className="close-success"
              onClick={() => setSuccessMessage("")}
            >
              ×
            </button>
          </div>
        )}

        {/* Tabs */}
        <div className="manage-tabs">
          <button
            className={`tab-btn ${activeTab === "categories" ? "active" : ""}`}
            onClick={() => handleTabChange("categories")}
          >
            🏷️ Categories
          </button>
          <button
            className={`tab-btn ${activeTab === "books" ? "active" : ""}`}
            onClick={() => handleTabChange("books")}
          >
            📚 Books
          </button>
        </div>

        <div className="manage-content">
          {/* Categories Tab */}
          {activeTab === "categories" && (
            <div className="categories-section">
              <div className="section-header">
                <h2>Add New Category</h2>
                <p>Create categories to organize your books</p>
              </div>

              {errors.categoryGeneral && (
                <div className="error-message general-error">
                  ⚠️ {errors.categoryGeneral}
                </div>
              )}

              <form onSubmit={handleAddCategory} className="category-form">
                <div className="form-group">
                  <label htmlFor="categoryName">Category Name *</label>
                  <input
                    type="text"
                    id="categoryName"
                    name="name"
                    value={categoryForm.name}
                    onChange={handleCategoryChange}
                    className={`form-input ${errors.categoryName ? "error" : ""}`}
                    placeholder="e.g., Fiction, Science, Biography"
                    disabled={isLoading}
                  />
                  {errors.categoryName && (
                    <div className="error-message">{errors.categoryName}</div>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="categoryDescription">Description *</label>
                  <textarea
                    id="categoryDescription"
                    name="description"
                    value={categoryForm.description}
                    onChange={handleCategoryChange}
                    className={`form-input ${errors.categoryDescription ? "error" : ""}`}
                    placeholder="Describe this category..."
                    rows="4"
                    disabled={isLoading}
                  />
                  {errors.categoryDescription && (
                    <div className="error-message">
                      {errors.categoryDescription}
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  className="submit-btn"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <span className="spinner"></span>
                      Adding Category...
                    </>
                  ) : (
                    "Add Category"
                  )}
                </button>
              </form>

              {/* Existing Categories */}
              <div className="existing-categories">
                <h3>Existing Categories ({categories.length})</h3>
                {categories.length === 0 ? (
                  <div className="no-data">
                    <div className="no-data-icon">🏷️</div>
                    <p>No categories yet</p>
                    <small>Add your first category above</small>
                  </div>
                ) : (
                  <div className="categories-grid">
                    {categories.map((category) => (
                      <div key={category.id} className="category-card">
                        <div className="category-icon">🏷️</div>
                        <div className="category-content">
                          <h4>{category.name}</h4>
                          <p>{category.description}</p>
                          <div className="category-meta">
                            <span>
                              Books:{" "}
                              {
                                books.filter(
                                  (b) => b.categoryId === category.id,
                                ).length
                              }
                            </span>
                            <span>
                              Added:{" "}
                              {new Date(
                                category.createdAt,
                              ).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Books Tab */}
          {activeTab === "books" && (
            <div className="books-section">
              <div className="section-header">
                <h2>Add New Book</h2>
                <p>Fill in the book details to add it to your store</p>
              </div>

              {errors.bookGeneral && (
                <div className="error-message general-error">
                  ⚠️ {errors.bookGeneral}
                </div>
              )}

              {categories.length === 0 ? (
                <div className="no-categories-warning">
                  <div className="warning-icon">⚠️</div>
                  <h3>No Categories Available</h3>
                  <p>
                    You need to add at least one category before adding books.
                  </p>
                  <button
                    className="btn-primary"
                    onClick={() => handleTabChange("categories")}
                  >
                    Go to Categories
                  </button>
                </div>
              ) : (
                <form onSubmit={handleAddBook} className="book-form">
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="bookTitle">Title *</label>
                      <input
                        type="text"
                        id="bookTitle"
                        name="title"
                        value={bookForm.title}
                        onChange={handleBookChange}
                        className={`form-input ${errors.title ? "error" : ""}`}
                        placeholder="Book title"
                        disabled={isLoading}
                      />
                      {errors.title && (
                        <div className="error-message">{errors.title}</div>
                      )}
                    </div>

                    <div className="form-group">
                      <label htmlFor="bookAuthor">Author *</label>
                      <input
                        type="text"
                        id="bookAuthor"
                        name="author"
                        value={bookForm.author}
                        onChange={handleBookChange}
                        className={`form-input ${errors.author ? "error" : ""}`}
                        placeholder="Author name"
                        disabled={isLoading}
                      />
                      {errors.author && (
                        <div className="error-message">{errors.author}</div>
                      )}
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="bookDescription">Description *</label>
                    <textarea
                      id="bookDescription"
                      name="description"
                      value={bookForm.description}
                      onChange={handleBookChange}
                      className={`form-input ${errors.description ? "error" : ""}`}
                      placeholder="Book description..."
                      rows="3"
                      disabled={isLoading}
                    />
                    {errors.description && (
                      <div className="error-message">{errors.description}</div>
                    )}
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="bookPrice">Price ($) *</label>
                      <input
                        type="number"
                        id="bookPrice"
                        name="price"
                        value={bookForm.price}
                        onChange={handleBookChange}
                        className={`form-input ${errors.price ? "error" : ""}`}
                        placeholder="19.99"
                        step="0.01"
                        min="0"
                        disabled={isLoading}
                      />
                      {errors.price && (
                        <div className="error-message">{errors.price}</div>
                      )}
                    </div>

                    <div className="form-group">
                      <label htmlFor="bookCategory">Category *</label>
                      <select
                        id="bookCategory"
                        name="categoryId"
                        value={bookForm.categoryId}
                        onChange={handleBookChange}
                        className={`form-input ${errors.categoryId ? "error" : ""}`}
                        disabled={isLoading}
                      >
                        <option value="">Select a category</option>
                        {categories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                      {errors.categoryId && (
                        <div className="error-message">{errors.categoryId}</div>
                      )}
                    </div>

                    <div className="form-group">
                      <label htmlFor="bookStock">Stock *</label>
                      <input
                        type="number"
                        id="bookStock"
                        name="stock"
                        value={bookForm.stock}
                        onChange={handleBookChange}
                        className={`form-input ${errors.stock ? "error" : ""}`}
                        placeholder="100"
                        min="0"
                        disabled={isLoading}
                      />
                      {errors.stock && (
                        <div className="error-message">{errors.stock}</div>
                      )}
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="bookImage">
                      Cover Image URL (Optional)
                    </label>
                    <input
                      type="url"
                      id="bookImage"
                      name="imageUrl"
                      value={bookForm.imageUrl}
                      onChange={handleBookChange}
                      className="form-input"
                      placeholder="https://example.com/book-cover.jpg"
                      disabled={isLoading}
                    />
                    <small className="form-hint">
                      Leave empty for a random placeholder image
                    </small>
                  </div>

                  <button
                    type="submit"
                    className="submit-btn"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <span className="spinner"></span>
                        Adding Book...
                      </>
                    ) : (
                      "Add Book"
                    )}
                  </button>
                </form>
              )}

              {/* Existing Books */}
              <div className="existing-books">
                <h3>Existing Books ({books.length})</h3>
                {books.length === 0 ? (
                  <div className="no-data">
                    <div className="no-data-icon">📚</div>
                    <p>No books yet</p>
                    <small>Add your first book above</small>
                  </div>
                ) : (
                  <div className="books-list">
                    {books.map((book) => {
                      const category = categories.find(
                        (c) => c.id === book.categoryId,
                      );
                      return (
                        <div key={book.id} className="book-card">
                          <div className="book-cover">
                            {book.imageUrl ? (
                              <img src={book.imageUrl} alt={book.title} />
                            ) : (
                              <div className="book-cover-placeholder">📚</div>
                            )}
                          </div>
                          <div className="book-details">
                            <h4>{book.title}</h4>
                            <p className="book-author">by {book.author}</p>
                            <p className="book-description">
                              {book.description.substring(0, 100)}...
                            </p>
                            <div className="book-meta">
                              <span className="book-price">
                                ${book.price.toFixed(2)}
                              </span>
                              <span className="book-category">
                                {category?.name || "Uncategorized"}
                              </span>
                              <span className="book-stock">
                                Stock: {book.stock}
                              </span>
                            </div>
                            <div className="book-added">
                              Added:{" "}
                              {new Date(book.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageBooks;
