import React from "react";
import AdminNavbar from "../../components/Admin/AdminNavbar";

const Settings = () => {
  return (
    <div className="admin-page">
      <AdminNavbar />
      <div className="admin-content">
        <h1>Site Settings</h1>
        <p>This is where you can configure site settings and preferences.</p>
      </div>
    </div>
  );
};

export default Settings;
