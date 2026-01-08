import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useApi } from "../../hooks/useApi";
import { useAuth } from "../../context/AuthContext";
import "./Login.css";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";
  const message = location.state?.message;

  const { user, login, register } = useAuth();
  const { post, loading: apiLoading, error: apiError, clearError } = useApi();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    address: "",
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);
  const [authMessage, setAuthMessage] = useState(message || "");
  const [backendMessage, setBackendMessage] = useState("");

  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      navigate(from, { replace: true });
    }
  }, [user, navigate, from]);

  // Check for remembered email
  useEffect(() => {
    const rememberedEmail = localStorage.getItem("rememberedEmail");
    if (rememberedEmail) {
      setFormData((prev) => ({ ...prev, email: rememberedEmail }));
      setRememberMe(true);
    }
  }, []);

  // Clear messages when switching modes
  useEffect(() => {
    setErrors({});
    setAuthMessage("");
    setBackendMessage("");
  }, [isNewUser]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Clear field-specific error
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }

    // Clear general errors
    if (errors.general) {
      setErrors({
        ...errors,
        general: "",
      });
    }

    setAuthMessage("");
    setBackendMessage("");
  };

  const validateForm = () => {
    const newErrors = {};

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    // Registration validations
    if (isNewUser) {
      if (!formData.name.trim()) {
        newErrors.name = "Name is required";
      }

      if (!formData.phone.trim()) {
        newErrors.phone = "Phone number is required";
      }

      if (!formData.address.trim()) {
        newErrors.address = "Address is required";
      }

      if (!formData.confirmPassword) {
        newErrors.confirmPassword = "Please confirm your password";
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
      }
    }

    return newErrors;
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);
    setErrors({});
    setAuthMessage("");
    setBackendMessage("");

    try {
      const result = await login({
        email: formData.email,
        password: formData.password,
      });

      if (result.success) {
        // Remember email if checked
        if (rememberMe) {
          localStorage.setItem("rememberedEmail", formData.email);
        } else {
          localStorage.removeItem("rememberedEmail");
        }

        setAuthMessage(`Welcome back, ${result.data.user.name}!`);

        // Small delay to show success message
        setTimeout(() => {
          // Redirect based on user role or from location
          if (result.data.user.role === "admin") {
            navigate("/admin", { replace: true });
          } else {
            navigate(from, { replace: true });
          }
        }, 1000);
      } else {
        setErrors({
          general:
            result.error || "Login failed. Please check your credentials.",
        });
      }
    } catch (err) {
      setErrors({
        general: "Network error. Please check your connection.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);
    setErrors({});
    setAuthMessage("");
    setBackendMessage("");

    try {
      const result = await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        address: formData.address,
      });

      if (result.success) {
        setAuthMessage(
          `Account created successfully! Welcome ${formData.name}`
        );

        // Auto-login after successful registration
        setTimeout(async () => {
          const loginResult = await login({
            email: formData.email,
            password: formData.password,
          });

          if (loginResult.success) {
            navigate(from, { replace: true });
          }
        }, 1500);
      } else {
        setErrors({
          general: result.error || "Registration failed. Please try again.",
        });
      }
    } catch (err) {
      setErrors({
        general: "Network error. Please check your connection.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e) => {
    if (isNewUser) {
      handleRegister(e);
    } else {
      handleLogin(e);
    }
  };

  const toggleAuthMode = () => {
    setIsNewUser(!isNewUser);
    setFormData({
      name: "",
      email: formData.email, // Keep email when switching
      password: "",
      confirmPassword: "",
      phone: "",
      address: "",
    });
    setErrors({});
    setAuthMessage("");
    setBackendMessage("");
  };

  // Quick login with test credentials
  const handleQuickAdmin = async () => {
    setFormData({
      name: "",
      email: "sebrinm9@gmail.com",
      password: "Sebrina@123",
      confirmPassword: "",
      phone: "",
      address: "",
    });
    setIsNewUser(false);
    setErrors({});
    setAuthMessage("");
    setBackendMessage("");

    // Auto-submit after setting credentials
    setTimeout(() => {
      const fakeEvent = { preventDefault: () => {} };
      handleLogin(fakeEvent);
    }, 100);
  };

  const handleQuickUser = async () => {
    setFormData({
      name: "",
      email: "customer@example.com",
      password: "Customer@123",
      confirmPassword: "",
      phone: "",
      address: "",
    });
    setIsNewUser(false);
    setErrors({});
    setAuthMessage("");
    setBackendMessage("");

    // Auto-submit after setting credentials
    setTimeout(() => {
      const fakeEvent = { preventDefault: () => {} };
      handleLogin(fakeEvent);
    }, 100);
  };

  const handleNewUser = () => {
    setFormData({
      name: "",
      email: formData.email, // Keep email
      password: "",
      confirmPassword: "",
      phone: "",
      address: "",
    });
    setIsNewUser(true);
    setErrors({});
    setAuthMessage("Please fill in your details to create a new account.");
    setBackendMessage("");
  };

  // Test backend connection
  const testBackendConnection = async () => {
    try {
      setBackendMessage("Testing backend connection...");
      const response = await post(
        "/auth/login",
        {
          email: "test@test.com",
          password: "test123",
        },
        { skipAuth: true }
      );

      if (response) {
        setBackendMessage("✓ Backend connection successful!");
      }
    } catch (error) {
      setBackendMessage(`✗ Backend error: ${error.message}`);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        {/* Left Side - Welcome Message */}
        <div className="login-left">
          <div className="welcome-content">
            <div className="logo">
              <h1>Readify</h1>
              <p className="tagline">Your Online Bookstore</p>
            </div>
            <div className="welcome-message">
              <h2>{isNewUser ? "Create Account" : "Welcome Back!"}</h2>
              <p>
                {isNewUser
                  ? "Join our community of book lovers. Create an account to get started."
                  : "Sign in to access your personalized book recommendations, track your orders, and continue your reading journey."}
              </p>
            </div>
            <div className="features">
              <div className="feature-item">
                <span className="feature-icon">📚</span>
                <span>Access thousands of books</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">🛒</span>
                <span>Manage your shopping cart</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">📦</span>
                <span>Track your orders</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">⭐</span>
                <span>Write and read reviews</span>
              </div>
            </div>

            {/* Backend Connection Info */}
            <div className="backend-info">
              <p className="backend-title">Backend Status:</p>
              <div className="backend-status">
                <button
                  onClick={testBackendConnection}
                  className="backend-test-btn"
                  disabled={apiLoading}
                >
                  {apiLoading ? "Testing..." : "Test Connection"}
                </button>
                {backendMessage && (
                  <p
                    className={`backend-message ${
                      backendMessage.includes("✓") ? "success" : "error"
                    }`}
                  >
                    {backendMessage}
                  </p>
                )}
              </div>
            </div>

            {/* TEST CREDENTIALS */}
            <div className="test-credentials">
              <p className="test-title">Test Credentials (from backend):</p>
              <div className="credential-box">
                <div className="credential-item">
                  <strong>Admin:</strong>
                  <div>Email: sebrinm9@gmail.com</div>
                  <div>Password: Sebrina@123</div>
                </div>
                <div className="credential-item">
                  <strong>Customer:</strong>
                  <div>Email: customer@example.com</div>
                  <div>Password: Customer@123</div>
                </div>
              </div>
            </div>

            <div className="auth-mode-info">
              <p className="info-title">
                {isNewUser ? "Already have an account?" : "New to Readify?"}
              </p>
              <button onClick={toggleAuthMode} className="mode-toggle-button">
                {isNewUser ? "Sign In Here" : "Create Account Here"}
              </button>
            </div>
          </div>
        </div>

        {/* Right Side - Auth Form */}
        <div className="login-right">
          <div className="login-form-container">
            <div className="form-header">
              <h2 className="form-title">
                {isNewUser ? "Create Your Account" : "Sign In to Your Account"}
              </h2>
              <p className="form-subtitle">
                {isNewUser
                  ? "Fill in your details to get started"
                  : "Enter your credentials to access your account"}
              </p>
            </div>

            {/* Success Message */}
            {authMessage && !errors.general && (
              <div className="alert alert-success">
                <div className="alert-icon">✅</div>
                <div className="alert-content">
                  <p>{authMessage}</p>
                </div>
              </div>
            )}

            {/* Error Display */}
            {errors.general && (
              <div className="alert alert-error">
                <div className="alert-icon">⚠️</div>
                <div className="alert-content">
                  <strong>Authentication Error</strong>
                  <p>{errors.general}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="login-form">
              {/* Name field for registration */}
              {isNewUser && (
                <div className="form-group">
                  <label htmlFor="name" className="form-label">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`form-input ${errors.name ? "error" : ""}`}
                    placeholder="Enter your full name"
                    disabled={isLoading}
                    required
                  />
                  {errors.name && (
                    <span className="error-message">{errors.name}</span>
                  )}
                </div>
              )}

              {/* Email field (always shown) */}
              <div className="form-group">
                <label htmlFor="email" className="form-label">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`form-input ${errors.email ? "error" : ""}`}
                  placeholder="Enter your email"
                  disabled={isLoading}
                  autoComplete="email"
                  required
                />
                {errors.email && (
                  <span className="error-message">{errors.email}</span>
                )}
              </div>

              {/* Phone field for registration */}
              {isNewUser && (
                <div className="form-group">
                  <label htmlFor="phone" className="form-label">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className={`form-input ${errors.phone ? "error" : ""}`}
                    placeholder="Enter your phone number"
                    disabled={isLoading}
                    required
                  />
                  {errors.phone && (
                    <span className="error-message">{errors.phone}</span>
                  )}
                </div>
              )}

              {/* Address field for registration */}
              {isNewUser && (
                <div className="form-group">
                  <label htmlFor="address" className="form-label">
                    Address
                  </label>
                  <textarea
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className={`form-input ${errors.address ? "error" : ""}`}
                    placeholder="Enter your address"
                    disabled={isLoading}
                    rows="3"
                    required
                  />
                  {errors.address && (
                    <span className="error-message">{errors.address}</span>
                  )}
                </div>
              )}

              {/* Password field */}
              <div className="form-group">
                <label htmlFor="password" className="form-label">
                  Password
                </label>
                <div className="password-input-wrapper">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`form-input ${errors.password ? "error" : ""}`}
                    placeholder={
                      isNewUser ? "Create a password" : "Enter your password"
                    }
                    disabled={isLoading}
                    autoComplete={
                      isNewUser ? "new-password" : "current-password"
                    }
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                  >
                    {showPassword ? "🙈" : "👁️"}
                  </button>
                </div>
                {errors.password && (
                  <span className="error-message">{errors.password}</span>
                )}
              </div>

              {/* Confirm Password field for registration */}
              {isNewUser && (
                <div className="form-group">
                  <label htmlFor="confirmPassword" className="form-label">
                    Confirm Password
                  </label>
                  <div className="password-input-wrapper">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className={`form-input ${
                        errors.confirmPassword ? "error" : ""
                      }`}
                      placeholder="Confirm your password"
                      disabled={isLoading}
                      autoComplete="new-password"
                      required
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      disabled={isLoading}
                    >
                      {showConfirmPassword ? "🙈" : "👁️"}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <span className="error-message">
                      {errors.confirmPassword}
                    </span>
                  )}
                </div>
              )}

              {/* Login options */}
              {!isNewUser && (
                <div className="form-options">
                  <div className="remember-me">
                    <input
                      type="checkbox"
                      id="rememberMe"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      disabled={isLoading}
                    />
                    <label htmlFor="rememberMe">Remember me</label>
                  </div>
                  <Link to="/forgot-password" className="forgot-password">
                    Forgot password?
                  </Link>
                </div>
              )}

              {/* Submit button */}
              <button
                type="submit"
                className="login-button"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="spinner"></span>
                    {isNewUser ? "Creating Account..." : "Signing In..."}
                  </>
                ) : isNewUser ? (
                  "Create Account"
                ) : (
                  "Sign In"
                )}
              </button>

              {/* Quick Actions */}
              <div className="quick-actions">
                <p className="quick-title">Quick Actions:</p>
                <div className="quick-buttons">
                  <button
                    type="button"
                    className="quick-button admin-button"
                    onClick={handleQuickAdmin}
                    disabled={isLoading}
                  >
                    Admin Login
                  </button>
                  <button
                    type="button"
                    className="quick-button user-button"
                    onClick={handleQuickUser}
                    disabled={isLoading}
                  >
                    Customer Login
                  </button>
                  <button
                    type="button"
                    className="quick-button new-button"
                    onClick={handleNewUser}
                    disabled={isLoading}
                  >
                    New User
                  </button>
                </div>
              </div>

              {/* Service Info */}
              <div className="service-info">
                <p className="service-title">Connected Services:</p>
                <div className="service-badges">
                  <span className="service-badge">🔐 Auth API</span>
                  <span className="service-badge">📚 Books API</span>
                  <span className="service-badge">🛒 Cart API</span>
                  <span className="service-badge">📦 Orders API</span>
                </div>
              </div>

              {/* Divider */}
              <div className="divider">
                <span>Or continue with</span>
              </div>

              {/* Social Login (Placeholder) */}
              <div className="social-login">
                <button
                  type="button"
                  className="social-button google-button"
                  disabled={isLoading}
                >
                  <span className="social-icon">G</span>
                  Continue with Google
                </button>
                <button
                  type="button"
                  className="social-button facebook-button"
                  disabled={isLoading}
                >
                  <span className="social-icon">f</span>
                  Continue with Facebook
                </button>
              </div>

              {/* Terms Agreement */}
              <div className="terms-agreement">
                {isNewUser && (
                  <p className="terms-text">
                    By creating an account, you agree to our{" "}
                    <Link to="/terms">Terms of Service</Link> and{" "}
                    <Link to="/privacy">Privacy Policy</Link>
                  </p>
                )}
                {!isNewUser && (
                  <p className="terms-text">
                    By signing in, you agree to our{" "}
                    <Link to="/terms">Terms of Service</Link> and{" "}
                    <Link to="/privacy">Privacy Policy</Link>
                  </p>
                )}
              </div>

              {/* Debug Section - Remove in production */}
              {process.env.NODE_ENV === "development" && (
                <div className="debug-section">
                  <button
                    type="button"
                    onClick={() => {
                      console.log("Current form data:", formData);
                      console.log("Auth Context:", { user });
                      console.log("LocalStorage:", {
                        token: localStorage.getItem("token"),
                        user: localStorage.getItem("user"),
                        rememberedEmail:
                          localStorage.getItem("rememberedEmail"),
                      });
                    }}
                    className="debug-button"
                  >
                    Debug Info
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
