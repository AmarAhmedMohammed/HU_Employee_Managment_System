import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import performanceService from "../../services/performanceService";
import "./Performance.css";

const PerformanceList = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchReviews();
  }, [user]);

  const fetchReviews = async () => {
    try {
      const params = {};
      // If employee, only show their reviews (though backend should enforce this too)
      if (user.role === "employee") {
        params.employee_id = user.employeeDbId;
      }

      const response = await performanceService.getAll(params);
      if (response.success) {
        setReviews(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  const getRatingColor = (rating) => {
    if (rating >= 4) return "rating-high";
    if (rating >= 3) return "rating-med";
    return "rating-low";
  };

  return (
    <div className="performance-container">
      <div className="performance-header">
        <h1>Performance Reviews</h1>
        {["admin", "head"].includes(user.role) && (
          <button
            onClick={() => navigate("/performance/add")}
            className="btn btn-primary"
          >
            + New Review
          </button>
        )}
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : (
        <table className="performance-table">
          <thead>
            <tr>
              <th>Employee</th>
              <th>Review Period</th>
              <th>Rating</th>
              <th>Reviewer</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {reviews.map((review) => (
              <tr key={review.id}>
                <td>
                  {review.employee_name} <br />
                  <small className="text-muted">{review.emp_code}</small>
                </td>
                <td>{review.review_period}</td>
                <td>
                  <span
                    className={`rating-badge ${getRatingColor(review.rating)}`}
                  >
                    {review.rating} / 5
                  </span>
                </td>
                <td>{review.reviewer_name}</td>
                <td>{new Date(review.review_date).toLocaleDateString()}</td>
                <td>
                  <button className="btn btn-sm btn-outline">View</button>
                </td>
              </tr>
            ))}
            {reviews.length === 0 && (
              <tr>
                <td colSpan="6" style={{ textAlign: "center" }}>
                  No reviews found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default PerformanceList;
