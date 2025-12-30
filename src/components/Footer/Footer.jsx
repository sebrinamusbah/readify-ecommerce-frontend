import React from "react";
import { Link } from "react-router-dom";
import "./Footer.css";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-container">
        {/* Top Section */}
        <div className="footer-top">
          <div className="footer-brand">
            <div className="footer-logo">📚</div>
            <h2 className="brand-name">BookStore</h2>
            <p className="brand-tagline">Your online bookshop</p>
            <p className="brand-description">
              Discover your next favorite book from our extensive collection of
              fiction, non-fiction, and academic titles.
            </p>
          </div>

          {/* Quick Links */}
          <div className="footer-section">
            <h3 className="footer-title">Quick Links</h3>
            <ul className="footer-links">
              <li>
                <Link to="/">Home</Link>
              </li>
              <li>
                <Link to="/categories">Browse Categories</Link>
              </li>
              <li>
                <Link to="/categories?filter=new">New Arrivals</Link>
              </li>
              <li>
                <Link to="/categories?filter=bestseller">Bestsellers</Link>
              </li>
              <li>
                <Link to="/categories?filter=discount">On Sale</Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div className="footer-section">
            <h3 className="footer-title">Customer Service</h3>
            <ul className="footer-links">
              <li>
                <Link to="/faq">FAQ</Link>
              </li>
              <li>
                <Link to="/shipping">Shipping Info</Link>
              </li>
              <li>
                <Link to="/returns">Returns & Refunds</Link>
              </li>
              <li>
                <Link to="/contact">Contact Us</Link>
              </li>
              <li>
                <Link to="/privacy">Privacy Policy</Link>
              </li>
              <li>
                <Link to="/terms">Terms of Service</Link>
              </li>
            </ul>
          </div>

          {/* Follow Us & Newsletter */}
          <div className="footer-section">
            <h3 className="footer-title">Follow Us</h3>
            <div className="social-links">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="social-link facebook"
                aria-label="Facebook"
              >
                <span className="social-icon">📘</span>
                <span className="social-text">Facebook</span>
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="social-link twitter"
                aria-label="Twitter"
              >
                <span className="social-icon">🐦</span>
                <span className="social-text">Twitter</span>
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="social-link instagram"
                aria-label="Instagram"
              >
                <span className="social-icon">📸</span>
                <span className="social-text">Instagram</span>
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="social-link linkedin"
                aria-label="LinkedIn"
              >
                <span className="social-icon">💼</span>
                <span className="social-text">LinkedIn</span>
              </a>
              <a
                href="https://t.me"
                target="_blank"
                rel="noopener noreferrer"
                className="social-link telegram"
                aria-label="Telegram"
              >
                <span className="social-icon">📨</span>
                <span className="social-text">Telegram</span>
              </a>
            </div>

            {/* Newsletter Subscription */}
            <div className="newsletter">
              <h4 className="newsletter-title">Stay Updated</h4>
              <p className="newsletter-text">
                Subscribe to our newsletter for the latest books and promotions.
              </p>
              <form className="newsletter-form">
                <input
                  type="email"
                  placeholder="Your email address"
                  className="newsletter-input"
                  aria-label="Email for newsletter"
                />
                <button type="submit" className="newsletter-btn">
                  Subscribe
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Middle Section - Additional Info */}
        <div className="footer-middle">
          <div className="info-cards">
            <div className="info-card">
              <span className="info-icon">🚚</span>
              <div className="info-content">
                <h4>Free Shipping</h4>
                <p>On orders over $30</p>
              </div>
            </div>
            <div className="info-card">
              <span className="info-icon">↩️</span>
              <div className="info-content">
                <h4>Easy Returns</h4>
                <p>30-day return policy</p>
              </div>
            </div>
            <div className="info-card">
              <span className="info-icon">🔒</span>
              <div className="info-content">
                <h4>Secure Payment</h4>
                <p>100% secure checkout</p>
              </div>
            </div>
            <div className="info-card">
              <span className="info-icon">📞</span>
              <div className="info-content">
                <h4>24/7 Support</h4>
                <p>Customer service</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="footer-bottom">
          <div className="payment-methods">
            <span className="payment-title">We accept:</span>
            <div className="payment-icons">
              <span className="payment-icon" aria-label="Visa">
                💳
              </span>
              <span className="payment-icon" aria-label="Mastercard">
                🏦
              </span>
              <span className="payment-icon" aria-label="PayPal">
                🔵
              </span>
              <span className="payment-icon" aria-label="Apple Pay">
                
              </span>
              <span className="payment-icon" aria-label="Google Pay">
                G
              </span>
              <span className="payment-icon" aria-label="Cryptocurrency">
                ₿
              </span>
            </div>
          </div>

          <div className="copyright">
            <p>© {currentYear} BookStore. All Rights Reserved.</p>
            <p className="copyright-links">
              <Link to="/privacy">Privacy Policy</Link> |
              <Link to="/terms"> Terms of Service</Link> |
              <Link to="/cookies"> Cookie Policy</Link>
            </p>
          </div>

          <div className="back-to-top">
            <button
              className="back-to-top-btn"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              aria-label="Scroll back to top"
            >
              ↑ Back to Top
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
