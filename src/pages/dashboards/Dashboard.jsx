import { useState, useEffect } from 'react';
import './Dashboard.css';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/reports/dashboard-stats');
      const data = await response.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
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
              <span className="info-label">Recent Hires (30 days):</span>
              <span className="info-value">{stats?.recentHires || 0}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
