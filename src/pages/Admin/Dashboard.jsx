import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext"; // Import AuthContext
import AdminNavbar from "../../components/Admin/AdminNavbar";
import "./Admin.css";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, isAdmin, mockDB, getUserOrders, getBooks, getCategories } =
    useAuth();
  const [stats, setStats] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is admin
  useEffect(() => {
    if (!isAdmin()) {
      navigate("/");
      return;
    }
  }, [isAdmin, navigate]);

  // Load dashboard data from mockDB
  useEffect(() => {
    if (user && isAdmin()) {
      calculateStats();
      loadRecentOrders();
      setIsLoading(false);
    }
  }, [user, mockDB]);

  const calculateStats = () => {
    // Calculate real stats from mock database
    const totalSales = mockDB.orders.reduce(
      (sum, order) => sum + order.totalAmount,
      0,
    );
    const totalOrders = mockDB.orders.length;
    const totalUsers = mockDB.users.length;
    const totalBooks = mockDB.books.length;

    const newStats = [
      {
        title: "Total Sales",
        value: `$${totalSales.toFixed(2)}`,
        change: "+12.5%", // This would be calculated in real app
        icon: "💰",
        color: "#2ecc71",
        realValue: totalSales,
      },
      {
        title: "Total Orders",
        value: totalOrders.toString(),
        change: "+8.2%",
        icon: "📦",
        color: "#3498db",
        realValue: totalOrders,
      },
      {
        title: "Total Users",
        value: totalUsers.toString(),
        change: "+5.7%",
        icon: "👥",
        color: "#9b59b6",
        realValue: totalUsers,
      },
      {
        title: "Total Books",
        value: totalBooks.toString(),
        change: "+3.4%",
        icon: "📚",
        color: "#e74c3c",
        realValue: totalBooks,
      },
    ];

    setStats(newStats);
  };

  const loadRecentOrders = () => {
    // Get recent orders (last 5)
    const orders = mockDB.orders
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5)
      .map((order) => {
        const user = mockDB.users.find((u) => u.id === order.userId);
        return {
          id: `#ORD${order.id.toString().padStart(3, "0")}`,
          customer: user ? user.name : "Unknown User",
          date: new Date(order.createdAt).toISOString().split("T")[0],
          amount: `$${order.totalAmount.toFixed(2)}`,
          status: order.status,
          orderId: order.id,
        };
      });

    setRecentOrders(orders);
  };

  const quickActions = [
    {
      title: "Add New Book",
      icon: "➕",
      link: "/admin/manage-books",
      color: "#3498db",
      description: "Add new books to your store",
    },
    {
      title: "Add Category",
      icon: "🏷️",
      link: "/admin/manage-books?tab=categories",
      color: "#2ecc71",
      description: "Create new book categories",
    },
    {
      title: "View Orders",
      icon: "📋",
      link: "/admin/orders",
      color: "#9b59b6",
      description: "Manage customer orders",
    },
    {
      title: "Manage Users",
      icon: "👥",
      link: "/admin/users",
      color: "#e74c3c",
      description: "View and manage users",
    },
  ];

  const viewOrderDetails = (orderId) => {
    navigate(`/admin/orders/${orderId}`);
  };

  if (isLoading) {
    return (
      <div className="admin-page">
        <AdminNavbar />
        <div className="admin-content">
          <div className="loading-dashboard">
            <div className="spinner"></div>
            <p>Loading dashboard data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <AdminNavbar />

      <div className="admin-content">
        <div className="dashboard-header">
          <h1 className="dashboard-title">Admin Dashboard</h1>
          <p className="dashboard-subtitle">
            Welcome back, <strong>{user?.name}</strong>! Here's what's happening
            with your store.
          </p>
          <div className="dashboard-summary">
            <span className="summary-item">
              <strong>Store Status:</strong>{" "}
              <span className="status-active">Active</span>
            </span>
            <span className="summary-item">
              <strong>Last Updated:</strong> {new Date().toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid">
          {stats.map((stat, index) => (
            <div key={index} className="stat-card">
              <div
                className="stat-icon"
                style={{
                  backgroundColor: `${stat.color}20`,
                  color: stat.color,
                }}
              >
                {stat.icon}
              </div>
              <div className="stat-content">
                <h3 className="stat-title">{stat.title}</h3>
                <div className="stat-value">{stat.value}</div>
                <div className="stat-change">
                  <span
                    className={`change-indicator ${stat.change.startsWith("+") ? "positive" : "negative"}`}
                  >
                    {stat.change}
                  </span>
                  <span className="change-text"> from last month</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="dashboard-grid">
          {/* Quick Actions */}
          <div className="dashboard-card">
            <div className="card-header">
              <h3 className="card-title">Quick Actions</h3>
              <p className="card-subtitle">Manage your bookstore</p>
            </div>
            <div className="card-content">
              <div className="quick-actions-grid">
                {quickActions.map((action, index) => (
                  <Link
                    to={action.link}
                    key={index}
                    className="quick-action-card"
                  >
                    <div
                      className="action-icon"
                      style={{ color: action.color }}
                    >
                      {action.icon}
                    </div>
                    <div className="action-content">
                      <h4 className="action-title">{action.title}</h4>
                      <p className="action-description">{action.description}</p>
                    </div>
                    <div className="action-arrow">→</div>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Orders */}
          <div className="dashboard-card">
            <div className="card-header">
              <h3 className="card-title">Recent Orders</h3>
              <Link to="/admin/orders" className="view-all-link">
                View All →
              </Link>
            </div>
            <div className="card-content">
              {recentOrders.length === 0 ? (
                <div className="no-orders">
                  <div className="no-orders-icon">📦</div>
                  <p>No orders yet</p>
                  <small>
                    Orders will appear here when customers make purchases
                  </small>
                </div>
              ) : (
                <table className="orders-table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Customer</th>
                      <th>Date</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map((order) => (
                      <tr key={order.orderId}>
                        <td>{order.id}</td>
                        <td>{order.customer}</td>
                        <td>{order.date}</td>
                        <td>{order.amount}</td>
                        <td>
                          <span
                            className={`status-badge status-${order.status.toLowerCase()}`}
                          >
                            {order.status}
                          </span>
                        </td>
                        <td>
                          <button
                            className="action-btn view-btn"
                            onClick={() => viewOrderDetails(order.orderId)}
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Store Overview */}
          <div className="dashboard-card">
            <div className="card-header">
              <h3 className="card-title">Store Overview</h3>
            </div>
            <div className="card-content">
              <div className="store-overview">
                <div className="overview-item">
                  <div className="overview-label">Categories</div>
                  <div className="overview-value">
                    {mockDB.categories.length}
                  </div>
                  <div className="overview-change">+2 this month</div>
                </div>
                <div className="overview-item">
                  <div className="overview-label">Books in Stock</div>
                  <div className="overview-value">{mockDB.books.length}</div>
                  <div className="overview-change">+15 this month</div>
                </div>
                <div className="overview-item">
                  <div className="overview-label">Active Users</div>
                  <div className="overview-value">
                    {mockDB.users.filter((u) => u.role === "user").length}
                  </div>
                  <div className="overview-change">+8 this week</div>
                </div>
                <div className="overview-item">
                  <div className="overview-label">Conversion Rate</div>
                  <div className="overview-value">3.2%</div>
                  <div className="overview-change positive">+0.5%</div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="dashboard-card">
            <div className="card-header">
              <h3 className="card-title">Recent Activity</h3>
            </div>
            <div className="card-content">
              <div className="activity-list">
                {mockDB.books.length === 0 && mockDB.categories.length === 0 ? (
                  <div className="no-activity">
                    <div className="no-activity-icon">📝</div>
                    <p>No recent activity</p>
                    <small>Start by adding categories and books</small>
                  </div>
                ) : (
                  <>
                    {mockDB.books
                      .slice(-3)
                      .reverse()
                      .map((book) => (
                        <div className="activity-item" key={book.id}>
                          <div className="activity-icon">📚</div>
                          <div className="activity-content">
                            <p>
                              <strong>New book added:</strong> "{book.title}"
                            </p>
                            <span className="activity-time">
                              {new Date(book.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      ))}
                    {mockDB.categories
                      .slice(-2)
                      .reverse()
                      .map((category) => (
                        <div className="activity-item" key={category.id}>
                          <div className="activity-icon">🏷️</div>
                          <div className="activity-content">
                            <p>
                              <strong>New category:</strong> "{category.name}"
                            </p>
                            <span className="activity-time">
                              {new Date(
                                category.createdAt,
                              ).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      ))}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
