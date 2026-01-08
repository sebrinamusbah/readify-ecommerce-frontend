import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalBooks: 0,
    totalCategories: 0,
    totalOrders: 0,
    totalRevenue: 0,
    totalUsers: 0,
    pendingOrders: 0,
    lowStockBooks: 0,
  });

  const [recentOrders, setRecentOrders] = useState([]);
  const [recentBooks, setRecentBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // In real app, make API calls here
      setTimeout(() => {
        setStats({
          totalBooks: 1247,
          totalCategories: 15,
          totalOrders: 342,
          totalRevenue: 28950.75,
          totalUsers: 856,
          pendingOrders: 23,
          lowStockBooks: 12,
        });

        setRecentOrders([
          {
            id: "ORD-001",
            customer: "John Doe",
            date: "2024-01-15",
            amount: "$125.99",
            status: "delivered",
          },
          {
            id: "ORD-002",
            customer: "Jane Smith",
            date: "2024-01-14",
            amount: "$89.50",
            status: "processing",
          },
          {
            id: "ORD-003",
            customer: "Bob Johnson",
            date: "2024-01-14",
            amount: "$245.75",
            status: "pending",
          },
          {
            id: "ORD-004",
            customer: "Alice Brown",
            date: "2024-01-13",
            amount: "$67.25",
            status: "delivered",
          },
          {
            id: "ORD-005",
            customer: "Charlie Wilson",
            date: "2024-01-12",
            amount: "$189.99",
            status: "cancelled",
          },
        ]);

        setRecentBooks([
          {
            id: 1,
            title: "The Great Gatsby",
            author: "F. Scott Fitzgerald",
            price: "$12.99",
            stock: 45,
            category: "Fiction",
          },
          {
            id: 2,
            title: "To Kill a Mockingbird",
            author: "Harper Lee",
            price: "$14.99",
            stock: 23,
            category: "Classic",
          },
          {
            id: 3,
            title: "1984",
            author: "George Orwell",
            price: "$10.99",
            stock: 67,
            category: "Dystopian",
          },
          {
            id: 4,
            title: "Pride and Prejudice",
            author: "Jane Austen",
            price: "$9.99",
            stock: 12,
            category: "Romance",
          },
          {
            id: 5,
            title: "The Catcher in the Rye",
            author: "J.D. Salinger",
            price: "$11.99",
            stock: 0,
            category: "Coming-of-age",
          },
        ]);

        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setLoading(false);
    }
  };

  const statsCards = [
    {
      title: "Total Books",
      value: stats.totalBooks.toLocaleString(),
      icon: "📚",
      color: "#3498db",
      link: "/admin/books",
      trend: "+12% from last month",
    },
    {
      title: "Categories",
      value: stats.totalCategories,
      icon: "🏷️",
      color: "#2ecc71",
      link: "/admin/categories",
      trend: "15 active categories",
    },
    {
      title: "Total Orders",
      value: stats.totalOrders.toLocaleString(),
      icon: "📦",
      color: "#9b59b6",
      link: "/admin/orders",
      trend: "+8% from last month",
    },
    {
      title: "Total Revenue",
      value: `$${stats.totalRevenue.toLocaleString()}`,
      icon: "💰",
      color: "#f1c40f",
      link: "/admin/reports",
      trend: "+15% from last month",
    },
    {
      title: "Total Users",
      value: stats.totalUsers.toLocaleString(),
      icon: "👥",
      color: "#e74c3c",
      link: "/admin/users",
      trend: "+5% from last month",
    },
    {
      title: "Pending Orders",
      value: stats.pendingOrders,
      icon: "⏳",
      color: "#e67e22",
      link: "/admin/orders?status=pending",
      trend: "Needs attention",
    },
    {
      title: "Low Stock",
      value: stats.lowStockBooks,
      icon: "⚠️",
      color: "#d35400",
      link: "/admin/books?stock=low",
      trend: "Need restocking",
    },
  ];

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: "#f39c12", label: "Pending" },
      processing: { color: "#3498db", label: "Processing" },
      delivered: { color: "#2ecc71", label: "Delivered" },
      cancelled: { color: "#e74c3c", label: "Cancelled" },
    };

    const config = statusConfig[status] || { color: "#95a5a6", label: status };

    return (
      <span
        className="status-badge"
        style={{
          backgroundColor: `${config.color}20`,
          color: config.color,
          borderColor: config.color,
        }}
      >
        {config.label}
      </span>
    );
  };

  const getStockBadge = (stock) => {
    if (stock === 0) {
      return (
        <span
          className="status-badge"
          style={{
            backgroundColor: "#e74c3c20",
            color: "#e74c3c",
            borderColor: "#e74c3c",
          }}
        >
          Out of Stock
        </span>
      );
    } else if (stock < 10) {
      return (
        <span
          className="status-badge"
          style={{
            backgroundColor: "#f39c1220",
            color: "#f39c12",
            borderColor: "#f39c12",
          }}
        >
          Low Stock
        </span>
      );
    } else {
      return (
        <span
          className="status-badge"
          style={{
            backgroundColor: "#2ecc7120",
            color: "#2ecc71",
            borderColor: "#2ecc71",
          }}
        >
          In Stock
        </span>
      );
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading dashboard data...</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Dashboard Overview</h1>
        <p>Welcome to your bookstore management dashboard</p>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        {statsCards.map((card, index) => (
          <div key={index} className="stat-card">
            <div className="stat-card-header">
              <div
                className="stat-icon"
                style={{
                  backgroundColor: `${card.color}20`,
                  color: card.color,
                }}
              >
                {card.icon}
              </div>
              <div className="stat-info">
                <h3>{card.title}</h3>
                <p className="stat-trend">{card.trend}</p>
              </div>
            </div>
            <div className="stat-value">{card.value}</div>
            <Link to={card.link} className="stat-link">
              View Details →
            </Link>
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="dashboard-section">
        <div className="section-header">
          <h2>Recent Orders</h2>
          <Link to="/admin/orders" className="view-all-link">
            View All Orders →
          </Link>
        </div>
        <div className="orders-table">
          <table>
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
                <tr key={order.id}>
                  <td>{order.id}</td>
                  <td>{order.customer}</td>
                  <td>{order.date}</td>
                  <td>{order.amount}</td>
                  <td>{getStatusBadge(order.status)}</td>
                  <td>
                    <Link
                      to={`/admin/orders/${order.id}`}
                      className="action-btn view-btn"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Books */}
      <div className="dashboard-section">
        <div className="section-header">
          <h2>Recent Books</h2>
          <div className="section-actions">
            <Link to="/admin/books" className="view-all-link">
              View All Books →
            </Link>
            <Link to="/admin/books/new" className="add-btn">
              Add New Book
            </Link>
          </div>
        </div>
        <div className="books-table">
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Author</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {recentBooks.map((book) => (
                <tr key={book.id}>
                  <td>{book.title}</td>
                  <td>{book.author}</td>
                  <td>{book.category}</td>
                  <td>{book.price}</td>
                  <td>{getStockBadge(book.stock)}</td>
                  <td>
                    <div className="action-buttons">
                      <Link
                        to={`/admin/books/${book.id}/edit`}
                        className="action-btn edit-btn"
                      >
                        Edit
                      </Link>
                      <button className="action-btn delete-btn">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
