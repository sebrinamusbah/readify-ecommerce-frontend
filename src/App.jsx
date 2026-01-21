import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom"; // Added Navigate import
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home/Home";
import Categories from "./pages/Categories/Categories";
import BookDetails from "./pages/BookDetails/BookDetails";
import Cart from "./pages/Cart/Cart";
import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";
import Dashboard from "./pages/Admin/Dashboard";
import ManageBooks from "./pages/Admin/ManageBooks";
import Navbar from "./components/Navbar/Navbar";
import Footer from "./components/Footer/Footer";
import "./App.css";

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app">
          <Navbar />
          <div className="main-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/categories" element={<Categories />} />
              <Route path="/book/:id" element={<BookDetails />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Admin Routes */}
              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedRoute requireAdmin>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/manage-books"
                element={
                  <ProtectedRoute requireAdmin>
                    <ManageBooks />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/orders"
                element={
                  <ProtectedRoute requireAdmin>
                    <h1>Orders Page (Coming Soon)</h1>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/users"
                element={
                  <ProtectedRoute requireAdmin>
                    <h1>Users Page (Coming Soon)</h1>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/reports"
                element={
                  <ProtectedRoute requireAdmin>
                    <h1>Reports Page (Coming Soon)</h1>
                  </ProtectedRoute>
                }
              />

              {/* Redirect /admin to /admin/dashboard */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute requireAdmin>
                    <Navigate to="/admin/dashboard" replace />
                  </ProtectedRoute>
                }
              />

              {/* 404 Page - Catch all */}
              <Route path="*" element={<h1>404 - Page Not Found</h1>} />
            </Routes>
          </div>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
