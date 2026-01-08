import api from "./api";

export const orderService = {
  // Create order
  createOrder: (orderData) => api.post("/orders", orderData),

  // Get user orders
  getUserOrders: () => api.get("/orders"),

  // Get single order
  getOrderById: (id) => api.get(`/orders/${id}`),

  // Admin: Get all orders
  getAllOrders: () => api.get("/admin/orders"),

  // Admin: Update order status
  updateOrderStatus: (id, status) =>
    api.put(`/admin/orders/${id}/status`, { status }),
};
