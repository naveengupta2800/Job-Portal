import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./Login.css";
import bgImage from "../../assets/lg.png";
import api from "../utils/api";

const Login = ({ setUserRole }) => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post("/api/auth/login", formData, {
        withCredentials: true,
      });

      const role = res.data.role;
      setUserRole(role);

      // role-based navigation
      if (role === "jobseeker") navigate("/");
      else if (role === "recruiter") navigate("/");
    } catch (err) {
      alert(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div
        className="login-image"
        style={{ backgroundImage: `url(${bgImage})` }}
      >
        <div className="image-overlay"></div>
      </div>

      <div className="login-form-wrapper">
        <div className="login-card">
          <h2>Login</h2>

          {/* ✅ autofill fix */}
          <form onSubmit={handleLogin} autoComplete="off">
            {/* hidden dummy fields (Chrome trick) */}
            <input type="text" name="fakeuser" style={{ display: "none" }} />
            <input type="password" name="fakepass" style={{ display: "none" }} />

            <div className="input-group">
              <input
                type="email"
                name="email"
                placeholder="Email address"
                value={formData.email}
                onChange={handleChange}
                autoComplete="new-email"
                required
              />
            </div>

            <div className="input-group">
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                autoComplete="new-password"
                required
              />
            </div>

            <button type="submit" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <p className="register-link">
            Don’t have an account? <Link to="/register">Register</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
