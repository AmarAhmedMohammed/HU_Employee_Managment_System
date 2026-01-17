import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import "./Navbar.css";

const Navbar = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const handleLogout = async () => {
    if (window.confirm("Are you sure you want to logout?")) {
      await logout();
      window.location.href = "/login";
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <img
            src="/src/assets/hu.png"
            alt="Haramaya University"
            className="navbar-logo"
          />
          <div className="navbar-title">
            <h1>Haramaya University</h1>
            <span>Employee Management System</span>
          </div>
        </div>

        <div className="navbar-user">
          <button
            onClick={toggleTheme}
            className="btn btn-secondary btn-sm"
            style={{
              marginRight: "0.5rem",
              fontSize: "1.2rem",
              padding: "0.2rem 0.6rem",
            }}
            title={
              theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"
            }
          >
            {theme === "dark" ? "☀️" : "🌙"}
          </button>
          <div className="user-info">
            <span className="user-name">
              {user?.firstName} {user?.lastName}
            </span>
            <span className="user-role">{user?.role?.replace("_", " ")}</span>
          </div>
          <button onClick={handleLogout} className="btn btn-outline btn-sm">
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
