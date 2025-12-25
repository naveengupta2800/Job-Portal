import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "./style.css";

export default function RecruiterSidebar({ onLogout }) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await onLogout(); // backend logout handled in parent
    } finally {
      navigate("/login");
    }
  };

  return (
    <aside className="recruiter-sidebar">
      <div className="logo">Recruiter</div>

      <nav className="nav-links">
        <NavLink to="/recruiter" end>
          {({ isActive }) => (
            <span className={isActive ? "active" : ""}>Dashboard</span>
          )}
        </NavLink>

        <NavLink to="/create-job">
          {({ isActive }) => (
            <span className={isActive ? "active" : ""}>Create Job</span>
          )}
        </NavLink>

        <NavLink to="/my-jobs">
          {({ isActive }) => (
            <span className={isActive ? "active" : ""}>My Job Listings</span>
          )}
        </NavLink>

        <NavLink to="/applications">
          {({ isActive }) => (
            <span className={isActive ? "active" : ""}>Applications</span>
          )}
        </NavLink>

        <NavLink to="/recruiter/profile">
          {({ isActive }) => (
            <span className={isActive ? "active" : ""}>Profile</span>
          )}
        </NavLink>
      </nav>

      <button className="btn outline logout-btn" onClick={handleLogout}>
        Logout
      </button>
    </aside>
  );
}
