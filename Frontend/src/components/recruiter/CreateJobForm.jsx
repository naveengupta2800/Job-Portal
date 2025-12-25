import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import "./style.css";

export default function CreateJobForm() {
  const [form, setForm] = useState({
    title: "",
    company: "",
    location: "",
    type: "Full-Time",
    salary: "",
    description: "",
    requirements: "",
    experience: "",
    skills: "",
    closeDate: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  /* ================= HANDLERS ================= */
  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const resetForm = () => {
    setForm({
      title: "",
      company: "",
      location: "",
      type: "Full-Time",
      salary: "",
      description: "",
      requirements: "",
      experience: "",
      skills: "",
      closeDate: "",
    });
    setError("");
  };

  /* ================= SUBMIT (POST) ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");

      const payload = {
        title: form.title,
        company: form.company,
        location: form.location,
        employmentType: form.type,
        salary: form.salary,
        description: form.description,
        experience: form.experience,
        skillsRequired: form.skills
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        responsibility: form.requirements
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        closeDate: form.closeDate || null,
      };

      await api.post("/api/jobs/create", payload);

      alert("Job created successfully!");
      navigate("/my-jobs");
    } catch (err) {
      setError(
        err.response?.data?.message || "Server error while creating job"
      );
    } finally {
      setLoading(false);
    }
  };

  /* ================= UI ================= */
  return (
    <div className="job">
      <div className="header-row">
        <div>
          <h2>Create New Job</h2>
          <div className="muted">Post a job to attract candidates</div>
        </div>
      </div>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <form
        onSubmit={handleSubmit}
        style={{ maxWidth: 820, display: "grid", gap: 12 }}
      >
        {/* Job Title & Company */}
        <div style={{ display: "flex", gap: 12 }}>
          <label>
            <span className="required-star">*</span> Job Title
            <input
              required
              name="title"
              placeholder="Job Title"
              className="input"
              value={form.title}
              onChange={handleChange}
            />
          </label>

          <label>
            <span className="required-star">*</span> Company
            <input
              required
              name="company"
              placeholder="Company"
              className="input"
              value={form.company}
              onChange={handleChange}
            />
          </label>
        </div>

        {/* Location, Type, Salary */}
        <div style={{ display: "flex", gap: 12 }}>
          <label>
            <span className="required-star">*</span> Location
            <input
              required
              name="location"
              placeholder="Location"
              className="input"
              value={form.location}
              onChange={handleChange}
            />
          </label>

          <label>
            Type
            <select
              name="type"
              className="input"
              value={form.type}
              onChange={handleChange}
            >
              <option>Full-Time</option>
              <option>Part-Time</option>
              <option>Internship</option>
              <option>Remote</option>
              <option>Contract</option>
            </select>
          </label>

          <label>
            Salary Range
            <input
              name="salary"
              placeholder="Salary Range"
              className="input"
              value={form.salary}
              onChange={handleChange}
            />
          </label>
        </div>

        {/* Experience, Skills, Closing Date */}
        <div style={{ display: "flex", gap: 12 }}>
          <label>
            Experience
            <input
              name="experience"
              placeholder="Experience Required (e.g., 2-5 years)"
              className="input"
              value={form.experience}
              onChange={handleChange}
            />
          </label>

          <label>
            Skills
            <input
              name="skills"
              placeholder="Skills Required (comma separated)"
              className="input"
              value={form.skills}
              onChange={handleChange}
            />
          </label>

          <label>
            Closing Date
            <input
              type="date"
              name="closeDate"
              className="input"
              value={form.closeDate}
              onChange={handleChange}
            />
          </label>
        </div>

        {/* Description & Responsibilities */}
        <label>
          <span className="required-star">*</span> Description
          <textarea
            required
            name="description"
            placeholder="Description"
            rows="6"
            className="input"
            value={form.description}
            onChange={handleChange}
          />
        </label>

        <label>
          Responsibilities
          <input
            name="requirements"
            placeholder="Responsibilities (comma separated)"
            className="input"
            value={form.requirements}
            onChange={handleChange}
          />
        </label>

        {/* Buttons */}
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button
            type="button"
            className="btn outline"
            onClick={resetForm}
            disabled={loading}
          >
            Reset
          </button>

          <button type="submit" className="btn primary" disabled={loading}>
            {loading ? "Creating..." : "Create Job"}
          </button>
        </div>
      </form>
    </div>
  );
}
