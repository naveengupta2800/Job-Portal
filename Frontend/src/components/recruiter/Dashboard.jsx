import React, { useEffect, useState } from "react";
import api from "../utils/api";
import "./style.css";

export default function Dashboard() {
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [jobDetails, setJobDetails] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [summary, setSummary] = useState({
    totalJobs: 0,
    totalApplications: 0,
    shortlisted: 0,
    hired: 0,
  });

  /* ================= FETCH ON LOAD ================= */
  useEffect(() => {
    fetchJobs();
    fetchSummary();

    const interval = setInterval(() => {
      fetchJobs();
      fetchSummary();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  /* ================= JOB LIST ================= */
  const fetchJobs = async () => {
    try {
      const res = await api.get("/api/jobs/recruiter/all");
      setJobs(res.data.jobs || []);
      setFilteredJobs(res.data.jobs || []);
    } catch (err) {
      console.error("Error fetching jobs:", err);
    }
  };

  /* ================= DASHBOARD SUMMARY ================= */
  const fetchSummary = async () => {
    try {
      const res = await api.get(
        "/api/apply/recruiter/dashboard-summary"
      );
      setSummary(res.data);
    } catch (err) {
      console.error("Error fetching summary:", err);
    }
  };

  /* ================= SEARCH ================= */
  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);

    if (!value) {
      setFilteredJobs(jobs);
      return;
    }

    const filtered = jobs.filter(
      (j) =>
        j.title?.toLowerCase().includes(value) ||
        j.company?.toLowerCase().includes(value) ||
        j.location?.toLowerCase().includes(value)
    );

    setFilteredJobs(filtered);
  };

  /* ================= UI ================= */
  return (
    <div className="dashboard-container">
      {/* SUMMARY CARDS */}
      <div className="summary-cards">
        <div className="card">
          <div>Jobs Posted</div>
          <div className="count">{summary.totalJobs}</div>
        </div>

        <div className="card">
          <div>Applications Received</div>
          <div className="count">{summary.totalApplications}</div>
        </div>

        <div className="card">
          <div>Shortlisted</div>
          <div className="count">{summary.shortlisted}</div>
        </div>

        <div className="card">
          <div>Hired</div>
          <div className="count">{summary.hired}</div>
        </div>
      </div>

      {/* SEARCH */}
      <div className="search-filter">
        <input
          type="text"
          placeholder="Search jobs..."
          value={searchTerm}
          onChange={handleSearch}
        />
      </div>

      {/* JOB CARDS */}
      <div className="jobs-grid">
        {filteredJobs.length ? (
          filteredJobs.map((job) => (
            <div key={job._id} className="job-card">
              <div>
                <h4>{job.title}</h4>
                <p>
                  {job.company} • {job.location}{" "}
                  {job.salary && `• ${job.salary}`}
                </p>
              </div>

              <div className="card-actions">
                <button
                  className="btn secondary"
                  onClick={() => setJobDetails(job)}
                >
                  View Details
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="muted">No jobs found</p>
        )}
      </div>

      {/* JOB DETAILS PANEL */}
      {jobDetails && (
        <div className="job-details-panel">
          <h3>{jobDetails.title}</h3>
          <p>
            <b>Company:</b> {jobDetails.company}
          </p>
          <p>
            <b>Location:</b> {jobDetails.location}
          </p>
          <p>
            <b>Salary:</b> {jobDetails.salary || "N/A"}
          </p>
          <p>
            <b>Experience:</b> {jobDetails.experience || "N/A"}
          </p>
          <p>
            <b>Employment Type:</b>{" "}
            {jobDetails.employmentType || "N/A"}
          </p>
          <p>
            <b>Skills:</b>{" "}
            {jobDetails.skillsRequired?.join(", ") || "N/A"}
          </p>
          <p>
            <b>Description:</b>{" "}
            {jobDetails.description || "N/A"}
          </p>

          <button
            className="btn outline"
            onClick={() => setJobDetails(null)}
          >
            Close Details
          </button>
        </div>
      )}
    </div>
  );
}
