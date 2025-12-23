// src/pages/AdminDashboard.jsx
import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
  fetchProducts,
  addProduct,
  deleteProduct,
} from "../features/products/productSlice";
import { fetchOrders } from "../features/orders/orderSlice";

const Skeleton = ({ height = "h-32" }) => (
  <div className={`${height} bg-gray-300 animate-pulse rounded`} />
);

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const {
    products,
    loading: productsLoading,
    error: productsError,
  } = useSelector((state) => state.products);
  const {
    orders,
    loading: ordersLoading,
    error: ordersError,
  } = useSelector((state) => state.orders);

  const [newProduct, setNewProduct] = useState({
    name: "",
    description: "",
    price: "",
    image: "",
    category: "",
    stock: "",
  });

  // Filter states
  const [productSearch, setProductSearch] = useState("");
  const [orderSearch, setOrderSearch] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState("");

  useEffect(() => {
    dispatch(fetchProducts())
      .unwrap()
      .catch(() => toast.error("Failed to fetch products."));
    dispatch(fetchOrders())
      .unwrap()
      .catch(() => toast.error("Failed to fetch orders."));
  }, [dispatch]);

  const handleChange = (e) => {
    setNewProduct({ ...newProduct, [e.target.name]: e.target.value });
  };

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

  const handleDeleteProduct = (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      dispatch(deleteProduct(id))
        .unwrap()
        .then(() => toast.success("Product deleted successfully!"))
        .catch(() => toast.error("Failed to delete product."));
    }
  };

  // Filtered products
  const filteredProducts = useMemo(() => {
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
        p.category.toLowerCase().includes(productSearch.toLowerCase())
    );
  }, [products, productSearch]);

  // Filtered orders
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchesSearch =
        o.user.toLowerCase().includes(orderSearch.toLowerCase()) ||
        o.id.toString().includes(orderSearch);
      const matchesStatus = orderStatusFilter
        ? o.status.toLowerCase() === orderStatusFilter.toLowerCase()
        : true;
      return matchesSearch && matchesStatus;
    });
  }, [orders, orderSearch, orderStatusFilter]);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      {/* Add Product Form */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Add New Product</h2>
        <form
          onSubmit={handleAddProduct}
          className="grid gap-4 sm:grid-cols-1 md:grid-cols-2"
        >
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
        <div className="flex flex-col md:flex-row justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold">Products</h2>
          <input
            type="text"
            placeholder="Search by name or category..."
            value={productSearch}
            onChange={(e) => setProductSearch(e.target.value)}
            className="border p-2 rounded mt-2 md:mt-0"
          />
        </div>

        {productsLoading ? (
          <div className="grid gap-4 md:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} />
            ))}
          </div>
        ) : productsError ? (
          <p className="text-red-500">{productsError}</p>
        ) : filteredProducts.length === 0 ? (
          <p>No products found.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-3">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="border p-4 rounded shadow flex flex-col"
              >
                <img
                  src={product.image}
                  alt={product.name}
                  className="h-32 w-full object-cover mb-2 rounded"
                />
                <h3 className="font-semibold">{product.name}</h3>
                <p>${product.price}</p>
                <button
                  onClick={() => handleDeleteProduct(product.id)}
                  className="bg-red-500 text-white p-2 rounded mt-auto hover:bg-red-600"
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
        <div className="flex flex-col md:flex-row justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold">Orders</h2>
          <div className="flex flex-col sm:flex-row gap-2 mt-2 md:mt-0">
            <input
              type="text"
              placeholder="Search by user or ID..."
              value={orderSearch}
              onChange={(e) => setOrderSearch(e.target.value)}
              className="border p-2 rounded"
            />
            <select
              value={orderStatusFilter}
              onChange={(e) => setOrderStatusFilter(e.target.value)}
              className="border p-2 rounded"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="shipped">Shipped</option>
            </select>
          </div>
        </div>

        {ordersLoading ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} height="h-10" />
            ))}
          </div>
        ) : ordersError ? (
          <p className="text-red-500">{ordersError}</p>
        ) : filteredOrders.length === 0 ? (
          <p>No orders found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border text-sm">
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
                {filteredOrders.map((order) => (
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
