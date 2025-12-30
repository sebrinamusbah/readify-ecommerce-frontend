import React from "react";
import AdminNavbar from "../../components/Admin/AdminNavbar";

const Reports = () => {
  return (
    <div className="admin-page">
      <AdminNavbar />
      <div className="admin-content">
        <h1>Reports & Analytics</h1>
        <p>This is where you can view sales reports and analytics.</p>
      </div>
    </div>
  );
};

export default Reports;
