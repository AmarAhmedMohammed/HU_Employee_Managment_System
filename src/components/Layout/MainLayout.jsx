import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import { useAuth } from "../../context/AuthContext";
import { useLocation } from "react-router-dom";
import "./MainLayout.css";

const MainLayout = ({ children }) => {
  const { user } = useAuth();
  const location = useLocation();

  // Employee & Head Dashboards have their own internal layout
  if (
    (user?.role === "employee" || user?.role === "head") &&
    location.pathname === "/dashboard"
  ) {
    return <>{children}</>;
  }

  return (
    <div className="app-container">
      <Navbar />
      <div className="app-body">
        <Sidebar />
        <main className="main-content">{children}</main>
      </div>
    </div>
  );
};

export default MainLayout;
