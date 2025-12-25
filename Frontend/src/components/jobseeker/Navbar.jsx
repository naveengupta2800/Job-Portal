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
          <Link to="/saved">Saved Jobs ({savedCount})</Link>
          <Link to="/profile">Profile</Link>
          <Link to="/applied">Applied Jobs</Link>
        </div>
      </div>

      <div className="search-filter">
        <button className="btn ghost" onClick={handleLogout}>
          Logout
        </button>
      </div>

      {showFilter && (
        <div style={{ position: "absolute", right: 20, top: 70 }}>
          <div className="filter-panel">
            <div className="filter-row">
              <label className="small">Location</label>
              <input className="input" placeholder="e.g., Remote, New York" />
            </div>

            <div className="filter-row">
              <label className="small">Job Type</label>
              <select className="input">
                <option>Any</option>
                <option>Full-time</option>
                <option>Part-time</option>
                <option>Contract</option>
                <option>Remote</option>
              </select>
            </div>

            <div className="filter-row">
              <label className="small">Salary Range</label>
              <select className="input">
                <option>Any</option>
                <option>$40k - $70k</option>
                <option>$70k - $100k</option>
                <option>$100k+</option>
              </select>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
              <button
                className="btn outline"
                onClick={() => setShowFilter(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
