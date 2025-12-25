import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../utils/api";
import "./style.css";

export default function Navbar({ onLogout, savedCount = 0 }) {
  const [query, setQuery] = useState("");
  const [showFilter, setShowFilter] = useState(false);
  const navigate = useNavigate();

  // ✅ LOGOUT → POST
  const handleLogout = async () => {
    try {
      await api.post("/api/auth/logout");
      onLogout();            // state clear (userRole = null)
      navigate("/login");
    } catch (err) {
      alert("Logout failed");
    }
  };

  return (
    <div className="navbar">
      <div className="nav-left">
        <div className="brand">Job Matchers</div>

        <div className="nav-links">
          <Link to="/">Home</Link>
          <Link to="/saved">Saved Jobs</Link>
          <Link to="/profile">Profile</Link>
          <Link to="/applied">Applied Jobs</Link>
        </div>
      </div>

      <div className="search-filter">
        <button className="btn ghost" onClick={handleLogout}>
          Logout
        </button>
      </div>

    </div>
  );
}
