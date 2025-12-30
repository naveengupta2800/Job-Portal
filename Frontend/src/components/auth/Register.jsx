import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import "./Register.css";
import bgImage from "../../assets/lg.png";

const Register = ({ setUserRole }) => {
  const [step, setStep] = useState("register");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
  });

  const [otp, setOtp] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  // ---------------- REGISTER ----------------
  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await api.post("/api/auth/register", formData, {
        withCredentials: true
      });

      alert("OTP sent to your email!");
      setStep("verify");
    } catch (err) {
      alert(err.response?.data?.message || "Server error");
    }
  };

  // ---------------- VERIFY OTP ----------------
  const handleVerify = async (e) => {
    e.preventDefault();
    try {
      await api.post(
        "/api/auth/verify",
        { otp },
        { withCredentials: true }
      );

      const roleRes = await api.get("/api/auth/get-role", {
        withCredentials: true
      });

      setUserRole(roleRes.data.role);

      alert("Account verified and logged in!");
      navigate("/");
    } catch (err) {
      alert(err.response?.data?.message || "Server error");
    }
  };

  return (
    <div className="register-wrapper">
      <div
        className="register-image"
        style={{ backgroundImage: `url(${bgImage})` }}
      >
        <div className="image-overlay"></div>
      </div>

      <div className="register-form-wrapper">
        <div className="auth-card">

          {/* ---------------- REGISTER STEP ---------------- */}
          {step === "register" && (
            <div className="auth-section fade-in">
              <h2>Create an Account</h2>
              <p className="subtitle">Join our job portal today</p>

              <form
                onSubmit={handleRegister}
                className="auth-form"
                autoComplete="off"
              >
                <input name="fakeuser" style={{ display: "none" }} />
                <input name="fakepass" style={{ display: "none" }} />

                <input
                  name="name"
                  placeholder="Full Name"
                  onChange={handleChange}
                  required
                />

                <input
                  name="email"
                  type="email"
                  placeholder="Email Address"
                  onChange={handleChange}
                  required
                />

                <select
                  name="role"
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Role</option>
                  <option value="jobseeker">Job Seeker</option>
                  <option value="recruiter">Recruiter</option>
                </select>

                <input
                  name="password"
                  type="password"
                  placeholder="Password"
                  onChange={handleChange}
                  required
                />

                <button type="submit" className="btn-primary">
                  Sign Up
                </button>
              </form>

              <p className="switch">
                Already have an account?{" "}
                <span onClick={() => navigate("/login")}>Login</span>
              </p>
            </div>
          )}

          {/* ---------------- VERIFY STEP ---------------- */}
          {step === "verify" && (
            <div className="auth-section fade-in">
              <h2>Email Verification</h2>
              <p className="subtitle">
                OTP sent to <b>{formData.email}</b>
              </p>

              <form
                onSubmit={handleVerify}
                className="auth-form"
                autoComplete="off"
              >
                <input
                  placeholder="Enter OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                />

                <button type="submit" className="btn-primary">
                  Verify Account
                </button>

                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setStep("register")}
                >
                  Go Back
                </button>
              </form>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default Register;
