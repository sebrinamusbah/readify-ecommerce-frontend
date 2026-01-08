import React from "react";
import { useAdmin } from "../../context/AdminContext";
import { Link } from "react-router-dom";
import "./DashboardStats.css";

const DashboardStats = () => {
  const { adminStats, isLoading } = useAdmin();

  const statCards = [
    {
      title: "Total Revenue",
      value: `$${adminStats.totalRevenue.toLocaleString()}`,
      icon: "💰",
      color: "green",
      trend: "+12.5%",
      link: "/admin/reports/sales",
      description: "Last 30 days",
    },
    {
      title: "Total Orders",
      value: adminStats.totalOrders.toLocaleString(),
      icon: "📦",
      color: "blue",
      trend: "+8.2%",
      link: "/admin/orders",
      description: `${adminStats.pendingOrders} pending`,
    },
    {
      title: "Total Books",
      value: adminStats.totalBooks.toLocaleString(),
      icon: "📚",
      color: "purple",
      trend: "+15.3%",
      link: "/admin/books",
      description: "In inventory",
    },
    {
      title: "Total Users",
      value: adminStats.totalUsers.toLocaleString(),
      icon: "👥",
      color: "orange",
      trend: "+5.7%",
      link: "/admin/users",
      description: "Active customers",
    },
    {
      title: "Conversion Rate",
      value: "4.8%",
      icon: "📈",
      color: "red",
      trend: "+2.1%",
      link: "/admin/reports/analytics",
      description: "Site visits to orders",
    },
    {
      title: "Avg Order Value",
      value: "$89.99",
      icon: "💳",
      color: "teal",
      trend: "+3.4%",
      link: "/admin/reports/sales",
      description: "Last 30 days average",
    },
  ];

  if (isLoading) {
    return (
      <div className="stats-loading">
        <div className="loading-spinner"></div>
        <p>Loading statistics...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-stats">
      <div className="stats-header">
        <h2 className="stats-title">Dashboard Overview</h2>
        <div className="stats-period">
          <select className="period-select">
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month" selected>
              This Month
            </option>
            <option value="year">This Year</option>
          </select>
        </div>
      </div>

      <div className="stats-grid">
        {statCards.map((stat, index) => (
          <div key={index} className={`stat-card ${stat.color}`}>
            <Link to={stat.link} className="stat-card-link">
              <div className="stat-header">
                <div className="stat-icon">{stat.icon}</div>
                <div className="stat-trend">
                  <span
                    className={`trend-indicator ${
                      stat.trend.startsWith("+") ? "positive" : "negative"
                    }`}
                  >
                    {stat.trend}
                  </span>
                </div>
              </div>

              <div className="stat-content">
                <div className="stat-value">{stat.value}</div>
                <div className="stat-title">{stat.title}</div>
                <div className="stat-description">{stat.description}</div>
              </div>

              <div className="stat-footer">
                <span className="view-details">View Details →</span>
              </div>
            </Link>
          </div>
        ))}
      </div>

      {/* Quick Stats Summary */}
      <div className="quick-stats-summary">
        <div className="summary-card">
          <h3 className="summary-title">Performance Summary</h3>
          <div className="summary-grid">
            <div className="summary-item">
              <span className="summary-label">Revenue Growth</span>
              <span className="summary-value positive">+12.5%</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">New Users</span>
              <span className="summary-value positive">+24</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Orders Processed</span>
              <span className="summary-value positive">+42</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Inventory Turnover</span>
              <span className="summary-value positive">2.4x</span>
            </div>
          </div>
        </div>

        <div className="summary-card">
          <h3 className="summary-title">System Status</h3>
          <div className="system-status">
            <div className="status-item active">
              <span className="status-dot"></span>
              <span>API Server</span>
              <span className="status-value">Online</span>
            </div>
            <div className="status-item active">
              <span className="status-dot"></span>
              <span>Database</span>
              <span className="status-value">Online</span>
            </div>
            <div className="status-item warning">
              <span className="status-dot"></span>
              <span>Email Service</span>
              <span className="status-value">Degraded</span>
            </div>
            <div className="status-item active">
              <span className="status-dot"></span>
              <span>Payment Gateway</span>
              <span className="status-value">Online</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardStats;
