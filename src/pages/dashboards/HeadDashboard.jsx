import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import ChangePassword from "../../components/ChangePassword";
import Navbar from "../../components/Layout/Navbar";
import "./EmployeeDashboard.css"; // Reuse modern styles

const HeadDashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [deptEmployees, setDeptEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [attendanceData, setAttendanceData] = useState({
    employee_id: "",
    date: new Date().toISOString().split("T")[0],
    status: "present",
    check_in_time: "",
    check_out_time: "",
  });

  useEffect(() => {
    fetchDeptEmployees();
  }, []);

  const fetchDeptEmployees = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/employees?department_id=${user.departmentId}`
      );
      const data = await response.json();
      if (data.success) {
        const filtered = data.data.filter(
          (emp) => emp.id !== user.employeeDbId
        );
        setDeptEmployees(filtered);
      }
    } catch (error) {
      console.error("Failed to load employees");
    }
  };

  const handleChange = (e) => {
    setAttendanceData({ ...attendanceData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const response = await fetch("http://localhost:5000/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(attendanceData),
      });
      const data = await response.json();
      if (data.success) {
        setMessage({ type: "success", text: "Attendance recorded!" });
      } else {
        setMessage({ type: "error", text: data.message || "Failed" });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Network Error" });
    } finally {
      setLoading(false);
    }
  };

  const NavItem = ({ id, label, icon }) => (
    <button
      className={`nav-item ${activeTab === id ? "active" : ""}`}
      onClick={() => {
        setActiveTab(id);
        setSidebarOpen(false);
      }}
    >
      <span className="nav-icon">{icon}</span>
      {label}
    </button>
  );

  return (
    <div className="employee-dashboard-container">
      <Navbar />
      <div className="employee-layout">
        {/* Sidebar */}
        <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
          <nav className="sidebar-nav">
            <NavItem id="overview" label="Overview" icon="📊" />
            <NavItem id="attendance" label="Record Attendance" icon="📝" />
            <NavItem id="employees" label="My Department" icon="👥" />
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
                <span>Dept #{user.departmentId}</span>
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
              <h2>
                {activeTab === "overview"
                  ? "Head Dashboard"
                  : activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
              </h2>
            </div>
          </header>

          <div className="content-area">
            {activeTab === "overview" && (
              <div className="overview-grid">
                <div className="stat-widget">
                  <div className="stat-widget-icon icon-blue">👥</div>
                  <div className="stat-widget-info">
                    <h3>{deptEmployees.length}</h3>
                    <p>Dept Employees</p>
                  </div>
                </div>
                <div className="stat-widget">
                  <div className="stat-widget-icon icon-green">🏢</div>
                  <div className="stat-widget-info">
                    <h3>#{user.departmentId}</h3>
                    <p>My Department</p>
                  </div>
                </div>
                <div className="stat-widget">
                  <div className="stat-widget-icon icon-purple">📅</div>
                  <div className="stat-widget-info">
                    <h3>{new Date().toLocaleDateString()}</h3>
                    <p>Today</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "attendance" && (
              <div className="card" style={{ maxWidth: "800px" }}>
                <div className="card-header">
                  <h3 className="card-title">Record Daily Attendance</h3>
                </div>
                <form onSubmit={handleSubmit} className="form-grid">
                  {message.text && (
                    <div
                      className={`badge ${
                        message.type === "error"
                          ? "badge-error"
                          : "badge-success"
                      } mb-3`}
                    >
                      {message.text}
                    </div>
                  )}

                  <div className="form-group">
                    <label>Select Employee</label>
                    <select
                      name="employee_id"
                      value={attendanceData.employee_id}
                      onChange={handleChange}
                      required
                    >
                      <option value="">-- Select Employee --</option>
                      {deptEmployees.map((emp) => (
                        <option key={emp.id} value={emp.id}>
                          {emp.first_name} {emp.last_name} ({emp.employee_id})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-2">
                    <div className="form-group">
                      <label>Date</label>
                      <input
                        type="date"
                        name="date"
                        value={attendanceData.date}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Status</label>
                      <select
                        name="status"
                        value={attendanceData.status}
                        onChange={handleChange}
                      >
                        <option value="present">Present</option>
                        <option value="absent">Absent</option>
                        <option value="late">Late</option>
                        <option value="permission">Permission</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-2">
                    <div className="form-group">
                      <label>Check In Time</label>
                      <input
                        type="time"
                        name="check_in_time"
                        value={attendanceData.check_in_time}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="form-group">
                      <label>Check Out Time</label>
                      <input
                        type="time"
                        name="check_out_time"
                        value={attendanceData.check_out_time}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="form-actions">
                    <button
                      type="submit"
                      className="btn btn-primary w-full"
                      disabled={loading}
                      style={{ width: "100%" }}
                    >
                      {loading ? "Recording..." : "Record Attendance"}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {activeTab === "employees" && (
              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">Department Employees</h3>
                </div>
                <div className="table-container">
                  {deptEmployees.length === 0 ? (
                    <p style={{ padding: "1rem" }}>
                      No employees found in this department.
                    </p>
                  ) : (
                    <table className="table">
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Name</th>
                          <th>Position</th>
                          <th>Email</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {deptEmployees.map((emp) => (
                          <tr key={emp.id}>
                            <td>{emp.employee_id}</td>
                            <td>
                              {emp.first_name} {emp.last_name}
                            </td>
                            <td>{emp.position}</td>
                            <td>{emp.email}</td>
                            <td>
                              <span
                                className={`badge badge-${
                                  emp.status === "active"
                                    ? "success"
                                    : "secondary"
                                }`}
                              >
                                {emp.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
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
    </div>
  );
};

export default HeadDashboard;
