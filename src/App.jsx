// In src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar/Navbar";
import Home from "./pages/Home/Home";
import Categories from "./pages/Categories/Categories"; // Import actual Categories component

// Keep other temporary components for now
const Cart = () => (
  <div style={{ padding: "20px" }}>
    <h1>Cart Page</h1>
  </div>
);
const Login = () => (
  <div style={{ padding: "20px" }}>
    <h1>Login Page</h1>
  </div>
);
const Register = () => (
  <div style={{ padding: "20px" }}>
    <h1>Register Page</h1>
  </div>
);
const BookDetails = () => (
  <div style={{ padding: "20px" }}>
    <h1>Book Details Page</h1>
  </div>
);

function App() {
  return (
    <Router>
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/categories" element={<Categories />} />{" "}
          {/* Use actual Categories */}
          <Route path="/book/:id" element={<BookDetails />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </main>
    </Router>
  );
}

export default App;
