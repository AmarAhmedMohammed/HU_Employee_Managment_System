import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import leaveService from "../../services/leaveService";
import performanceService from "../../services/performanceService";
import ChangePassword from "../../components/ChangePassword";
import "./EmployeeDashboard.css"; // Uses the new scoped CSS

const EmployeeDashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [leaves, setLeaves] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Leave Form State
  const [leaveForm, setLeaveForm] = useState({
    leave_type: "annual",
    start_date: "",
    end_date: "",
    reason: "",
  });
  const [msg, setMsg] = useState("");

  useEffect(() => {
    // Always fetch data needed for overview
    fetchLeaves();
    fetchAttendance();
  }, [user]);

  useEffect(() => {
    if (activeTab === "performance") fetchReviews();
  }, [activeTab]);

  const fetchLeaves = async () => {
    try {
      const data = await leaveService.getAll({
        employee_id: user.employeeDbId,
      });
      if (data.success) setLeaves(data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAttendance = async () => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/attendance?employee_id=${user.employeeDbId}`
      );
      const data = await res.json();
      if (data.success) setAttendance(data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchReviews = async () => {
    try {
      const data = await performanceService.getAll({
        employee_id: user.employeeDbId,
      });
      if (data.success) setReviews(data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleLeaveSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await leaveService.create({
        ...leaveForm,
        employee_id: user.employeeDbId,
      });
      setMsg("Leave request submitted!");
      fetchLeaves();
      setLeaveForm({
        leave_type: "annual",
        start_date: "",
        end_date: "",
        reason: "",
      });
      setTimeout(() => setMsg(""), 3000);
    } catch (err) {
      setMsg("Failed to submit request");
    } finally {
      setLoading(false);
    }
  };

  const NavItem = ({ id, label, icon }) => (
    <button
      className={`nav-item ${activeTab === id ? "active" : ""}`}
      onClick={() => {
        setActiveTab(id);
        setSidebarOpen(false); // Close sidebar on mobile select
      }}
    >
      <span className="nav-icon">{icon}</span>
      {label}
    </button>
  );

  return (
    <div className="employee-layout">
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <img src="/src/assets/hu.png" alt="HU" className="brand-logo" />
            <span>HU Employee</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <NavItem id="overview" label="Overview" icon="📊" />
          <NavItem id="profile" label="My Profile" icon="👤" />
          <NavItem id="attendance" label="Attendance" icon="📅" />
          <NavItem id="leave" label="Leave Requests" icon="✈️" />
          <NavItem id="performance" label="Performance" icon="⭐" />
          <NavItem id="settings" label="Settings" icon="⚙️" />
        </nav>

        <div className="sidebar-footer">
          <div className="user-mini-profile">
            <div className="user-avatar">
              {user.firstName?.charAt(0)}
              {user.lastName?.charAt(0)}
            </div>
            <div className="user-info">
              <h4>
                {user.firstName} {user.lastName}
              </h4>
              <span>{user.employee_id}</span>
            </div>
          </div>
          <button
            className="btn btn-sm btn-outline mt-2 w-full"
            onClick={logout}
            style={{ width: "100%" }}
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="top-bar">
          <div className="page-title">
            <h2>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h2>
          </div>
          {/* Mobile Menu Toggle could go here */}
        </header>

        <div className="content-area">
          {activeTab === "overview" && (
            <>
              <div className="overview-grid">
                <div className="stat-widget">
                  <div className="stat-widget-icon icon-blue">👤</div>
                  <div className="stat-widget-info">
                    <h3>{user.position}</h3>
                    <p>My Role</p>
                  </div>
                </div>
                <div className="stat-widget">
                  <div className="stat-widget-icon icon-green">📅</div>
                  <div className="stat-widget-info">
                    <h3>{attendance.length}</h3>
                    <p>Days Present</p>
                  </div>
                </div>
                <div className="stat-widget">
                  <div className="stat-widget-icon icon-orange">✈️</div>
                  <div className="stat-widget-info">
                    <h3>{leaves.length}</h3>
                    <p>Leave Requests</p>
                  </div>
                </div>
              </div>

              <div className="card">
                <h3>Recent Activity</h3>
                <p>
                  Welcome to your employee dashboard. Check specific tabs for
                  detailed information.
                </p>
              </div>
            </>
          )}

          {activeTab === "profile" && (
            <div className="profile-card-modern">
              <div className="profile-banner"></div>
              <div className="profile-header-content">
                <div className="profile-avatar-large">
                  <div className="avatar-inner">
                    {user.firstName?.charAt(0)}
                    {user.lastName?.charAt(0)}
                  </div>
                </div>
                <div className="profile-name">
                  <h2>
                    {user.firstName} {user.lastName}
                  </h2>
                  <span>{user.position}</span>
                </div>
              </div>
              <div className="profile-grid">
                <div className="profile-field">
                  <label>Employee ID</label>
                  <div>{user.employee_id}</div>
                </div>
                <div className="profile-field">
                  <label>Email Address</label>
                  <div>{user.email}</div>
                </div>
                <div className="profile-field">
                  <label>Department</label>
                  <div>Department ID: {user.departmentId}</div>
                </div>
                <div className="profile-field">
                  <label>Role</label>
                  <div style={{ textTransform: "capitalize" }}>{user.role}</div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "attendance" && (
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Attendance History</h3>
              </div>
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Check In</th>
                    <th>Check Out</th>
                  </tr>
                </thead>
                <tbody>
                  {attendance.length > 0 ? (
                    attendance.map((att) => (
                      <tr key={att.id}>
                        <td>{new Date(att.date).toLocaleDateString()}</td>
                        <td>
                          <span className={`badge status-${att.status}`}>
                            {att.status}
                          </span>
                        </td>
                        <td>{att.check_in_time || "-"}</td>
                        <td>{att.check_out_time || "-"}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4">No attendance records found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === "leave" && (
            <div className="grid grid-2">
              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">Request Leave</h3>
                </div>
                {msg && (
                  <div
                    className={`badge ${
                      msg.includes("Failed") ? "badge-error" : "badge-success"
                    }`}
                  >
                    {msg}
                  </div>
                )}
                <form onSubmit={handleLeaveSubmit} className="mt-2">
                  <div className="form-group">
                    <label>Leave Type</label>
                    <select
                      value={leaveForm.leave_type}
                      onChange={(e) =>
                        setLeaveForm({
                          ...leaveForm,
                          leave_type: e.target.value,
                        })
                      }
                    >
                      <option value="annual">Annual</option>
                      <option value="sick">Sick</option>
                      <option value="maternity">Maternity</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Start Date</label>
                    <input
                      type="date"
                      required
                      value={leaveForm.start_date}
                      onChange={(e) =>
                        setLeaveForm({
                          ...leaveForm,
                          start_date: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="form-group">
                    <label>End Date</label>
                    <input
                      type="date"
                      required
                      value={leaveForm.end_date}
                      onChange={(e) =>
                        setLeaveForm({ ...leaveForm, end_date: e.target.value })
                      }
                    />
                  </div>
                  <div className="form-group">
                    <label>Reason</label>
                    <input
                      type="text"
                      required
                      placeholder="Why do you need leave?"
                      value={leaveForm.reason}
                      onChange={(e) =>
                        setLeaveForm({ ...leaveForm, reason: e.target.value })
                      }
                    />
                  </div>
                  <button
                    className="btn btn-primary w-full"
                    disabled={loading}
                    style={{ width: "100%" }}
                  >
                    {loading ? "Submitting..." : "Submit Request"}
                  </button>
                </form>
              </div>

              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">Leave History</h3>
                </div>
                <div className="table-container">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Type</th>
                        <th>Dates</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {leaves.length > 0 ? (
                        leaves.map((l) => (
                          <tr key={l.id}>
                            <td>{l.leave_type}</td>
                            <td>
                              {new Date(l.start_date).toLocaleDateString()} -{" "}
                              {new Date(l.end_date).toLocaleDateString()}
                            </td>
                            <td>
                              <span
                                className={`badge badge-${
                                  l.status === "approved"
                                    ? "success"
                                    : l.status === "rejected"
                                    ? "error"
                                    : "warning"
                                }`}
                              >
                                {l.status}
                              </span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="3">No leave requests found.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === "performance" && (
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Performance Reviews</h3>
              </div>
              {reviews.length === 0 ? (
                <p>No reviews found.</p>
              ) : (
                <table className="table">
                  <thead>
                    <tr>
                      <th>Period</th>
                      <th>Rating</th>
                      <th>Reviewer</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reviews.map((r) => (
                      <tr key={r.id}>
                        <td>{r.review_period}</td>
                        <td>
                          <span className="badge badge-info">{r.rating}/5</span>
                        </td>
                        <td>{r.reviewer_name}</td>
                        <td>{new Date(r.review_date).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {activeTab === "settings" && (
            <div
              className="card"
              style={{ maxWidth: "500px", margin: "0 auto" }}
            >
              <div className="card-header">
                <h3 className="card-title">Security Settings</h3>
              </div>
              <ChangePassword />
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default EmployeeDashboard;
