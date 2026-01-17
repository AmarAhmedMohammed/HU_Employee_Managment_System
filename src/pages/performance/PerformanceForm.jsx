import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import performanceService from "../../services/performanceService";
import "./Performance.css";

const PerformanceForm = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    employee_id: "",
    review_period: "",
    rating: 3,
    strengths: "",
    improvements: "",
    goals: "",
    comments: "",
    review_date: new Date().toISOString().split("T")[0],
    status: "completed",
  });

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      // Logic to fetch employees. If Head, should filter by dept?
      // For now fetching all, backend 'GET /api/employees' supports logic if we want.
      // We will just fetch all for simplicity or verify if 'department_id' param is needed.
      let url = "http://localhost:5000/api/employees";
      if (user.role === "head" && user.departmentId) {
        url += `?department_id=${user.departmentId}`;
      }

      const response = await fetch(url);
      const data = await response.json();
      if (data.success) {
        setEmployees(data.data);
      }
    } catch (error) {
      console.error("Failed to load employees", error);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...formData,
        reviewer_id: user.employeeDbId, // Assumes logged in user is reviewer
      };

      const response = await performanceService.create(payload);
      if (response.success) {
        navigate("/performance");
      } else {
        alert("Failed: " + response.message);
      }
    } catch (error) {
      console.error(error);
      alert("Error creating review");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="performance-container">
      <div className="performance-header">
        <h1>New Performance Review</h1>
        <button
          onClick={() => navigate("/performance")}
          className="btn btn-outline"
        >
          Cancel
        </button>
      </div>

      <form onSubmit={handleSubmit} className="review-form">
        <div className="review-section">
          <h3>Basic Info</h3>
          <div className="form-group">
            <label>Employee</label>
            <select
              name="employee_id"
              value={formData.employee_id}
              onChange={handleChange}
              required
            >
              <option value="">Select Employee</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.first_name} {emp.last_name} ({emp.employee_id})
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Review Period</label>
            <input
              type="text"
              name="review_period"
              value={formData.review_period}
              onChange={handleChange}
              placeholder="e.g., Q1 2025"
              required
            />
          </div>
          <div className="form-group">
            <label>Date</label>
            <input
              type="date"
              name="review_date"
              value={formData.review_date}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="review-section">
          <h3>Assessment (1-5)</h3>
          <div className="form-group">
            <label>Rating: {formData.rating}</label>
            <input
              type="range"
              name="rating"
              min="1"
              max="5"
              value={formData.rating}
              onChange={handleChange}
              style={{ width: "100%" }}
            />
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: "0.8rem",
                color: "#666",
              }}
            >
              <span>Poor</span>
              <span>Excellent</span>
            </div>
          </div>
        </div>

        <div className="review-section">
          <h3>Feedback</h3>
          <div className="form-group">
            <label>Key Strengths</label>
            <textarea
              name="strengths"
              value={formData.strengths}
              onChange={handleChange}
              rows="3"
              required
            />
          </div>
          <div className="form-group">
            <label>Areas for Improvement</label>
            <textarea
              name="improvements"
              value={formData.improvements}
              onChange={handleChange}
              rows="3"
              required
            />
          </div>
          <div className="form-group">
            <label>Goals for Next Period</label>
            <textarea
              name="goals"
              value={formData.goals}
              onChange={handleChange}
              rows="3"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          className="btn btn-primary"
          style={{ width: "100%" }}
          disabled={loading}
        >
          {loading ? "Submitting..." : "Submit Review"}
        </button>
      </form>
    </div>
  );
};

export default PerformanceForm;
