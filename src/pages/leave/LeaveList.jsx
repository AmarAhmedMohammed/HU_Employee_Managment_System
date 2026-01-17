import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import leaveService from "../../services/leaveService";
import "./LeaveList.css";

const LeaveList = () => {
  const { user } = useAuth();
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLeave, setSelectedLeave] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const leaveRes = await leaveService.getAll();
      if (leaveRes.success) setLeaves(leaveRes.data);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await leaveService.update(id, {
        status: "approved",
        approved_by: user.id,
      });
      fetchData();
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleReject = async (id) => {
    try {
      await leaveService.update(id, {
        status: "rejected",
        approved_by: user.id,
      });
      fetchData();
    } catch (error) {
      console.error("Error:", error);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div>
      <div className="page-header">
        <h1>Leave Requests</h1>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Employee</th>
              <th>Type</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Days</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {leaves.map((leave) => (
              <tr key={leave.id}>
                <td>
                  <strong>{leave.employee_name}</strong>
                  <br />
                  <small>{leave.emp_code}</small>
                </td>
                <td>
                  <span className="badge badge-info">{leave.leave_type}</span>
                </td>
                <td>{new Date(leave.start_date).toLocaleDateString()}</td>
                <td>{new Date(leave.end_date).toLocaleDateString()}</td>
                <td>{leave.days_requested}</td>
                <td>
                  <span
                    className={`badge badge-${
                      leave.status === "approved"
                        ? "success"
                        : leave.status === "rejected"
                        ? "error"
                        : "warning"
                    }`}
                  >
                    {leave.status}
                  </span>
                </td>
                <td>
                  {leave.status === "pending" &&
                    (user.role === "admin" || user.role === "hr_officer") && (
                      <>
                        <button
                          className="btn-icon"
                          onClick={() => handleApprove(leave.id)}
                          title="Approve"
                        >
                          ✓
                        </button>
                        <button
                          className="btn-icon delete"
                          onClick={() => handleReject(leave.id)}
                          title="Reject"
                        >
                          ✗
                        </button>
                      </>
                    )}
                  <button
                    className="btn-icon"
                    onClick={() => setSelectedLeave(leave)}
                    title="View Details"
                    style={{ marginLeft: "5px" }}
                  >
                    👁️
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedLeave && (
        <div className="modal-overlay" onClick={() => setSelectedLeave(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Leave Request Details</h2>
              <button
                className="modal-close"
                onClick={() => setSelectedLeave(null)}
              >
                &times;
              </button>
            </div>
            <div className="modal-body">
              <div className="detail-row">
                <strong>Employee:</strong> {selectedLeave.employee_name} (
                {selectedLeave.emp_code})
              </div>
              <div className="detail-row">
                <strong>Type:</strong> {selectedLeave.leave_type}
              </div>
              <div className="detail-row">
                <strong>Dates:</strong>{" "}
                {new Date(selectedLeave.start_date).toLocaleDateString()} -{" "}
                {new Date(selectedLeave.end_date).toLocaleDateString()} (
                {selectedLeave.days_requested} days)
              </div>
              <div className="detail-row">
                <strong>Status:</strong>{" "}
                <span
                  className={`badge badge-${
                    selectedLeave.status === "approved"
                      ? "success"
                      : selectedLeave.status === "rejected"
                      ? "error"
                      : "warning"
                  }`}
                >
                  {selectedLeave.status}
                </span>
              </div>
              <div className="detail-row" style={{ marginTop: "1rem" }}>
                <strong>Reason:</strong>
                <p
                  style={{
                    marginTop: "0.5rem",
                    padding: "0.75rem",
                    background: "#f9fafb",
                    borderRadius: "6px",
                    border: "1px solid #e5e7eb",
                    maxHeight: "300px",
                    overflowY: "auto",
                  }}
                >
                  {selectedLeave.reason}
                </p>
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setSelectedLeave(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaveList;
