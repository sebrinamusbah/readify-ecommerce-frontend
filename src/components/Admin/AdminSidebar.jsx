import React, { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import "./AdminSidebar.css";

const AdminSidebar = () => {
  const location = useLocation();
  const [expandedSections, setExpandedSections] = useState({
    inventory: true,
    users: true,
    reports: true,
  });

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const mainMenu = [
    { path: "/admin", label: "Dashboard", icon: "📊", exact: true },
    { path: "/admin/orders", label: "Orders", icon: "📦", badge: "12" },
    { path: "/admin/books", label: "Books", icon: "📚" },
    { path: "/admin/categories", label: "Categories", icon: "🏷️" },
    { path: "/admin/users", label: "Users", icon: "👥" },
    { path: "/admin/reviews", label: "Reviews", icon: "⭐" },
  ];

  const inventoryMenu = [
    { path: "/admin/inventory", label: "Inventory Overview", icon: "📦" },
    { path: "/admin/books/add", label: "Add New Book", icon: "➕" },
    { path: "/admin/books/import", label: "Import Books", icon: "📥" },
    { path: "/admin/books/export", label: "Export Books", icon: "📤" },
  ];

  const reportMenu = [
    { path: "/admin/reports/sales", label: "Sales Reports", icon: "💰" },
    { path: "/admin/reports/users", label: "User Reports", icon: "👥" },
    {
      path: "/admin/reports/inventory",
      label: "Inventory Reports",
      icon: "📊",
    },
    { path: "/admin/reports/analytics", label: "Analytics", icon: "📈" },
  ];

  const settingsMenu = [
    { path: "/admin/settings/general", label: "General Settings", icon: "⚙️" },
    { path: "/admin/settings/payment", label: "Payment Settings", icon: "💳" },
    {
      path: "/admin/settings/shipping",
      label: "Shipping Settings",
      icon: "🚚",
    },
    {
      path: "/admin/settings/notifications",
      label: "Notifications",
      icon: "🔔",
    },
  ];

  const quickActions = [
    {
      path: "/admin/quick/add-book",
      label: "Quick Add Book",
      icon: "📘",
      color: "blue",
    },
    {
      path: "/admin/quick/process-order",
      label: "Process Order",
      icon: "⚡",
      color: "green",
    },
    {
      path: "/admin/quick/send-email",
      label: "Send Email",
      icon: "📧",
      color: "purple",
    },
    {
      path: "/admin/quick/generate-report",
      label: "Generate Report",
      icon: "📄",
      color: "orange",
    },
  ];

  const isActive = (path, exact = false) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <aside className="admin-sidebar">
      {/* Sidebar Header */}
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <span className="logo-icon">⚡</span>
          <h2>Admin Panel</h2>
        </div>
        <div className="sidebar-status">
          <span className="status-indicator online"></span>
          <span className="status-text">System Online</span>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="sidebar-quick-actions">
        <h3 className="section-title">Quick Actions</h3>
        <div className="quick-action-grid">
          {quickActions.map((action) => (
            <NavLink
              key={action.path}
              to={action.path}
              className={`quick-action-btn ${action.color}`}
            >
              <span className="action-icon">{action.icon}</span>
              <span className="action-label">{action.label}</span>
            </NavLink>
          ))}
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="sidebar-nav">
        <h3 className="section-title">Main Navigation</h3>
        <ul className="nav-menu">
          {mainMenu.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `nav-link ${isActive ? "active" : ""}`
                }
                end={item.exact}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
                {item.badge && <span className="nav-badge">{item.badge}</span>}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Inventory Section */}
      <div className="sidebar-section">
        <div
          className="section-header"
          onClick={() => toggleSection("inventory")}
        >
          <h3 className="section-title">
            <span className="section-icon">📦</span>
            Inventory Management
          </h3>
          <span className="section-toggle">
            {expandedSections.inventory ? "▲" : "▼"}
          </span>
        </div>
        {expandedSections.inventory && (
          <ul className="sub-menu">
            {inventoryMenu.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `sub-nav-link ${isActive ? "active" : ""}`
                  }
                >
                  <span className="sub-nav-icon">{item.icon}</span>
                  <span>{item.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Reports Section */}
      <div className="sidebar-section">
        <div
          className="section-header"
          onClick={() => toggleSection("reports")}
        >
          <h3 className="section-title">
            <span className="section-icon">📈</span>
            Reports & Analytics
          </h3>
          <span className="section-toggle">
            {expandedSections.reports ? "▲" : "▼"}
          </span>
        </div>
        {expandedSections.reports && (
          <ul className="sub-menu">
            {reportMenu.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `sub-nav-link ${isActive ? "active" : ""}`
                  }
                >
                  <span className="sub-nav-icon">{item.icon}</span>
                  <span>{item.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Settings Section */}
      <div className="sidebar-section">
        <div
          className="section-header"
          onClick={() => toggleSection("settings")}
        >
          <h3 className="section-title">
            <span className="section-icon">⚙️</span>
            Settings
          </h3>
          <span className="section-toggle">
            {expandedSections.settings ? "▲" : "▼"}
          </span>
        </div>
        {expandedSections.settings && (
          <ul className="sub-menu">
            {settingsMenu.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `sub-nav-link ${isActive ? "active" : ""}`
                  }
                >
                  <span className="sub-nav-icon">{item.icon}</span>
                  <span>{item.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* System Info */}
      <div className="sidebar-footer">
        <div className="system-info">
          <div className="info-item">
            <span className="info-label">Uptime:</span>
            <span className="info-value">99.8%</span>
          </div>
          <div className="info-item">
            <span className="info-label">Memory:</span>
            <span className="info-value">64%</span>
          </div>
          <div className="info-item">
            <span className="info-label">Last Backup:</span>
            <span className="info-value">2 hours ago</span>
          </div>
        </div>
        <div className="sidebar-help">
          <a href="/admin/help" className="help-link">
            <span className="help-icon">❓</span>
            <span>Help & Support</span>
          </a>
        </div>
      </div>
    </aside>
  );
};

export default AdminSidebar;
