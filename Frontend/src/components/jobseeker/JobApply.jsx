import React, { useEffect, useState } from "react";
import api from "../utils/api";
import "./style.css";

export default function JobApply() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    fetchApplications();
  }, [statusFilter]);

 const fetchApplications = async () => {
  setLoading(true);
  setError("");
  try {
    const res = await api.get(
      `/api/apply/me${statusFilter ? `?status=${statusFilter}` : ""}`
    );

    setApplications(res.data.applications || []);
  } catch (err) {
    setError(err.response?.data?.message || "Server error");
  } finally {
    setLoading(false);
  }
};


const withdrawApplication = async (id) => {
  if (!window.confirm("Withdraw this application?")) return;

  try {
    await api.delete(`/api/apply/${id}`);

    setApplications((prev) => prev.filter((a) => a._id !== id));
  } catch (err) {
    alert(err.response?.data?.message || "Error");
  }
};


  const statusClass = (status) =>
    status?.toLowerCase().replace(/\s+/g, "") || "";

  if (loading) return <p className="loading">Loading applications...</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <div className="job-apply-container">
      {/* HEADER */}
      <div className="header-row">
        <h2>My Applications</h2>

        <select
          className="status-filter"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Status</option>
          <option value="Applied">Applied</option>
          <option value="Under Review">Under Review</option>
          <option value="Shortlisted">Shortlisted</option>
          <option value="Interview">Interview</option>
          <option value="Rejected">Rejected</option>
          <option value="Hired">Hired</option>
        </select>
      </div>

      {/* TABLE */}
      <div className="table-wrapper">
        <table className="applications-table">
          <thead>
            <tr>
              <th>Job</th>
              <th>Company</th>
              <th>Status</th>
              <th>Applied on</th>
              <th>Interview</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {applications.length === 0 ? (
              <tr>
                <td colSpan="6" className="center muted">
                  No applications found
                </td>
              </tr>
            ) : (
              applications.map((app) => (
                <tr key={app._id}>
                  <td>
                    <strong>{app.job?.title || "Job deleted"}</strong>
                  </td>

                  <td>{app.job?.company || "N/A"}</td>

                  <td>
                    <span className={`status ${statusClass(app.status)}`}>
                      {app.status || "N/A"}
                    </span>
                  </td>

                  <td className="timeline-cell">
                    {app.timeline?.length ? (
                      app.timeline.map((t, i) => (
                        <div key={i}>
                          {t.status} –{" "}
                          {t.date
                            ? new Date(t.date).toLocaleDateString()
                            : "N/A"}
                        </div>
                      ))
                    ) : (
                      <span className="muted">—</span>
                    )}
                  </td>

                  <td>
                    {app.interview?.date ? (
                      <>
                        <div>
                          <b>Date:</b>{" "}
                          {new Date(
                            app.interview.date
                          ).toLocaleDateString()}
                        </div>
                        <div>
                          <b>Time:</b> {app.interview.time || "N/A"}
                        </div>
                        <div>
                          <b>Mode:</b> {app.interview.mode || "N/A"}
                        </div>
                      </>
                    ) : (
                      <span className="muted">—</span>
                    )}
                  </td>

                  <td>
                    {app.status !== "Interview" &&
                      app.status !== "Hired" && (
                        <button
                          className="btn outline"
                          onClick={() =>
                            withdrawApplication(app._id)
                          }
                        >
                          Withdraw
                        </button>
                      )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
