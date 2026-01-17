import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import EmployeeDashboard from "./EmployeeDashboard";
import HeadDashboard from "./HeadDashboard";
import "./Dashboard.css";

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Only fetch admin stats if user is admin
    if (user?.role === "admin") {
      fetchDashboardStats();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/reports/dashboard-stats"
      );
      const data = await response.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  // ROLE-BASED RENDERING
  if (user?.role === "employee") {
    return <EmployeeDashboard />;
  }

  if (user?.role === "head") {
    return <HeadDashboard />;
  }

  // DEFAULT / ADMIN DASHBOARD
  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Admin Dashboard</h1>
        <p>Welcome to Haramaya University Employee Management System</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card stat-primary">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h3>{stats?.totalEmployees || 0}</h3>
            <p>Total Employees</p>
          </div>
        </div>

        <div className="stat-card stat-warning">
          <div className="stat-icon">📋</div>
          <div className="stat-content">
            <h3>{stats?.pendingLeaveRequests || 0}</h3>
            <p>Pending Leave Requests</p>
          </div>
        </div>

        <div className="stat-card stat-info">
          <div className="stat-icon">🏢</div>
          <div className="stat-content">
            <h3>{stats?.totalDepartments || 0}</h3>
            <p>Departments</p>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Employees by Type</h3>
          </div>
          <div className="type-distribution">
            {stats?.employeesByType?.map((type) => (
              <div key={type.employment_type} className="type-item">
                <span className="type-label">{type.employment_type}</span>
                <span className="badge badge-info">{type.count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Quick Information</h3>
          </div>
          <div className="quick-info">
            <div className="info-item">
              <span className="info-label">Active Users</span>
              <span className="info-value">
                {stats?.todayPresent || 0} (Present Today)
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
