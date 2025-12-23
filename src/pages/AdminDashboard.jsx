// src/pages/AdminDashboard.jsx
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
  fetchProducts,
  addProduct,
  deleteProduct,
} from "../features/products/productSlice";
import { fetchOrders } from "../features/orders/orderSlice";

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const { products, loading: productsLoading } = useSelector(
    (state) => state.products
  );
  const { orders, loading: ordersLoading } = useSelector(
    (state) => state.orders
  );

  const [newProduct, setNewProduct] = useState({
    name: "",
    description: "",
    price: "",
    image: "",
    category: "",
    stock: "",
  });

  // Fetch products and orders on mount
  useEffect(() => {
    dispatch(fetchProducts());
    dispatch(fetchOrders());
  }, [dispatch]);

  // Handle input change
  const handleChange = (e) => {
    setNewProduct({ ...newProduct, [e.target.name]: e.target.value });
  };

  // Handle product add
  const handleAddProduct = (e) => {
    e.preventDefault();
    dispatch(addProduct(newProduct))
      .unwrap()
      .then(() => {
        toast.success("Product added successfully!");
        setNewProduct({
          name: "",
          description: "",
          price: "",
          image: "",
          category: "",
          stock: "",
        });
      })
      .catch(() => toast.error("Failed to add product."));
  };

  // Handle product delete
  const handleDeleteProduct = (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      dispatch(deleteProduct(id))
        .unwrap()
        .then(() => toast.success("Product deleted successfully!"))
        .catch(() => toast.error("Failed to delete product."));
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      {/* Add Product Form */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Add New Product</h2>
        <form onSubmit={handleAddProduct} className="grid gap-4 md:grid-cols-2">
          {["name", "description", "price", "image", "category", "stock"].map(
            (field) => (
              <input
                key={field}
                type={
                  field === "price" || field === "stock" ? "number" : "text"
                }
                name={field}
                placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                value={newProduct[field]}
                onChange={handleChange}
                required
                className="border p-2 rounded"
              />
            )
          )}
          <button
            type="submit"
            className="bg-blue-500 text-white p-2 rounded col-span-2 md:col-span-1 hover:bg-blue-600"
          >
            Add Product
          </button>
        </form>
      </section>

      {/* Product List */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Products</h2>
        {productsLoading ? (
          <p>Loading products...</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-3">
            {products.map((product) => (
              <div key={product.id} className="border p-4 rounded shadow">
                <img
                  src={product.image}
                  alt={product.name}
                  className="h-32 w-full object-cover mb-2"
                />
                <h3 className="font-semibold">{product.name}</h3>
                <p>${product.price}</p>
                <button
                  onClick={() => handleDeleteProduct(product.id)}
                  className="bg-red-500 text-white p-2 rounded mt-2 hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Orders */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Orders</h2>
        {ordersLoading ? (
          <p>Loading orders...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border">
              <thead>
                <tr className="bg-gray-200">
                  <th className="border px-4 py-2">ID</th>
                  <th className="border px-4 py-2">User</th>
                  <th className="border px-4 py-2">Total</th>
                  <th className="border px-4 py-2">Status</th>
                  <th className="border px-4 py-2">Date</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td className="border px-4 py-2">{order.id}</td>
                    <td className="border px-4 py-2">{order.user}</td>
                    <td className="border px-4 py-2">${order.total}</td>
                    <td className="border px-4 py-2">{order.status}</td>
                    <td className="border px-4 py-2">
                      {new Date(order.date).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};

export default AdminDashboard;
