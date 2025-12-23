import { useState, useEffect } from 'react';
import reportService from '../../services/reportService';
import './Reports.css';

const Reports = () => {
  const [stats, setStats] = useState(null);
  const [deptDist, setDeptDist] = useState([]);
  const [leaveSummary, setLeaveSummary] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, deptRes, leaveRes] = await Promise.all([
        reportService.getDashboardStats(),
        reportService.getDepartmentDistribution(),
        reportService.getLeaveSummary()
      ]);
      if (statsRes.success) setStats(statsRes.data);
      if (deptRes.success) setDeptDist(deptRes.data);
      if (leaveRes.success) setLeaveSummary(leaveRes.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div>
      <div className="page-header">
        <h1>Reports & Analytics</h1>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon stat-primary">👥</div>
          <div className="stat-content">
            <h3>{stats?.totalEmployees || 0}</h3>
            <p>Total Employees</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-warning">🏢</div>
          <div className="stat-content">
            <h3>{stats?.totalDepartments || 0}</h3>
            <p>Departments</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-info">📋</div>
          <div className="stat-content">
            <h3>{stats?.pendingLeaveRequests || 0}</h3>
            <p>Pending Leaves</p>
          </div>
        </div>
      </div>

      <div className="reports-grid">
        <div className="card">
          <h3 className="card-title">Employees by Department</h3>
          <div className="report-list">
            {deptDist.map((dept, idx) => (
              <div key={idx} className="report-item">
                <span className="report-label">{dept.name}</span>
                <span className="report-value">{dept.employee_count} employees</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h3 className="card-title">Leave Requests Summary</h3>
          <div className="report-list">
            {leaveSummary.map((leave, idx) => (
              <div key={idx} className="report-item">
                <span className="report-label">{leave.leave_type} - {leave.status}</span>
                <span className={`badge badge-${leave.status === 'approved' ? 'success' : leave.status === 'rejected' ? 'error' : 'warning'}`}>
                  {leave.count}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h3 className="card-title">Employee Distribution by Type</h3>
          <div className="report-list">
            {stats?.employeesByType?.map((type, idx) => (
              <div key={idx} className="report-item">
                <span className="report-label">{type.employment_type}</span>
                <span className="report-value">{type.count} employees</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
