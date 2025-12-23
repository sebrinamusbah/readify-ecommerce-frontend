import { useEffect, useState } from "react";
import api from "../api/axios";
import { Link } from "react-router-dom";

function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return <p className="p-6">Loading products...</p>;
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Products</h1>

      {products.length === 0 ? (
        <p>No products found</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {products.map((product) => (
            <div key={product.id} className="border rounded-lg p-4 shadow">
              <img
                src={product.image_url}
                alt={product.name}
                className="h-40 w-full object-cover rounded"
              />

              <h2 className="mt-2 font-semibold">{product.name}</h2>
              <p className="text-green-600">${product.price}</p>

              <Link
                to={`/products/${product.id}`}
                className="inline-block mt-3 bg-blue-500 text-white px-3 py-1 rounded"
              >
                View Details
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Home;
