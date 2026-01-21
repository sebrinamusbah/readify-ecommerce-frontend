import React from "react";
import AdminNavbar from "../../components/Admin/AdminNavbar";

const ManageBooks = () => {
  return (
    <div className="admin-page">
      <AdminNavbar />
      <div className="admin-content">
        <h1>Manage Books</h1>
        <p>This is where you can add, edit, and delete books.</p>
      </div>
    </div>
  );
};

export default ManageBooks;
