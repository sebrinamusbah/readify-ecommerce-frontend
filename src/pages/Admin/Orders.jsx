import React from "react";
import AdminNavbar from "../../components/Admin/AdminNavbar";

const Orders = () => {
  return (
    <div className="admin-page">
      <AdminNavbar />
      <div className="admin-content">
        <h1>Orders Management</h1>
        <p>This is where you can view and manage customer orders.</p>
      </div>
    </div>
  );
};

export default Orders;
