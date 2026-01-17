import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Login.css";

const Login = () => {
  const [activeTab, setActiveTab] = useState("employee"); // 'employee', 'head', 'admin'
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await login(email, password, activeTab);

      if (response.success) {
        // Optional: specific redirection based on role/tab could be done here if needed
        navigate("/dashboard");
      } else {
        setError(response.message || "Login failed");
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Login failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: "employee", label: "Employee", icon: "👤" },
    { id: "head", label: "Head", icon: "👔" },
    { id: "admin", label: "Admin", icon: "🛡️" },
  ];

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <img
            src="/src/assets/hu.png"
            alt="Haramaya University"
            className="login-logo"
          />
          <h1>Haramaya University</h1>
          <h2>Employee Management System</h2>
        </div>

        <div className="login-tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`tab-btn ${activeTab === tab.id ? "active" : ""}`}
              onClick={() => {
                setActiveTab(tab.id);
                setError("");
              }}
              type="button"
            >
              <span className="tab-icon">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        <div className={`role-indicator rule-${activeTab}`}>
          {activeTab === "admin"
            ? "Use your admin credentials to sign in"
            : `Use your ${
                activeTab === "head" ? "Head" : "Employee"
              } Email & ID to sign in`}
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && <div className="alert alert-error">{error}</div>}

          <div className="form-group">
            <label htmlFor="email">
              {activeTab === "admin" ? "Username / Email" : "Email Address"}
            </label>
            <input
              type="text"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={
                activeTab === "admin"
                  ? "Enter username or email"
                  : "Enter your email"
              }
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">
              {activeTab === "admin" ? "Password" : "Employee ID"}
            </label>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={
                  activeTab === "admin"
                    ? "Enter your password"
                    : "Enter your Employee ID (e.g., HU001)"
                }
                required
                disabled={loading}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? "👁️" : "🙈"}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className={`btn btn-primary btn-lg btn-${activeTab}`}
            style={{ width: "100%" }}
            disabled={loading}
          >
            {loading
              ? "Signing in..."
              : `Sign In as ${
                  activeTab.charAt(0).toUpperCase() + activeTab.slice(1)
                }`}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
