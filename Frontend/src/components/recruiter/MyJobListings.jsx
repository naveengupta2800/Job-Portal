import React, { useEffect, useState } from "react";
import api from "../utils/api";
import "./style.css";

export default function MyJobListings() {
  const [jobs, setJobs] = useState([]);
  const [jobDetails, setJobDetails] = useState(null);

  const [filters, setFilters] = useState({
    type: "",
    location: "",
    postedOn: "",
    lastDate: "",
    closeDate: "",
  });

  const [sortConfig, setSortConfig] = useState({
    key: "",
    direction: "asc",
  });

  /* ================= FETCH JOBS ================= */
  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const res = await api.get("/api/jobs/recruiter/all");
      setJobs(res.data.jobs || []);
    } catch (err) {
      console.error("Error fetching jobs:", err);
    }
  };

  /* ================= DELETE JOB ================= */
  const deleteJob = async (jobId) => {
    if (!window.confirm("Are you sure you want to delete this job?")) return;

    try {
      await api.delete(`/api/jobs/delete/${jobId}`);
      setJobs((prev) => prev.filter((j) => j._id !== jobId));
      alert("Job deleted successfully!");
    } catch (err) {
      alert(
        err.response?.data?.message ||
          "Server error while deleting job"
      );
    }
  };

  /* ================= VIEW DETAILS ================= */
  const viewJobDetails = (job) => {
    setJobDetails(job);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /* ================= FILTER LOGIC ================= */
  const filteredJobs = jobs.filter((job) => {
    const today = new Date();

    if (filters.type && job.employmentType !== filters.type) return false;
    if (filters.location && job.location !== filters.location) return false;

    if (filters.postedOn && job.createdAt) {
      const postedDate = new Date(job.createdAt);
      const diffDays = (today - postedDate) / (1000 * 60 * 60 * 24);
      if (diffDays > Number(filters.postedOn)) return false;
    }

    if (filters.lastDate && job.lastDate) {
      const last = new Date(job.lastDate);
      if (filters.lastDate === "expired" && last >= today) return false;
      if (filters.lastDate === "upcoming" && last < today) return false;
    }

    if (filters.closeDate) {
      if (filters.closeDate === "open" && job.status === "Closed") return false;
      if (filters.closeDate === "closed" && job.status !== "Closed") return false;
    }

    return true;
  });

  /* ================= SORT LOGIC ================= */
  const sortedJobs = [...filteredJobs].sort((a, b) => {
    if (!sortConfig.key) return 0;

    let valA = a[sortConfig.key];
    let valB = b[sortConfig.key];

    if (["createdAt", "lastDate", "closeDate"].includes(sortConfig.key)) {
      valA = valA ? new Date(valA) : new Date(0);
      valB = valB ? new Date(valB) : new Date(0);
    }

    if (typeof valA === "string") {
      valA = valA.toLowerCase();
      valB = valB.toLowerCase();
    }

    if (valA < valB) return sortConfig.direction === "asc" ? -1 : 1;
    if (valA > valB) return sortConfig.direction === "asc" ? 1 : -1;
    return 0;
  });

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction:
        prev.key === key && prev.direction === "asc"
          ? "desc"
          : "asc",
    }));
  };

  /* ================= UI ================= */
  return (
    <div className="jobs-layout">
      {/* LEFT SIDE */}
      <div className="jobs-left">
        <div className="header-row">
          <h2>My Job Listings</h2>
        </div>

        <div className="table-wrapper">
          <table className="jobs-table">
            <thead>
              <tr>
                <th onClick={() => handleSort("title")}>
                  Title{" "}
                  {sortConfig.key === "title" &&
                    (sortConfig.direction === "asc" ? "▲" : "▼")}
                </th>

                <th>
                  Type
                  <select
                    className="th-filter"
                    value={filters.type}
                    onChange={(e) =>
                      setFilters({ ...filters, type: e.target.value })
                    }
                  >
                    <option value="">All</option>
                    <option value="Full-Time">Full-Time</option>
                    <option value="Part-Time">Part-Time</option>
                    <option value="Internship">Internship</option>
                  </select>
                </th>

                <th>
                  Location
                  <select
                    className="th-filter"
                    value={filters.location}
                    onChange={(e) =>
                      setFilters({
                        ...filters,
                        location: e.target.value,
                      })
                    }
                  >
                    <option value="">All</option>
                    {[...new Set(jobs.map((j) => j.location))].map(
                      (loc) => (
                        <option key={loc} value={loc}>
                          {loc}
                        </option>
                      )
                    )}
                  </select>
                </th>

                <th onClick={() => handleSort("createdAt")}>
                  Posted On
                </th>
                <th onClick={() => handleSort("lastDate")}>
                  Last Date
                </th>
                <th onClick={() => handleSort("closeDate")}>
                  Close Date
                </th>
                <th onClick={() => handleSort("status")}>
                  Status
                </th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {sortedJobs.length ? (
                sortedJobs.map((job) => (
                  <tr key={job._id}>
                    <td>
                      <strong>{job.title}</strong>
                    </td>
                    <td>{job.employmentType || "N/A"}</td>
                    <td>{job.location || "N/A"}</td>
                    <td>
                      {job.createdAt
                        ? new Date(job.createdAt).toLocaleDateString()
                        : "N/A"}
                    </td>
                    <td>
                      {job.lastDate
                        ? new Date(job.lastDate).toLocaleDateString()
                        : "N/A"}
                    </td>
                    <td>
                      {job.closeDate
                        ? new Date(job.closeDate).toLocaleDateString()
                        : "—"}
                    </td>
                    <td>
                      <span
                        className={`status ${job.status?.toLowerCase()}`}
                      >
                        {job.status || "Open"}
                      </span>
                    </td>
                    <td className="actions">
                      <button
                        className="btn secondary"
                        onClick={() => viewJobDetails(job)}
                      >
                        View
                      </button>
                      <button
                        className="btn delete"
                        onClick={() => deleteJob(job._id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="center muted">
                    No jobs found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className={`jobs-right ${jobDetails ? "open" : ""}`}>
        {jobDetails ? (
          <div className="job-details-panel">
            <h3>{jobDetails.title}</h3>
            <p>
              <strong>Company:</strong> {jobDetails.company}
            </p>
            <p>
              <strong>Location:</strong> {jobDetails.location}
            </p>
            <p>
              <strong>Salary:</strong>{" "}
              {jobDetails.salary || "N/A"}
            </p>
            <p>
              <strong>Experience:</strong>{" "}
              {jobDetails.experience || "N/A"}
            </p>
            <p>
              <strong>Type:</strong>{" "}
              {jobDetails.employmentType || "N/A"}
            </p>
            <p>
              <strong>Skills:</strong>{" "}
              {jobDetails.skillsRequired?.join(", ") || "N/A"}
            </p>
            <div className="desc">
              {jobDetails.description || "No description provided"}
            </div>
            <button
              className="btn outline"
              style={{ marginTop: 16 }}
              onClick={() => setJobDetails(null)}
            >
              Close
            </button>
          </div>
        ) : (
          <div className="empty-panel">
            Select a job to view details
          </div>
        )}
      </div>
    </div>
  );
}
