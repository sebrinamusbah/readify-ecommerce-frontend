import { useEffect, useState } from "react";
import api from "../api/axios";
import { Link } from "react-router-dom";

function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    api
      .get("/products")
      .then((res) => {
        setProducts(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching products:", err);
        setLoading(false);
      });
  }, []);

  const handleAddToCart = (product) => {
    console.log("Add to cart:", product);
    // TODO: connect to Redux cartSlice
  };

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="flex flex-col sm:flex-row justify-between items-center p-4 bg-white shadow">
        <h1 className="text-2xl font-bold mb-2 sm:mb-0">MyStore</h1>
        <nav className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
          <Link to="/" className="hover:underline">
            Home
          </Link>
          <Link to="/products" className="hover:underline">
            Products
          </Link>
          <Link to="/cart" className="hover:underline">
            Cart
          </Link>
          <Link to="/login" className="hover:underline">
            Login/Register
          </Link>
        </nav>
      </header>

      {/* Search / Filter Bar */}
      <div className="p-4 bg-gray-100 border-b">
        <input
          type="text"
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border p-2 rounded w-full sm:w-1/2 md:w-1/3"
        />
      </div>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-6">
        {loading ? (
          <p className="text-center text-lg">Loading products...</p>
        ) : filteredProducts.length === 0 ? (
          <p className="text-center text-lg">No products found</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="border rounded-lg p-4 shadow hover:shadow-lg transition flex flex-col"
              >
                <img
                  src={product.imageUrl || "https://via.placeholder.com/150"}
                  alt={product.name}
                  className="h-40 w-full object-cover rounded"
                />
                <h2 className="mt-2 font-semibold text-lg">{product.name}</h2>
                <p className="text-green-600 font-bold mt-1">
                  ${product.price ?? 0}
                </p>

                <div className="mt-auto flex flex-col sm:flex-row gap-2 sm:gap-2">
                  <button
                    onClick={() => handleAddToCart(product)}
                    className="flex-1 bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded transition"
                  >
                    Add to Cart
                  </button>
                  <Link
                    to={`/products/${product.id}`}
                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded text-center transition"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="p-4 border-t text-center text-gray-600 bg-white mt-auto">
        <div className="flex flex-col sm:flex-row justify-center gap-2 sm:gap-4">
          <Link to="/about" className="hover:underline">
            About
          </Link>
          <Link to="/contact" className="hover:underline">
            Contact
          </Link>
          <Link to="/terms" className="hover:underline">
            Terms
          </Link>
        </div>
      </footer>
    </div>
  );
}

export default Home;
