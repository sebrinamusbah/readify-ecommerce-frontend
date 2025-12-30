import React from "react";
import AdminNavbar from "../../components/Admin/AdminNavbar";

const Users = () => {
  return (
    <div className="admin-page">
      <AdminNavbar />
      <div className="admin-content">
        <h1>User Management</h1>
        <p>This is where you can manage user accounts and permissions.</p>
      </div>
    </div>
  );
};

export default Users;
