import React, { useEffect, useState } from "react";
import api from "../utils/api";
import "./style.css";

export default function RecruiterApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  /* ================= FETCH APPLICATIONS ================= */
  useEffect(() => {
    fetchApplications();
  }, [statusFilter]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError("");

      // 1️⃣ Recruiter jobs
      const jobsRes = await api.get("/api/jobs/recruiter/all");
      const jobs = jobsRes.data.jobs || [];

      let allApps = [];

      // 2️⃣ Applications per job
      for (const job of jobs) {
        const appsRes = await api.get(`/api/apply/job/${job._id}`);
        if (appsRes.data.applications) {
          allApps.push(...appsRes.data.applications);
        }
      }

      // 3️⃣ Status filter
      if (statusFilter !== "All") {
        allApps = allApps.filter((app) => app.status === statusFilter);
      }

      setApplications(allApps);
    } catch (err) {
      setError(
        err.response?.data?.message || "Server error while fetching applications"
      );
    } finally {
      setLoading(false);
    }
  };

  /* ================= UPDATE STATUS (PATCH) ================= */
  const updateStatus = async (applicationId, status) => {
    try {
      await api.patch(`/api/apply/${applicationId}/status`, { status });

      setApplications((prev) =>
        prev.map((app) =>
          app._id === applicationId ? { ...app, status } : app
        )
      );
    } catch (err) {
      alert(
        err.response?.data?.message || "Failed to update application status"
      );
    }
  };

  /* ================= UI ================= */
  return (
    <div className="applications-table-container">
      <h2>Applications Received</h2>

      <div className="filter-row">
        <label>Status:</label>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          {["All", "Applied", "Shortlisted", "Rejected", "Hired"].map(
            (status) => (
              <option key={status} value={status}>
                {status}
              </option>
            )
          )}
        </select>
      </div>

      {loading && <p>Loading applications...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      {!loading && applications.length === 0 && (
        <p>No applications found</p>
      )}

      {applications.length > 0 && (
        <table className="applications-table">
          <thead>
            <tr>
              <th>Job Title</th>
              <th>Applicant Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Resume</th>
              <th>Status</th>
              <th>Applied On</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {applications.map((app) => (
              <tr key={app._id}>
                <td>{app.job?.title || "N/A"}</td>
                <td>{app.applicant?.name || "N/A"}</td>
                <td>{app.applicant?.email || "N/A"}</td>
                <td>{app.applicant?.phone || "N/A"}</td>

                <td>
                  {app.resume ? (
                    <a
                      href={`${import.meta.env.VITE_API_URL}${app.resume}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      View Resume
                    </a>
                  ) : (
                    "N/A"
                  )}
                </td>

                <td>
                  <span
                    className={`status ${app.status?.toLowerCase()}`}
                  >
                    {app.status || "Unknown"}
                  </span>
                </td>

                <td>
                  {app.createdAt
                    ? new Date(app.createdAt).toLocaleDateString()
                    : "N/A"}
                </td>

                <td className="action-buttons">
                  {app.status === "Applied" && (
                    <button
                      className="accept-btn"
                      onClick={() =>
                        updateStatus(app._id, "Shortlisted")
                      }
                    >
                      Shortlist
                    </button>
                  )}

                  {["Shortlisted", "Interview"].includes(app.status) && (
                    <button
                      className="hire-btn"
                      onClick={() => updateStatus(app._id, "Hired")}
                    >
                      Hire
                    </button>
                  )}

                  {app.status !== "Hired" && (
                    <button
                      className="reject-btn"
                      onClick={() =>
                        updateStatus(app._id, "Rejected")
                      }
                    >
                      Reject
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
